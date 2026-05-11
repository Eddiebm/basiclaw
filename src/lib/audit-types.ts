export type RiskGrade = "low" | "moderate" | "elevated" | "high" | "critical";

/** General contract audit or a specialised preset */
export type AuditType =
  | "general"
  | "lease"
  | "employment"
  | "terms"
  | "prenup"
  | "divorce"
  | "demand_letter";

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

/** Pair returned for specialised checklist slots */
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

export interface PrenupStructuredFindings {
  financialDisclosure: AuditFocusSlot;
  spousalSupport: AuditFocusSlot;
  independentCounsel: AuditFocusSlot;
}

export interface DivorceStructuredFindings {
  assetDivision: AuditFocusSlot;
  custodyParenting: AuditFocusSlot;
  supportAlimony: AuditFocusSlot;
}

export interface DemandLetterStructuredFindings {
  factsAndTimeline: AuditFocusSlot;
  reliefAndAmount: AuditFocusSlot;
  deadlineAndTone: AuditFocusSlot;
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
  prenupStructured?: PrenupStructuredFindings;
  divorceStructured?: DivorceStructuredFindings;
  demandLetterStructured?: DemandLetterStructuredFindings;
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
