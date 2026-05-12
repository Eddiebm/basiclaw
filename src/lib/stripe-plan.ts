// TODO: replace with full Clerk/Upstash/Stripe implementation.

import type { BillingPlan } from "@/lib/entitlements";

const envPriceMap: Record<string, BillingPlan> = {};

function loadEnvMappings() {
  const pairs = [
    [process.env.STRIPE_PRICE_PRO_MONTHLY, "pro"],
    [process.env.STRIPE_PRICE_PRO_ANNUAL, "pro"],
    [process.env.STRIPE_PRICE_PRO_PLUS_MONTHLY, "pro_plus"],
    [process.env.STRIPE_PRICE_PRO_PLUS_ANNUAL, "pro_plus"],
  ] as const;
  for (const [id, plan] of pairs) {
    if (id) envPriceMap[id] = plan;
  }
}

loadEnvMappings();

export function mapStripePriceIdToPlan(priceId: string | null | undefined): BillingPlan {
  if (!priceId) return "free";
  return envPriceMap[priceId] ?? "free";
}
