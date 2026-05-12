// TODO: replace with full Clerk/Upstash/Stripe implementation.

import type { BillingPlan } from "@/lib/entitlements";

export type PlanLimits = {
  chatsPerDay: number | null;
  auditsPerMonth: number | null;
  demandLettersPerDay: number | null;
};

export function limitsForPlan(plan: BillingPlan): PlanLimits {
  if (plan === "pro_plus") {
    return { chatsPerDay: null, auditsPerMonth: null, demandLettersPerDay: null };
  }
  if (plan === "pro") {
    return { chatsPerDay: 80, auditsPerMonth: 40, demandLettersPerDay: 10 };
  }
  return { chatsPerDay: 12, auditsPerMonth: 3, demandLettersPerDay: 1 };
}
