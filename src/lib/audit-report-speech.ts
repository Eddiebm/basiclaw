import { RISK_GRADE_LABEL, type AuditReport } from "@/lib/audit-types";
import { stripMarkdownForSpeech } from "@/lib/stripMarkdownForSpeech";

function joinBullets(lines: string[]): string {
  return lines.filter(Boolean).join(". ");
}

export function buildAuditReportSpeechText(report: AuditReport): string {
  const grade = RISK_GRADE_LABEL[report.overallRiskGrade];
  const parts: string[] = [];

  parts.push(`Audit summary for ${report.documentType} in ${report.jurisdictionName}.`);
  parts.push(`Overall risk grade: ${grade}.`);
  parts.push(report.oneLineSummary);

  if (report.redFlags.length) {
    const red = report.redFlags.map((f) => `${f.title}. ${f.why}`).slice(0, 6);
    parts.push(`Top red flags: ${joinBullets(red)}.`);
  }

  if (report.keyClausesToPushBackOn.length) {
    const clauses = report.keyClausesToPushBackOn.map((c) => `${c.clause}. ${c.pushback}`).slice(0, 4);
    parts.push(`Key clauses to push back on: ${joinBullets(clauses)}.`);
  }

  if (report.positives.length) {
    const pos = report.positives.map((p) => `${p.title}. ${p.why}`).slice(0, 3);
    parts.push(`Positives: ${joinBullets(pos)}.`);
  }

  parts.push("This is educational information only, not legal advice.");
  return stripMarkdownForSpeech(parts.join(" "));
}
