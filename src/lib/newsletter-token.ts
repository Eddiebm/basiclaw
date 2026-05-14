import { createHmac, timingSafeEqual } from "node:crypto";

function secret(): string {
  return (
    process.env.NEWSLETTER_UNSUBSCRIBE_SECRET?.trim() ||
    process.env.CRON_SECRET?.trim() ||
    process.env.CLERK_SECRET_KEY?.trim() ||
    "basiclaw-dev-unsubscribe"
  );
}

export function newsletterUnsubscribeToken(email: string): string {
  const e = email.toLowerCase();
  const h = createHmac("sha256", secret()).update(e).digest("hex");
  return `${Buffer.from(e, "utf8").toString("base64url")}.${h}`;
}

export function parseAndVerifyUnsubscribeToken(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [a, h] = parts;
  if (!a || !h) return null;
  let email: string;
  try {
    email = Buffer.from(a, "base64url").toString("utf8").toLowerCase();
  } catch {
    return null;
  }
  const expected = createHmac("sha256", secret()).update(email).digest("hex");
  try {
    if (expected.length !== h.length) return null;
    if (!timingSafeEqual(Buffer.from(expected), Buffer.from(h))) return null;
  } catch {
    return null;
  }
  return email;
}
