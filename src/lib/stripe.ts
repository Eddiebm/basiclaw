import Stripe from "stripe";

let cached: Stripe | null = null;

export function getStripe(): Stripe {
  if (cached) return cached;
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  cached = new Stripe(secret, {
    appInfo: {
      name: "BasicLaw",
      url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://basiclaw.vercel.app",
    },
  });
  return cached;
}
