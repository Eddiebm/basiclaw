import { NextRequest, NextResponse } from "next/server";
import { COUNTRIES } from "@/data/countries";
import { appendPartnerApplication } from "@/lib/partner-storage";

type Body = {
  name?: string;
  email?: string;
  barNumber?: string;
  country?: string;
  practiceAreas?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Body;
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const barNumber = typeof body.barNumber === "string" ? body.barNumber.trim() : "";
    const country = typeof body.country === "string" ? body.country.trim().toUpperCase() : "";
    const practiceAreas = typeof body.practiceAreas === "string" ? body.practiceAreas.trim() : "";

    if (!name || !email || !country || !practiceAreas) {
      return NextResponse.json({ error: "name, email, country, and practiceAreas are required" }, { status: 400 });
    }

    const countryKnown = COUNTRIES.some((c) => c.code.toUpperCase() === country);

    const row = await appendPartnerApplication({
      name,
      email,
      barNumber: barNumber || undefined,
      country,
      practiceAreas,
    });

    const payload = { kind: "partner_application", countryKnown, ...row };
    console.log("[partner-application]", JSON.stringify(payload));

    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.LAWYER_LEADS_EMAIL ?? process.env.LAWYER_APPLICATIONS_EMAIL ?? process.env.RESEND_FROM_EMAIL;

    if (apiKey && to) {
      const from = process.env.RESEND_FROM_EMAIL || "BasicLaw <onboarding@resend.dev>";
      const subject = `Partner directory application — ${country}${countryKnown ? "" : " (unknown code)"}`;
      const text = JSON.stringify(payload, null, 2);

      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [to],
          reply_to: email,
          subject,
          text,
        }),
      });

      if (!resendResponse.ok) {
        const errText = await resendResponse.text();
        console.error("[partner-application] Resend error:", resendResponse.status, errText);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Partner application API error:", error);
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
