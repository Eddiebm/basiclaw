import { NextResponse } from "next/server";
import { getCountry } from "@/lib/jurisdictions";
import { LEGAL_SYSTEM_LABELS } from "@/data/types";
import type {
  AuditFocusSlot,
  AuditReport,
  AuditType,
  EmploymentStructuredFindings,
  LeaseStructuredFindings,
  RiskGrade,
  TermsStructuredFindings,
} from "@/lib/audit-types";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 5 * 1024 * 1024;
const MAX_TEXT_CHARS = 60_000;
const MIN_TEXT_CHARS = 200;
const ALLOWED_MIME = new Set([
  "application/pdf",
  "text/plain",
  "text/markdown",
  "text/html",
]);

const VALID_GRADES = new Set<RiskGrade>(["low", "moderate", "elevated", "high", "critical"]);
const VALID_AUDIT_TYPES = new Set<AuditType>(["general", "lease", "employment", "terms"]);

interface AuditRequestPayload {
  text?: string;
  jurisdiction?: string;
  documentType?: string;
  auditType?: string;
}

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://basiclaw.vercel.app";
}

function normaliseAuditType(value: string | null | undefined): AuditType {
  const v = (value ?? "general").toLowerCase();
  return VALID_AUDIT_TYPES.has(v as AuditType) ? (v as AuditType) : "general";
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

function clipText(text: string): string {
  if (text.length <= MAX_TEXT_CHARS) return text;
  return `${text.slice(0, MAX_TEXT_CHARS)}\n\n[\u2026 truncated for length \u2026]`;
}

const BASE_REPORT_TYPE = `interface AuditReport {
  documentType: string;
  overallRiskGrade: "low" | "moderate" | "elevated" | "high" | "critical";
  oneLineSummary: string;            // <= 160 chars
  redFlags: { title: string; why: string; pushback: string }[];   // 3 to 5
  positives: { title: string; why: string }[];                    // 2 to 3
  keyClausesToPushBackOn: { clause: string; pushback: string }[]; // 2 to 5
  askLawyerIfTriggers: { trigger: string; why: string }[];        // 2 to 4
}`;

const FOCUS_SLOT = '{ "summary": string, "pushback": string }';

function specialisedSchema(auditType: AuditType): string {
  switch (auditType) {
    case "lease":
      return `${BASE_REPORT_TYPE}

Also include this exact key with nested objects:
"leaseStructured": {
  "deposit": ${FOCUS_SLOT},
  "notice": ${FOCUS_SLOT},
  "renewal": ${FOCUS_SLOT}
}

Lease focus: security deposits and deductions, notice to quit / entry rules, renewal options and rent increases.`;
    case "employment":
      return `${BASE_REPORT_TYPE}

Also include:
"employmentStructured": {
  "intellectualProperty": ${FOCUS_SLOT},
  "nonCompete": ${FOCUS_SLOT},
  "atWill": ${FOCUS_SLOT}
}

Employment focus: IP assignment / inventions, non-compete and solicitation, at-will vs notice / cause language.`;
    case "terms":
      return `${BASE_REPORT_TYPE}

Also include:
"termsStructured": {
  "dataRights": ${FOCUS_SLOT},
  "arbitration": ${FOCUS_SLOT},
  "liabilityCap": ${FOCUS_SLOT}
}

Consumer / website terms focus: personal data use and deletion, arbitration / class-action waivers, liability caps and disclaimers.`;
    default:
      return BASE_REPORT_TYPE;
  }
}

function buildPrompt(input: {
  jurisdictionName: string;
  legalSystem: string;
  documentType?: string;
  text: string;
  auditType: AuditType;
}) {
  const docTypeLine = input.documentType
    ? `The user says this is a "${input.documentType}".`
    : "If you can infer the document type, name it (e.g. employment contract, residential lease, NDA, terms of service).";
  const typeHint =
    input.auditType === "lease"
      ? "Assume a residential or commercial tenancy agreement unless the text clearly says otherwise."
      : input.auditType === "employment"
        ? "Assume an employment agreement, offer letter, or contractor agreement unless clearly otherwise."
        : input.auditType === "terms"
          ? "Assume website / app terms of service or similar click-wrap terms unless clearly otherwise."
          : "";

  const schema = specialisedSchema(input.auditType);

  return `You are a senior contracts lawyer producing a plain-language risk audit for a non-lawyer in ${input.jurisdictionName} (${input.legalSystem}). ${docTypeLine}
${typeHint}

Return a single JSON object exactly matching this TypeScript shape:

${schema}

Rules:
- Output JSON only. No prose, no markdown, no code fences.
- Be specific and concrete. Quote the clause briefly where useful.
- "pushback" should be the exact one-sentence ask the user can put in writing.
- Bias toward what an ordinary person (not a corporate counterparty) cares about.
- If the document is too short, ambiguous, or clearly not a legal document, say so in oneLineSummary and use lower-grade risk plus shorter arrays — still return valid JSON.
- Do not invent statutes. If you cite something, name only well-known acts (e.g. UK Equality Act 2010, US FLSA).
${input.auditType !== "general" ? "- Include the specialised structured object (leaseStructured / employmentStructured / termsStructured) with all three slots filled even if the document is silent (then explain uncertainty in summary fields)." : ""}

Document text follows between <DOC> tags.

<DOC>
${clipText(input.text)}
</DOC>`;
}

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function parseFocusSlot(value: unknown): AuditFocusSlot | undefined {
  if (!value || typeof value !== "object") return undefined;
  const o = value as Record<string, unknown>;
  const summary = clean(o.summary);
  const pushback = clean(o.pushback);
  if (!summary && !pushback) return undefined;
  return { summary: summary || "Not clearly addressed in the excerpt.", pushback: pushback || "Ask the counterparty to clarify this point in writing." };
}

function parseLeaseStructured(value: unknown): LeaseStructuredFindings | undefined {
  if (!value || typeof value !== "object") return undefined;
  const o = value as Record<string, unknown>;
  const deposit = parseFocusSlot(o.deposit);
  const notice = parseFocusSlot(o.notice);
  const renewal = parseFocusSlot(o.renewal);
  if (!deposit || !notice || !renewal) return undefined;
  return { deposit, notice, renewal };
}

function parseEmploymentStructured(value: unknown): EmploymentStructuredFindings | undefined {
  if (!value || typeof value !== "object") return undefined;
  const o = value as Record<string, unknown>;
  const intellectualProperty = parseFocusSlot(o.intellectualProperty);
  const nonCompete = parseFocusSlot(o.nonCompete);
  const atWill = parseFocusSlot(o.atWill);
  if (!intellectualProperty || !nonCompete || !atWill) return undefined;
  return { intellectualProperty, nonCompete, atWill };
}

function parseTermsStructured(value: unknown): TermsStructuredFindings | undefined {
  if (!value || typeof value !== "object") return undefined;
  const o = value as Record<string, unknown>;
  const dataRights = parseFocusSlot(o.dataRights);
  const arbitration = parseFocusSlot(o.arbitration);
  const liabilityCap = parseFocusSlot(o.liabilityCap);
  if (!dataRights || !arbitration || !liabilityCap) return undefined;
  return { dataRights, arbitration, liabilityCap };
}

function parseReport(content: string, jurisdictionCode: string, jurisdictionName: string, auditType: AuditType): AuditReport {
  let raw = content.trim();
  if (raw.startsWith("```")) {
    raw = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  }
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start !== -1 && end !== -1) {
    raw = raw.slice(start, end + 1);
  }
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    throw new Error("Model did not return valid JSON. Try again or paste a shorter excerpt.");
  }
  const grade = String(parsed.overallRiskGrade ?? "moderate").toLowerCase() as RiskGrade;
  const safeGrade: RiskGrade = VALID_GRADES.has(grade) ? grade : "moderate";
  const arr = (value: unknown) => (Array.isArray(value) ? value : []);

  const report: AuditReport = {
    documentType: clean(parsed.documentType) || "Document",
    jurisdictionCode,
    jurisdictionName,
    overallRiskGrade: safeGrade,
    oneLineSummary: clean(parsed.oneLineSummary) || "Plain-language risk audit.",
    redFlags: arr(parsed.redFlags).map((item) => {
      const o = (item ?? {}) as Record<string, unknown>;
      return { title: clean(o.title), why: clean(o.why), pushback: clean(o.pushback) };
    }).filter((f) => f.title),
    positives: arr(parsed.positives).map((item) => {
      const o = (item ?? {}) as Record<string, unknown>;
      return { title: clean(o.title), why: clean(o.why) };
    }).filter((f) => f.title),
    keyClausesToPushBackOn: arr(parsed.keyClausesToPushBackOn).map((item) => {
      const o = (item ?? {}) as Record<string, unknown>;
      return { clause: clean(o.clause), pushback: clean(o.pushback) };
    }).filter((f) => f.clause),
    askLawyerIfTriggers: arr(parsed.askLawyerIfTriggers).map((item) => {
      const o = (item ?? {}) as Record<string, unknown>;
      return { trigger: clean(o.trigger), why: clean(o.why) };
    }).filter((f) => f.trigger),
    generatedAt: new Date().toISOString(),
    auditType,
  };

  const leaseStructured = parseLeaseStructured(parsed.leaseStructured);
  const employmentStructured = parseEmploymentStructured(parsed.employmentStructured);
  const termsStructured = parseTermsStructured(parsed.termsStructured);

  if (auditType === "lease" && leaseStructured) report.leaseStructured = leaseStructured;
  if (auditType === "employment" && employmentStructured) report.employmentStructured = employmentStructured;
  if (auditType === "terms" && termsStructured) report.termsStructured = termsStructured;

  return report;
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

    const country = getCountry(extracted.jurisdiction) ?? getCountry("us")!;
    const jurisdictionName = country.name;
    const legalSystem = LEGAL_SYSTEM_LABELS[country.legalSystem];

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "ai_not_configured",
          message: "OPENROUTER_API_KEY is not set on the server. The audit cannot run.",
        },
        { status: 503 }
      );
    }

    const prompt = buildPrompt({
      jurisdictionName,
      legalSystem,
      documentType: extracted.documentType,
      text: extracted.text,
      auditType: extracted.auditType,
    });

    const completion = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": siteUrl(),
        "X-Title": "BasicLaw - Audit",
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_AUDIT_MODEL || process.env.OPENROUTER_MODEL || "openai/gpt-oss-20b:free",
        messages: [
          { role: "system", content: "You output strictly valid JSON. No prose. No markdown." },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
        max_tokens: extracted.auditType === "general" ? 1400 : 2000,
      }),
    });

    if (!completion.ok) {
      const errorBody = await completion.text();
      console.error("[audit] OpenRouter error", completion.status, errorBody);
      return NextResponse.json(
        { error: "ai_error", message: `Audit model returned ${completion.status}.` },
        { status: 502 }
      );
    }

    const data = (await completion.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = data.choices?.[0]?.message?.content ?? "";
    if (!content) {
      return NextResponse.json({ error: "empty_response", message: "Model returned no content." }, { status: 502 });
    }
    const report = parseReport(content, country.code, jurisdictionName, extracted.auditType);
    return NextResponse.json({ report });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[audit] error", message);
    return NextResponse.json({ error: "audit_failed", message }, { status: 400 });
  }
}
