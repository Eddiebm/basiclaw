import { NextRequest, NextResponse } from "next/server";
import { getVerifiedLawyerBySlug } from "@/data/verified-lawyers";
import { appendLawyerConsultLead, getPartnerLawyerBySlug } from "@/lib/partner-storage";

type Body = {
  name?: string;
  email?: string;
  message?: string;
};

function utm(href: string): string {
  const u = new URL(href);
  u.searchParams.set("utm_source", "basiclaw");
  u.searchParams.set("utm_medium", "lawyer_lead_notification");
  u.searchParams.set("utm_campaign", "consult_request");
  return u.toString();
}

export async function POST(request: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  try {
    const { slug: rawSlug } = await ctx.params;
    const slug = rawSlug.trim().toLowerCase();
    const body = (await request.json()) as Body;
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!name || !email || !message) {
      return NextResponse.json({ error: "name, email, and message are required" }, { status: 400 });
    }

    const verified = getVerifiedLawyerBySlug(slug);
    const partner = verified ? null : await getPartnerLawyerBySlug(slug);
    if (!verified && !partner) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const lawyerId = verified?.id ?? partner!.id;
    const kind = verified ? "verified" : "partner";
    const lawyerEmail = verified?.email ?? partner?.email ?? null;

    await appendLawyerConsultLead({
      lawyerSlug: verified?.slug ?? partner!.slug,
      lawyerId,
      kind,
      fromName: name,
      fromEmail: email,
      message,
    });

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL || "BasicLaw <onboarding@resend.dev>";
    const opsTo = process.env.LAWYER_LEADS_EMAIL ?? process.env.RESEND_FROM_EMAIL;

    if (apiKey && opsTo) {
      const text = JSON.stringify(
        {
          kind: "lawyer_consult_request",
          slug: verified?.slug ?? partner!.slug,
          lawyerId,
          listingKind: kind,
          fromName: name,
          fromEmail: email,
          message,
          lawyerEmailConfigured: Boolean(lawyerEmail),
        },
        null,
        2
      );
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [opsTo],
          reply_to: email,
          subject: `Consult request — ${verified?.name ?? partner!.name} (${slug})`,
          text,
        }),
      });
    }

    if (apiKey && lawyerEmail) {
      const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://basiclaw.app";
      const profileUrl = `${site}/lawyers/${verified?.slug ?? partner!.slug}`;
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [lawyerEmail],
          reply_to: email,
          subject: `New BasicLaw directory consultation request`,
          text: `You have a new consultation request via BasicLaw.\n\nFrom: ${name} <${email}>\n\nMessage:\n${message}\n\nYour public profile: ${utm(profileUrl)}\n\n— BasicLaw routing (not legal advice)`,
        }),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Lawyer lead slug API error:", error);
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
