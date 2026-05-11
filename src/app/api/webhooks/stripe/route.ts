import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

function logEvent(event: Stripe.Event) {
  const payload: Record<string, unknown> = {
    at: new Date().toISOString(),
    type: event.type,
    id: event.id,
    livemode: event.livemode,
  };
  const obj = event.data?.object as unknown as Record<string, unknown> | undefined;
  if (obj) {
    if (typeof obj.id === "string") payload.objectId = obj.id;
    if (typeof obj.customer === "string") payload.customer = obj.customer;
    if (typeof obj.customer_email === "string") payload.email = obj.customer_email;
    if (obj.metadata && typeof obj.metadata === "object") payload.metadata = obj.metadata;
    if (typeof obj.amount_total === "number") payload.amountTotal = obj.amount_total;
    if (typeof obj.currency === "string") payload.currency = obj.currency;
    if (typeof obj.status === "string") payload.status = obj.status;
  }
  console.log("[stripe.webhook]", JSON.stringify(payload));
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  const rawBody = await request.text();

  if (!secret) {
    console.warn("[stripe.webhook] STRIPE_WEBHOOK_SECRET not set; payload accepted but unverified.");
    return NextResponse.json({ ok: true, verified: false });
  }
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown verification error";
    return NextResponse.json({ error: "invalid_signature", message }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
    case "customer.subscription.paused":
    case "customer.subscription.resumed":
    case "invoice.payment_failed":
      logEvent(event);
      break;
    default:
      logEvent(event);
  }

  return NextResponse.json({ received: true });
}
