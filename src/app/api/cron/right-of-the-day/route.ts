import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  // TODO: replace with full Clerk/Upstash/Stripe implementation.
  console.log("[api/cron/right-of-the-day] stub tick", new Date().toISOString(), request.url);
  return NextResponse.json({ ok: true, stub: true });
}
