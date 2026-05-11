import type { AuditType } from "./audit-types";

const LEASE_KEYWORDS = [
  "landlord",
  "tenant",
  "lease",
  "tenancy",
  "rent",
  "rental agreement",
  "security deposit",
  "demised premises",
  "lessor",
  "lessee",
];

const EMPLOYMENT_KEYWORDS = [
  "offer letter",
  "non-compete",
  "noncompete",
  "non-solicitation",
  "at-will",
  "at will",
  "employer",
  "employee",
  "compensation",
  "stock options",
  "vesting",
  "garden leave",
  "intellectual property assignment",
];

const TERMS_KEYWORDS = [
  "terms of service",
  "terms of use",
  "privacy policy",
  "acceptable use",
  "arbitration",
  "class action waiver",
  "limitation of liability",
  "by accessing",
  "you agree to",
  "eula",
];

function countMatches(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  let count = 0;
  for (const kw of keywords) {
    const re = new RegExp(`\\b${kw.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`, "g");
    const matches = lower.match(re);
    if (matches) count += matches.length;
  }
  return count;
}

/**
 * Heuristic auto-detection mirroring the prompt cues used in the web audit UI.
 * Falls back to `terms` because that is by far the most common document the
 * extension audits in the wild — the user's "I'm about to click Accept" moment.
 */
export function detectAuditType(text: string): AuditType {
  const sample = text.slice(0, 8000);
  const lease = countMatches(sample, LEASE_KEYWORDS);
  const employment = countMatches(sample, EMPLOYMENT_KEYWORDS);
  const terms = countMatches(sample, TERMS_KEYWORDS);

  const max = Math.max(lease, employment, terms);
  if (max === 0) return "terms";
  if (lease === max) return "lease";
  if (employment === max) return "employment";
  return "terms";
}

export const AUDIT_TYPE_LABEL: Record<AuditType, string> = {
  general: "General contract",
  lease: "Lease / tenancy",
  employment: "Employment / offer",
  terms: "Terms of Service",
};
