import { NextResponse } from "next/server";
import { parseAndVerifyUnsubscribeToken } from "@/lib/newsletter-token";
import { removeNewsletterSubscriber } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token")?.trim();
  if (!token) {
    return NextResponse.json({ error: "missing_token" }, { status: 400 });
  }
  const email = parseAndVerifyUnsubscribeToken(token);
  if (!email) {
    return NextResponse.json({ error: "invalid_token" }, { status: 400 });
  }
  await removeNewsletterSubscriber(email);
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://basiclaw.app";
  const html = `<!doctype html><html lang="en"><meta charset="utf-8"/><title>Unsubscribed</title>
<body style="font-family:system-ui;padding:2rem;line-height:1.5">
<p>You’re unsubscribed from BasicLaw’s Right of the Day for <strong>${email}</strong>.</p>
<p><a href="${site}">Return to BasicLaw</a></p>
</body></html>`;
  return new NextResponse(html, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
