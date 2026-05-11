export type StripeTierId = "pro" | "plus";
export type BillingCadence = "monthly" | "annual";

export interface StripeTierConfig {
  id: StripeTierId;
  name: string;
  productId: string | undefined;
  monthly: { priceId: string | undefined; amount: number; label: string };
  annual: { priceId: string | undefined; amount: number; label: string; perMonth: number };
}

export const STRIPE_TIERS: Record<StripeTierId, StripeTierConfig> = {
  pro: {
    id: "pro",
    name: "Stop Paying By The Hour",
    productId: process.env.STRIPE_PRODUCT_PRO,
    monthly: {
      priceId: process.env.STRIPE_PRICE_PRO_MONTHLY,
      amount: 12,
      label: "$12 / month",
    },
    annual: {
      priceId: process.env.STRIPE_PRICE_PRO_ANNUAL,
      amount: 120,
      label: "$120 / year",
      perMonth: 10,
    },
  },
  plus: {
    id: "plus",
    name: "Operate With Confidence",
    productId: process.env.STRIPE_PRODUCT_PLUS,
    monthly: {
      priceId: process.env.STRIPE_PRICE_PLUS_MONTHLY,
      amount: 39,
      label: "$39 / month",
    },
    annual: {
      priceId: process.env.STRIPE_PRICE_PLUS_ANNUAL,
      amount: 390,
      label: "$390 / year",
      perMonth: 32.5,
    },
  },
};

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function isPubKeyConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
}
