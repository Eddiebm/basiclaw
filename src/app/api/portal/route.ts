import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { isStripeConfigured } from "@/lib/stripe-config";

export const runtime = "nodejs";

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://basiclaw.vercel.app";
}

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "stripe_not_configured", message: "Customer portal not yet wired." },
      { status: 503 }
    );
  }

  let body: { customerId?: string; sessionId?: string } = {};
  try {
    body = await request.json();
  } catch {
    /* allow empty body */
  }

  try {
    const stripe = getStripe();
    let customerId = body.customerId;
    if (!customerId && body.sessionId) {
      const session = await stripe.checkout.sessions.retrieve(body.sessionId);
      if (typeof session.customer === "string") customerId = session.customer;
    }
    if (!customerId) {
      return NextResponse.json({ error: "missing_customer", message: "Provide customerId or sessionId" }, { status: 400 });
    }
    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${siteUrl()}/dashboard`,
    });
    return NextResponse.json({ url: portal.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Stripe error";
    return NextResponse.json({ error: "stripe_error", message }, { status: 500 });
  }
}
