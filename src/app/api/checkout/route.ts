import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import {
  STRIPE_TIERS,
  isStripeConfigured,
  stripePriceEnvVarName,
  type BillingCadence,
  type StripeTierId,
} from "@/lib/stripe-config";

export const runtime = "nodejs";

interface CheckoutRequest {
  tier: StripeTierId;
  cadence: BillingCadence;
  email?: string;
}

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://basiclaw.vercel.app";
}

export async function POST(request: Request) {
  let body: CheckoutRequest;
  try {
    body = (await request.json()) as CheckoutRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.tier || !STRIPE_TIERS[body.tier]) {
    return NextResponse.json({ error: "Unknown tier" }, { status: 400 });
  }
  const cadence: BillingCadence = body.cadence === "annual" ? "annual" : "monthly";

  if (!isStripeConfigured()) {
    return NextResponse.json(
      {
        error: "stripe_not_configured",
        message:
          "Checkout is being wired up. Email hello@basiclaw.app and we'll personally onboard you.",
      },
      { status: 503 }
    );
  }

  const tier = STRIPE_TIERS[body.tier];
  const priceId = tier[cadence].priceId;
  if (!priceId) {
    return NextResponse.json(
      {
        error: "price_not_configured",
        message: `No Stripe price ID set for ${tier.name} (${cadence}). Set ${stripePriceEnvVarName(body.tier, cadence)} in env.`,
      },
      { status: 503 }
    );
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl()}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl()}/pricing?checkout=cancelled`,
      allow_promotion_codes: true,
      automatic_tax: { enabled: false },
      customer_email: body.email,
      metadata: { tier: body.tier, cadence },
      subscription_data: { metadata: { tier: body.tier, cadence } },
    });
    return NextResponse.json({ url: session.url, id: session.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Stripe error";
    return NextResponse.json({ error: "stripe_error", message }, { status: 500 });
  }
}
