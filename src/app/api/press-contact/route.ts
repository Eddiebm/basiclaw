import { NextRequest, NextResponse } from "next/server";

type Body = {
  name?: string;
  email?: string;
  message?: string;
};

export async function POST(request: NextRequest) {
  const pressTo = process.env.PRESS_EMAIL?.trim();
  if (!pressTo) {
    return NextResponse.json({ error: "press_contact_disabled" }, { status: 503 });
  }

  try {
    const body = (await request.json()) as Body;
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!name || !email || !message) {
      return NextResponse.json({ error: "name, email, and message are required" }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "email_not_configured" }, { status: 503 });
    }

    const from = process.env.RESEND_FROM_EMAIL || "BasicLaw <onboarding@resend.dev>";
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [pressTo],
        reply_to: email,
        subject: `Press inquiry — ${name}`,
        text: `From: ${name} <${email}>\n\n${message}`,
      }),
    });

    if (!resendResponse.ok) {
      const errText = await resendResponse.text();
      console.error("[press-contact] Resend error:", resendResponse.status, errText);
      return NextResponse.json({ error: "send_failed" }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[press-contact]", e);
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
}
