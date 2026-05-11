// Mirror of /src/lib/audit-types.ts on the BasicLaw web app. Kept inline so the
// extension stays a self-contained workspace.

export type RiskGrade = "low" | "moderate" | "elevated" | "high" | "critical";

export type AuditType = "general" | "lease" | "employment" | "terms";

export interface AuditFlag {
  title: string;
  why: string;
  pushback: string;
}

export interface AuditPositive {
  title: string;
  why: string;
}

export interface AuditClause {
  clause: string;
  pushback: string;
}

export interface AuditTrigger {
  trigger: string;
  why: string;
}

export interface AuditFocusSlot {
  summary: string;
  pushback: string;
}

export interface LeaseStructuredFindings {
  deposit: AuditFocusSlot;
  notice: AuditFocusSlot;
  renewal: AuditFocusSlot;
}

export interface EmploymentStructuredFindings {
  intellectualProperty: AuditFocusSlot;
  nonCompete: AuditFocusSlot;
  atWill: AuditFocusSlot;
}

export interface TermsStructuredFindings {
  dataRights: AuditFocusSlot;
  arbitration: AuditFocusSlot;
  liabilityCap: AuditFocusSlot;
}

export interface AuditReport {
  documentType: string;
  jurisdictionCode: string;
  jurisdictionName: string;
  overallRiskGrade: RiskGrade;
  oneLineSummary: string;
  redFlags: AuditFlag[];
  positives: AuditPositive[];
  keyClausesToPushBackOn: AuditClause[];
  askLawyerIfTriggers: AuditTrigger[];
  generatedAt: string;
  auditType: AuditType;
  leaseStructured?: LeaseStructuredFindings;
  employmentStructured?: EmploymentStructuredFindings;
  termsStructured?: TermsStructuredFindings;
}

export const RISK_GRADE_LABEL: Record<RiskGrade, string> = {
  low: "Low risk",
  moderate: "Moderate risk",
  elevated: "Elevated risk",
  high: "High risk",
  critical: "Critical risk",
};
