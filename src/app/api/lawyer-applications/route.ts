import { NextRequest, NextResponse } from "next/server";
import { appendLawyerApplication } from "@/lib/storage";
import { COUNTRIES } from "@/data/countries";

type Body = {
  name?: string;
  email?: string;
  barNumber?: string;
  country?: string;
  practiceAreas?: string;
  sampleStatement?: string;
  headshotUrl?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Body;
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const barNumber = typeof body.barNumber === "string" ? body.barNumber.trim() : "";
    const country = typeof body.country === "string" ? body.country.trim().toUpperCase() : "";
    const practiceAreasRaw = typeof body.practiceAreas === "string" ? body.practiceAreas.trim() : "";
    const sampleStatement = typeof body.sampleStatement === "string" ? body.sampleStatement.trim() : "";
    const headshotUrl = typeof body.headshotUrl === "string" ? body.headshotUrl.trim() : "";

    if (!name || !email || !country || !practiceAreasRaw || !sampleStatement) {
      return NextResponse.json(
        { error: "name, email, country, practiceAreas, and sampleStatement are required" },
        { status: 400 }
      );
    }

    const practiceAreas = practiceAreasRaw
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const countryKnown = COUNTRIES.some((c) => c.code.toUpperCase() === country);

    const row = {
      id: crypto.randomUUID(),
      name,
      email,
      barNumber: barNumber || undefined,
      country,
      practiceAreas,
      sampleStatement,
      headshotUrl: headshotUrl || undefined,
      receivedAt: new Date().toISOString(),
    };

    await appendLawyerApplication(row);

    const payload = { kind: "lawyer_application", countryKnown, ...row };
    console.log("[lawyer-application]", JSON.stringify(payload));

    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.LAWYER_APPLICATIONS_EMAIL ?? process.env.LAWYER_LEADS_EMAIL ?? process.env.RESEND_FROM_EMAIL;

    if (apiKey && to) {
      const from = process.env.RESEND_FROM_EMAIL || "BasicLaw <onboarding@resend.dev>";
      const subject = `Lawyer verification application — ${country}${countryKnown ? "" : " (unknown code)"}`;
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
        console.error("[lawyer-application] Resend error:", resendResponse.status, errText);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Lawyer application API error:", error);
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
