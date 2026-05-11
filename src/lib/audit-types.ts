export type RiskGrade = "low" | "moderate" | "elevated" | "high" | "critical";

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
}

export const RISK_GRADE_LABEL: Record<RiskGrade, string> = {
  low: "Low risk",
  moderate: "Moderate risk",
  elevated: "Elevated risk",
  high: "High risk",
  critical: "Critical risk",
};

export const RISK_GRADE_COLOR: Record<RiskGrade, string> = {
  low: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-300",
  moderate: "bg-blue-500/10 text-blue-700 border-blue-500/30 dark:text-blue-300",
  elevated: "bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-300",
  high: "bg-orange-500/10 text-orange-700 border-orange-500/30 dark:text-orange-300",
  critical: "bg-red-500/10 text-red-700 border-red-500/30 dark:text-red-300",
};
