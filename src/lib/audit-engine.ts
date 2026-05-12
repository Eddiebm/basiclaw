import * as Sentry from "@sentry/nextjs";
import { getCountry } from "@/lib/jurisdictions";
import { LEGAL_SYSTEM_LABELS } from "@/data/types";
import type {
  AuditFocusSlot,
  AuditReport,
  AuditType,
  DemandLetterStructuredFindings,
  DivorceStructuredFindings,
  EmploymentStructuredFindings,
  LeaseStructuredFindings,
  PrenupStructuredFindings,
  RiskGrade,
  TermsStructuredFindings,
} from "@/lib/audit-types";
import { generateChatCompletionText } from "@/lib/llm-chat-completion";

export const MAX_TEXT_CHARS = 60_000;
export const MIN_TEXT_CHARS = 200;

const VALID_GRADES = new Set<RiskGrade>(["low", "moderate", "elevated", "high", "critical"]);
const VALID_AUDIT_TYPES = new Set<AuditType>([
  "general",
  "lease",
  "employment",
  "terms",
  "prenup",
  "divorce",
  "demand_letter",
]);

export function normaliseAuditType(value: string | null | undefined): AuditType {
  const v = (value ?? "general").toLowerCase();
  return VALID_AUDIT_TYPES.has(v as AuditType) ? (v as AuditType) : "general";
}

export function clipText(text: string): string {
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
    case "prenup":
      return `${BASE_REPORT_TYPE}

Also include:
"prenupStructured": {
  "financialDisclosure": ${FOCUS_SLOT},
  "spousalSupport": ${FOCUS_SLOT},
  "independentCounsel": ${FOCUS_SLOT}
}

Prenup / postnup / marital-property agreement focus: adequacy of financial disclosure, spousal-support waivers or limits, and independent legal advice / procedural fairness.`;
    case "divorce":
      return `${BASE_REPORT_TYPE}

Also include:
"divorceStructured": {
  "assetDivision": ${FOCUS_SLOT},
  "custodyParenting": ${FOCUS_SLOT},
  "supportAlimony": ${FOCUS_SLOT}
}

Separation / divorce settlement focus: division of assets and debts, parenting and custody language, support or alimony hooks.`;
    case "demand_letter":
      return `${BASE_REPORT_TYPE}

Also include:
"demandLetterStructured": {
  "factsAndTimeline": ${FOCUS_SLOT},
  "reliefAndAmount": ${FOCUS_SLOT},
  "deadlineAndTone": ${FOCUS_SLOT}
}

Demand-letter or pre-action outline focus: clarity and proportionality of facts vs rhetoric, specificity of relief and amounts, response deadline and tone/defamation risk.`;
    default:
      return BASE_REPORT_TYPE;
  }
}

