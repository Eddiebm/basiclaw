import { NextResponse } from "next/server";
import {
  MIN_TEXT_CHARS,
  normaliseAuditType,
  runAuditPipeline,
} from "@/lib/audit-engine";
import type { AuditType } from "@/lib/audit-types";

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
    return NextResponse.json({ report: outcome.report });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[audit] error", message);
    return NextResponse.json({ error: "audit_failed", message }, { status: 400 });
  }
}
