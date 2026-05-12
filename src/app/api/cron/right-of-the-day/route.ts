import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { Resend } from "resend";
import { getCountry } from "@/lib/jurisdictions";
import { getAllCitizenQuestions } from "@/data/questions/load-questions";
import { rightOfDayForUtcIndex } from "@/data/rights-of-the-day";
import { newsletterUnsubscribeToken } from "@/lib/newsletter-token";
import { listNewsletterSubscribers } from "@/lib/storage";

export const runtime = "nodejs";
export const maxDuration = 120;

function dayOfYearUtc(d: Date): number {
  const y = d.getUTCFullYear();
  const start = Date.UTC(y, 0, 1);
  const day = Date.UTC(y, d.getUTCMonth(), d.getUTCDate());
  return Math.floor((day - start) / 86400000) + 1;
}

function verifyCron(request: Request): boolean {
  if (process.env.NODE_ENV !== "production") {
    return true;
  }
  if (request.headers.get("x-vercel-cron") === "1") {
    return true;
  }
  const want = process.env.CRON_SECRET?.trim();
  if (!want) return false;
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  return auth.slice(7) === want;
}

export async function GET(request: Request) {
  if (!verifyCron(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RIGHT_OF_DAY_FROM_EMAIL?.trim();
  if (!apiKey || !from) {
    return NextResponse.json({ error: "email_not_configured" }, { status: 503 });
  }

  const resend = new Resend(apiKey);
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://basiclaw.app";
  const now = new Date();
  const doy = dayOfYearUtc(now);
  const right = rightOfDayForUtcIndex(doy);
  const questions = getAllCitizenQuestions();
  const q = questions.length > 0 ? questions[doy % questions.length] : null;
  const prefill = q ? `?prefill=${encodeURIComponent(q.question)}` : "";

  const subs = await listNewsletterSubscribers();
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < subs.length; i++) {
    const sub = subs[i]!;
    await Sentry.startSpan(
      {
        name: "cron.right_of_the_day.subscriber_batch",
        op: "email.send",
        attributes: { "subscriber.batch_index": i, "subscriber.total": subs.length },
      },
      async () => {
        const country = getCountry(sub.jurisdiction) ?? getCountry("us")!;
        const kp = country.constitution.keyPrinciples;
        const principle =
          kp.length > 0 ? kp[0]! : country.constitution.summary.slice(0, 320);
        const token = newsletterUnsubscribeToken(sub.email);
        const unsub = `${site}/api/unsubscribe?token=${encodeURIComponent(token)}`;
        const chatLink = `${site}/${sub.locale}/chat${prefill}`;

        const html = `
      <div style="font-family:system-ui,Segoe UI,sans-serif;line-height:1.5;color:#111">
        <h1 style="font-size:18px">Right of the day</h1>
        <p>${right}</p>
        <h2 style="font-size:16px;margin-top:1.5rem">From ${country.name}'s constitution (key principle)</h2>
        <p>${principle}</p>
        ${
          q
            ? `<p style="margin-top:1.5rem"><a href="${chatLink}">Open BasicLaw chat with a related question</a></p>`
            : ""
        }
        <p style="margin-top:2rem;font-size:12px;color:#555">
          <a href="${unsub}">Unsubscribe</a> from Right of the Day.
        </p>
      </div>
    `;

        const { error } = await resend.emails.send(
          {
            from,
            to: sub.email,
            subject: `BasicLaw — Right of the day (${now.toISOString().slice(0, 10)})`,
            html,
          },
          { idempotencyKey: `right-of-day/${sub.email}/${now.toISOString().slice(0, 10)}` }
        );
        if (error) {
          failed += 1;
          Sentry.captureException(new Error(`right_of_day_email:${error.message}`));
        } else {
          sent += 1;
        }
      }
    );
  }

  return NextResponse.json({ ok: true, sent, failed, total: subs.length });
}
