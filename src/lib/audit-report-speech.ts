import { RISK_GRADE_LABEL, type AuditReport } from "@/lib/audit-types";

/** Plain string for TTS — structured summary, not JSON. */
export function buildAuditReportSpeechText(report: AuditReport): string {
  const parts: string[] = [];
  const grade = RISK_GRADE_LABEL[report.overallRiskGrade];
  parts.push(
    `Audit summary for ${report.documentType} in ${report.jurisdictionName}. Overall risk: ${grade}. ${report.oneLineSummary}`
  );

  if (report.redFlags.length > 0) {
    parts.push("Top red flags.");
    for (const f of report.redFlags) {
      parts.push(`${f.title}. ${f.why}`);
    }
  } else {
    parts.push("No major red flags were flagged in this pass.");
  }

  if (report.keyClausesToPushBackOn.length > 0) {
    parts.push("Key clauses to push back on.");
    for (const c of report.keyClausesToPushBackOn) {
      parts.push(`Clause: ${c.clause}. Suggested pushback: ${c.pushback}`);
    }
  }

  return parts.join(" ");
}
