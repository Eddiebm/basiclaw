import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import {
  MIN_TEXT_CHARS,
  normaliseAuditType,
  runAuditPipeline,
} from "@/lib/audit-engine";
import type { AuditReport, AuditType } from "@/lib/audit-types";
import { getCurrentUserId } from "@/lib/auth-config";
import { getUserPlanForUserId } from "@/lib/entitlements";
import {
  checkAdvancedAuditPaywall,
  checkAuditQuota,
  checkDemandLetterQuota,
  pricingPathForLocale,
  quotaJsonBody,
} from "@/lib/quota-check";
import { clientIp, hashIpForUsage } from "@/lib/request-ip";
import { getUsage, incrementUsage, saveAuditForUser } from "@/lib/storage";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  "application/pdf",
  "text/plain",
  "text/markdown",
  "text/html",
]);

interface AuditRequestPayload {
  text?: string;
  jurisdiction?: string;
  documentType?: string;
  auditType?: string;
}

async function extractFromForm(
  form: FormData
): Promise<{ text: string; jurisdiction: string; documentType?: string; auditType: AuditType; filename?: string }> {
  const file = form.get("file");
  const text = (form.get("text") as string | null) ?? "";
  const jurisdiction = ((form.get("jurisdiction") as string | null) ?? "us").toLowerCase();
  const documentType = (form.get("documentType") as string | null) ?? undefined;
  const auditType = normaliseAuditType(form.get("auditType") as string | null);

  let extracted = text;
  let filename: string | undefined;

  if (file && file instanceof File && file.size > 0) {
    if (file.size > MAX_BYTES) {
      throw new Error(`File too large \u2014 max ${Math.round(MAX_BYTES / 1024 / 1024)}MB.`);
    }
    if (file.type && !ALLOWED_MIME.has(file.type)) {
      throw new Error(`Unsupported file type "${file.type}". Upload a PDF or paste plain text instead.`);
    }
    filename = file.name;
    if (file.type === "application/pdf") {
      const buffer = Buffer.from(await file.arrayBuffer());
      const pdfParseModule = (await import("pdf-parse")) as unknown as { default?: (b: Buffer) => Promise<{ text: string }> } & ((b: Buffer) => Promise<{ text: string }>);
      const pdfParse = pdfParseModule.default ?? pdfParseModule;
      const result = await pdfParse(buffer);
      extracted = result.text;
    } else {
      extracted = await file.text();
    }
  }

  return { text: extracted.trim(), jurisdiction, documentType, auditType, filename };
}

async function extractFromJson(
  payload: AuditRequestPayload
): Promise<{ text: string; jurisdiction: string; documentType?: string; auditType: AuditType }> {
  return {
    text: (payload.text ?? "").trim(),
    jurisdiction: (payload.jurisdiction ?? "us").toLowerCase(),
    documentType: payload.documentType,
    auditType: normaliseAuditType(payload.auditType),
  };
}

export async function POST(request: Request) {
  try {
    const locale = request.headers.get("x-basiclaw-locale")?.trim() ?? null;
    const contentType = request.headers.get("content-type") ?? "";
    let extracted: { text: string; jurisdiction: string; documentType?: string; auditType: AuditType };
    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      extracted = await extractFromForm(form);
    } else {
      const payload = (await request.json()) as AuditRequestPayload;
      extracted = await extractFromJson(payload);
    }

    if (!extracted.text || extracted.text.length < MIN_TEXT_CHARS) {
      return NextResponse.json(
        { error: "too_short", message: `Need at least ${MIN_TEXT_CHARS} characters of document text. Paste more or upload a longer file.` },
        { status: 400 }
      );
    }

    const userId = await getCurrentUserId();
    const ipHash = hashIpForUsage(clientIp(request));
    const plan = await getUserPlanForUserId(userId);
    const usage = await getUsage(userId, ipHash);

    const paywall = checkAdvancedAuditPaywall(plan, extracted.auditType);
    if (!paywall.ok) {
      return NextResponse.json(
        { error: "paywall", message: paywall.message, upgradeUrl: pricingPathForLocale(locale) },
        { status: 429 }
      );
    }

    const aq = checkAuditQuota(plan, usage);
    if (!aq.ok) {
      return NextResponse.json(quotaJsonBody(aq.message, locale), { status: 429 });
    }

    if (extracted.auditType === "demand_letter") {
      const dq = checkDemandLetterQuota(plan, usage);
      if (!dq.ok) {
        return NextResponse.json(quotaJsonBody(dq.message, locale), { status: 429 });
      }
    }

    const outcome = await runAuditPipeline({
      text: extracted.text,
      jurisdiction: extracted.jurisdiction,
      documentType: extracted.documentType,
      auditType: extracted.auditType,
      source: "web",
    });

    if (!outcome.ok) {
      return NextResponse.json(
        { error: outcome.error, message: outcome.message },
        { status: outcome.status }
      );
    }

    const report = outcome.report as AuditReport;
    if (userId) {
      const title =
        report.documentType?.trim() ||
        extracted.documentType?.trim() ||
        `${report.auditType} audit`;
      await saveAuditForUser({
        id: randomUUID(),
        userId,
        auditType: report.auditType,
        jurisdiction: report.jurisdictionCode,
        title,
        report,
        updatedAt: new Date().toISOString(),
      });
    }

    await incrementUsage("audit", userId, ipHash).catch(() => {
      /* non-fatal */
    });
    if (extracted.auditType === "demand_letter") {
      await incrementUsage("demand_letter", userId, ipHash).catch(() => {
        /* non-fatal */
      });
    }

    return NextResponse.json({ report });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[audit] error", message);
    return NextResponse.json({ error: "audit_failed", message }, { status: 400 });
  }
}