export function buildPrompt(input: {
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
          : input.auditType === "prenup"
            ? "Assume a prenuptial, postnuptial, or marital-property agreement unless clearly otherwise."
            : input.auditType === "divorce"
              ? "Assume a separation agreement, consent order draft, or divorce settlement unless clearly otherwise."
              : input.auditType === "demand_letter"
                ? "Assume a demand letter, cease-and-desist outline, or pre-action notice compiled from user-supplied facts."
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
${input.auditType !== "general" ? "- Include the specialised structured object for this audit type (leaseStructured, employmentStructured, termsStructured, prenupStructured, divorceStructured, or demandLetterStructured) with all three slots filled even if the document is silent (then explain uncertainty in summary fields)." : ""}

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
  return {
    summary: summary || "Not clearly addressed in the excerpt.",
    pushback: pushback || "Ask the counterparty to clarify this point in writing.",
  };
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

function parsePrenupStructured(value: unknown): PrenupStructuredFindings | undefined {
  if (!value || typeof value !== "object") return undefined;
  const o = value as Record<string, unknown>;
  const financialDisclosure = parseFocusSlot(o.financialDisclosure);
  const spousalSupport = parseFocusSlot(o.spousalSupport);
  const independentCounsel = parseFocusSlot(o.independentCounsel);
  if (!financialDisclosure || !spousalSupport || !independentCounsel) return undefined;
  return { financialDisclosure, spousalSupport, independentCounsel };
}

function parseDivorceStructured(value: unknown): DivorceStructuredFindings | undefined {
  if (!value || typeof value !== "object") return undefined;
  const o = value as Record<string, unknown>;
  const assetDivision = parseFocusSlot(o.assetDivision);
  const custodyParenting = parseFocusSlot(o.custodyParenting);
  const supportAlimony = parseFocusSlot(o.supportAlimony);
  if (!assetDivision || !custodyParenting || !supportAlimony) return undefined;
  return { assetDivision, custodyParenting, supportAlimony };
}

function parseDemandLetterStructured(value: unknown): DemandLetterStructuredFindings | undefined {
  if (!value || typeof value !== "object") return undefined;
  const o = value as Record<string, unknown>;
  const factsAndTimeline = parseFocusSlot(o.factsAndTimeline);
  const reliefAndAmount = parseFocusSlot(o.reliefAndAmount);
  const deadlineAndTone = parseFocusSlot(o.deadlineAndTone);
  if (!factsAndTimeline || !reliefAndAmount || !deadlineAndTone) return undefined;
  return { factsAndTimeline, reliefAndAmount, deadlineAndTone };
}

export function parseReport(
  content: string,
  jurisdictionCode: string,
  jurisdictionName: string,
  auditType: AuditType
): AuditReport {
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
    redFlags: arr(parsed.redFlags)
      .map((item) => {
        const o = (item ?? {}) as Record<string, unknown>;
        return { title: clean(o.title), why: clean(o.why), pushback: clean(o.pushback) };
      })
      .filter((f) => f.title),
    positives: arr(parsed.positives)
      .map((item) => {
        const o = (item ?? {}) as Record<string, unknown>;
        return { title: clean(o.title), why: clean(o.why) };
      })
      .filter((f) => f.title),
    keyClausesToPushBackOn: arr(parsed.keyClausesToPushBackOn)
      .map((item) => {
        const o = (item ?? {}) as Record<string, unknown>;
        return { clause: clean(o.clause), pushback: clean(o.pushback) };
      })
      .filter((f) => f.clause),
    askLawyerIfTriggers: arr(parsed.askLawyerIfTriggers)
      .map((item) => {
        const o = (item ?? {}) as Record<string, unknown>;
        return { trigger: clean(o.trigger), why: clean(o.why) };
      })
      .filter((f) => f.trigger),
    generatedAt: new Date().toISOString(),
    auditType,
  };

  const leaseStructured = parseLeaseStructured(parsed.leaseStructured);
  const employmentStructured = parseEmploymentStructured(parsed.employmentStructured);
  const termsStructured = parseTermsStructured(parsed.termsStructured);
  const prenupStructured = parsePrenupStructured(parsed.prenupStructured);
  const divorceStructured = parseDivorceStructured(parsed.divorceStructured);
  const demandLetterStructured = parseDemandLetterStructured(parsed.demandLetterStructured);

  if (auditType === "lease" && leaseStructured) report.leaseStructured = leaseStructured;
  if (auditType === "employment" && employmentStructured) report.employmentStructured = employmentStructured;
  if (auditType === "terms" && termsStructured) report.termsStructured = termsStructured;
  if (auditType === "prenup" && prenupStructured) report.prenupStructured = prenupStructured;
  if (auditType === "divorce" && divorceStructured) report.divorceStructured = divorceStructured;
  if (auditType === "demand_letter" && demandLetterStructured) {
    report.demandLetterStructured = demandLetterStructured;
  }

  return report;
}

export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://basiclaw.vercel.app";
}

export interface RunAuditOptions {
  text: string;
  jurisdiction: string;
  documentType?: string;
  auditType: AuditType;
  source?: string;
}

export type AuditOutcome =
  | { ok: true; report: AuditReport }
  | { ok: false; status: number; error: string; message: string };

/**
 * Run the audit pipeline once. Shared between the main /api/audit route and
 * the CORS-friendly /api/audit/extension route used by the browser extension.
 */
export async function runAuditPipeline(options: RunAuditOptions): Promise<AuditOutcome> {
  const text = options.text.trim();
  if (!text || text.length < MIN_TEXT_CHARS) {
    return {
      ok: false,
      status: 400,
      error: "too_short",
      message: `Need at least ${MIN_TEXT_CHARS} characters of document text.`,
    };
  }

  const country = getCountry(options.jurisdiction) ?? getCountry("us")!;
  const jurisdictionName = country.name;
  const legalSystem = LEGAL_SYSTEM_LABELS[country.legalSystem];

  const hasLlm =
    Boolean(process.env.AI_GATEWAY_API_KEY?.trim()) || Boolean(process.env.OPENROUTER_API_KEY?.trim());
  if (!hasLlm) {
    return {
      ok: false,
      status: 503,
      error: "ai_not_configured",
      message: "No AI is configured on the server (set AI_GATEWAY_API_KEY or OPENROUTER_API_KEY). The audit cannot run.",
    };
  }

  const prompt = buildPrompt({
    jurisdictionName,
    legalSystem,
    documentType: options.documentType,
    text,
    auditType: options.auditType,
  });

  const maxTokens =
    options.auditType === "general" ? 1400 : options.auditType === "demand_letter" ? 2800 : 2000;
  const auditModel = process.env.OPENROUTER_AUDIT_MODEL || process.env.OPENROUTER_MODEL || "openai/gpt-oss-20b:free";

  let content: string;
  try {
    const { text } = await Sentry.startSpan({ name: "audit.llm_completion", op: "ai.generate" }, () =>
      generateChatCompletionText({
        messages: [
          { role: "system", content: "You output strictly valid JSON. No prose. No markdown." },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
        maxTokens,
        model: auditModel,
      })
    );
    content = text;
  } catch (e) {
    Sentry.captureException(e);
    return {
      ok: false,
      status: 502,
      error: "ai_error",
      message: "Audit model request failed.",
    };
  }

  if (!content) {
    return {
      ok: false,
      status: 502,
      error: "empty_response",
      message: "Model returned no content.",
    };
  }

  try {
    const report = parseReport(content, country.code, jurisdictionName, options.auditType);
    return { ok: true, report };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Audit parsing failed.";
    return { ok: false, status: 502, error: "parse_failed", message };
  }
}
