import { clerkClient } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { mapStripePriceIdToPlan } from "@/lib/stripe-plan";
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

async function setClerkPlan(userId: string | undefined | null, plan: "free" | "pro" | "pro_plus") {
  if (!userId) return;
  try {
    const c = await clerkClient();
    await c.users.updateUser(userId, {
      publicMetadata: { plan },
    });
  } catch (e) {
    Sentry.captureException(e);
  }
}

export async function POST(request: Request) {
  Sentry.setTag("route", "/api/webhooks/stripe");

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

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown verification error";
    Sentry.captureException(error);
    return NextResponse.json({ error: "invalid_signature", message }, { status: 400 });
  }

  await Sentry.startSpan(
    {
      name: `stripe.webhook.${event.type}`,
      op: "stripe.webhook",
      attributes: { "stripe.event_id": event.id },
    },
    async () => {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          logEvent(event);
          if (session.mode !== "subscription") break;
          const userId = session.client_reference_id || (session.metadata?.clerkUserId as string | undefined);
          const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 10 });
          const priceId = lineItems.data[0]?.price?.id ?? null;
          const plan = mapStripePriceIdToPlan(priceId);
          if (plan !== "free") {
            await setClerkPlan(userId, plan);
          }
          break;
        }
        case "customer.subscription.created":
        case "customer.subscription.updated":
        case "customer.subscription.paused":
        case "customer.subscription.resumed": {
          const sub = event.data.object as Stripe.Subscription;
          logEvent(event);
          const userId = sub.metadata?.clerkUserId as string | undefined;
          if (!userId) break;
          if (sub.status === "past_due") {
            await setClerkPlan(userId, "free");
            break;
          }
          if (sub.status === "canceled" || sub.status === "unpaid" || sub.status === "incomplete_expired") {
            await setClerkPlan(userId, "free");
            break;
          }
          if (sub.status === "active" || sub.status === "trialing") {
            const priceId = sub.items.data[0]?.price?.id;
            const plan = mapStripePriceIdToPlan(priceId);
            if (plan !== "free") {
              await setClerkPlan(userId, plan);
            }
          }
          break;
        }
        case "customer.subscription.deleted": {
          const sub = event.data.object as Stripe.Subscription;
          logEvent(event);
          const userId = sub.metadata?.clerkUserId as string | undefined;
          await setClerkPlan(userId, "free");
          break;
        }
        case "invoice.payment_failed":
          logEvent(event);
          break;
        default:
          logEvent(event);
      }
    }
  );

  return NextResponse.json({ received: true });
}
