import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  // TODO: replace with full Clerk/Upstash/Stripe implementation.
  try {
    const body = (await req.json()) as { email?: string; jurisdiction?: string; locale?: string };
    if (!body.email?.trim()) {
      return NextResponse.json({ error: "email_required" }, { status: 400 });
    }
    console.log("[api/subscribe] stub accept", {
      email: body.email.trim(),
      jurisdiction: body.jurisdiction ?? "us",
      locale: body.locale ?? "en",
    });
    return NextResponse.json({ ok: true, stub: true });
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
}
