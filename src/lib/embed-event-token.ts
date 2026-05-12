import { createHmac, timingSafeEqual } from "node:crypto";

const TTL_SEC = 60 * 60 * 24 * 365;

function secret(): string | null {
  const s = process.env.EMBED_JWT_SECRET?.trim();
  return s || null;
}

export function issueEmbedEventToken(tenantId: string): string | null {
  const sec = secret();
  if (!sec) return null;
  const iat = Math.floor(Date.now() / 1000);
  const payload = JSON.stringify({ tid: tenantId, iat, exp: iat + TTL_SEC });
  const b64 = Buffer.from(payload, "utf8").toString("base64url");
  const sig = createHmac("sha256", sec).update(b64).digest("base64url");
  return `${b64}.${sig}`;
}

/** Returns verified tenant id, or null if missing/invalid secret/token. */
export function verifyEmbedEventToken(token: string | null | undefined): string | null {
  const sec = secret();
  if (!sec || !token) return null;
  const dot = token.indexOf(".");
  if (dot < 1) return null;
  const b64 = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!b64 || !sig) return null;
  const expected = createHmac("sha256", sec).update(b64).digest("base64url");
  try {
    const a = Buffer.from(expected);
    const b = Buffer.from(sig);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  let parsed: { tid?: string; exp?: number };
  try {
    parsed = JSON.parse(Buffer.from(b64, "base64url").toString("utf8")) as { tid?: string; exp?: number };
  } catch {
    return null;
  }
  if (!parsed.tid || typeof parsed.tid !== "string") return null;
  if (typeof parsed.exp === "number" && parsed.exp < Math.floor(Date.now() / 1000)) return null;
  return parsed.tid;
}
