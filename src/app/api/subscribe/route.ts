import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth-config";
import { addNewsletterSubscriber } from "@/lib/storage";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

export async function POST(request: Request) {
  let body: { email?: string; jurisdiction?: string; locale?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const email = body.email?.trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }
  const jurisdiction = (body.jurisdiction ?? "us").toLowerCase();
  const locale = (body.locale ?? "en").toLowerCase();

  const uid = await getCurrentUserId();

  await addNewsletterSubscriber({
    email,
    jurisdiction,
    locale,
    userId: uid ?? undefined,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
