import type { BillingPlan } from "@/lib/entitlements";
import { limitsForPlan, isAdvancedAuditTypeBlocked, type PlanLimits } from "@/lib/limits";
import type { UsageSnapshot } from "@/lib/storage";
import { routing } from "@/i18n/routing";

const SUPPORTED = routing.locales as readonly string[];

/** Locale-prefixed pricing path for quota / paywall JSON responses. */
export function pricingPathForLocale(locale: string | null | undefined): string {
  const raw = (locale ?? "en").toLowerCase().split("-")[0] ?? "en";
  const safe = (SUPPORTED as readonly string[]).includes(raw) ? raw : "en";
  return `/${safe}/pricing`;
}

export function quotaJsonBody(message: string, locale?: string | null) {
  return { error: "quota_exceeded" as const, message, upgradeUrl: pricingPathForLocale(locale) };
}

export function checkChatQuotaAgainstLimits(
  L: PlanLimits,
  usage: UsageSnapshot
): { ok: true } | { ok: false; message: string } {
  if (L.chatsPerDay == null) return { ok: true };
  if (usage.chatsToday >= L.chatsPerDay) {
    return { ok: false, message: "Daily chat limit reached for your plan." };
  }
  return { ok: true };
}

export function checkChatQuota(plan: BillingPlan, usage: UsageSnapshot): { ok: true } | { ok: false; message: string } {
  return checkChatQuotaAgainstLimits(limitsForPlan(plan), usage);
}

export function checkAuditQuotaAgainstLimits(
  L: PlanLimits,
  usage: UsageSnapshot
): { ok: true } | { ok: false; message: string } {
  if (L.auditsPerMonth == null) return { ok: true };
  if (usage.auditsThisMonth >= L.auditsPerMonth) {
    return { ok: false, message: "Monthly audit limit reached for your plan." };
  }
  return { ok: true };
}

export function checkAuditQuota(plan: BillingPlan, usage: UsageSnapshot): { ok: true } | { ok: false; message: string } {
  return checkAuditQuotaAgainstLimits(limitsForPlan(plan), usage);
}

export function checkDemandLetterQuotaAgainstLimits(
  L: PlanLimits,
  usage: UsageSnapshot
): { ok: true } | { ok: false; message: string } {
  if (L.demandLettersPerDay == null) return { ok: true };
  if (usage.demandLettersToday >= L.demandLettersPerDay) {
    return { ok: false, message: "Daily demand-letter generator limit reached for your plan." };
  }
  return { ok: true };
}

export function checkDemandLetterQuota(plan: BillingPlan, usage: UsageSnapshot): { ok: true } | { ok: false; message: string } {
  return checkDemandLetterQuotaAgainstLimits(limitsForPlan(plan), usage);
}

export function checkAdvancedAuditPaywall(
  plan: BillingPlan,
  auditType: string
): { ok: true } | { ok: false; message: string } {
  if (!isAdvancedAuditTypeBlocked(plan, auditType)) return { ok: true };
  return {
    ok: false,
    message: "Prenup and divorce settlement audits require Pro or Pro+.",
  };
}
