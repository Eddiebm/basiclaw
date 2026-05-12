import type { BillingPlan } from "@/lib/entitlements";

export interface PlanLimits {
  chatsPerDay: number | null;
  auditsPerMonth: number | null;
  demandLettersPerDay: number | null;
  /** When false, prenup and divorce audit tools require Pro+. */
  advancedAuditTypes: boolean;
}

export function limitsForPlan(plan: BillingPlan): PlanLimits {
  switch (plan) {
    case "pro_plus":
      return {
        chatsPerDay: null,
        auditsPerMonth: null,
        demandLettersPerDay: null,
        advancedAuditTypes: true,
      };
    case "pro":
      return {
        chatsPerDay: 100,
        auditsPerMonth: 50,
        demandLettersPerDay: null,
        advancedAuditTypes: true,
      };
    case "free":
    default:
      return {
        chatsPerDay: 5,
        auditsPerMonth: 3,
        demandLettersPerDay: 1,
        advancedAuditTypes: false,
      };
  }
}

export function isAdvancedAuditTypeBlocked(plan: BillingPlan, auditType: string): boolean {
  if (auditType !== "prenup" && auditType !== "divorce") return false;
  const { advancedAuditTypes } = limitsForPlan(plan);
  return !advancedAuditTypes;
}

export type EmbedTenantPlan = "free" | "pro";

/** Rate limits for embed API keys (`free` ≈ site free tier; `pro` = higher caps). */
export function limitsForEmbedTenantPlan(plan: EmbedTenantPlan): PlanLimits {
  if (plan === "pro") {
    return {
      chatsPerDay: 80,
      auditsPerMonth: 40,
      demandLettersPerDay: 3,
      advancedAuditTypes: true,
    };
  }
  return limitsForPlan("free");
}
