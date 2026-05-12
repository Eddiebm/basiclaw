import { createHmac, timingSafeEqual } from "node:crypto";
import type { AuditReport } from "@/lib/audit-types";

const SHARE_TTL_MS = 1000 * 60 * 60 * 24 * 120; // 120 days

function sharedSecret(): string {
  return (
    process.env.SHARED_AUDIT_SECRET?.trim() ||
    process.env.CLERK_SECRET_KEY?.trim() ||
    "basiclaw-dev-shared-audit"
  );
}

type SharePayload = { u: string; a: string; exp: number };

/** Match `AuditReportCard` / `SharedAuditClient` encoding (unicode-safe) — legacy fragment shares. */
export function encodeReportForShare(report: unknown): string {
  const json = JSON.stringify(report);
  return Buffer.from(unescape(encodeURIComponent(json)), "binary").toString("base64");
}

/** HMAC-signed token so shared links stay short and are verified server-side. */
export function createSharedAuditToken(userId: string, auditId: string): string {
  const exp = Date.now() + SHARE_TTL_MS;
  const body: SharePayload = { u: userId, a: auditId, exp };
  const payload = Buffer.from(JSON.stringify(body), "utf8").toString("base64url");
  const sig = createHmac("sha256", sharedSecret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifySharedAuditToken(token: string): { userId: string; auditId: string } | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, sig] = parts;
  if (!payloadB64 || !sig) return null;
  const expectedSig = createHmac("sha256", sharedSecret()).update(payloadB64).digest("base64url");
  try {
    if (expectedSig.length !== sig.length) return null;
    if (!timingSafeEqual(Buffer.from(expectedSig), Buffer.from(sig))) return null;
  } catch {
    return null;
  }
  let parsed: SharePayload;
  try {
    parsed = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8")) as SharePayload;
  } catch {
    return null;
  }
  if (!parsed?.u || !parsed?.a || typeof parsed.exp !== "number") return null;
  if (parsed.exp < Date.now()) return null;
  return { userId: parsed.u, auditId: parsed.a };
}

export function buildSharedAuditHref(locale: string, token: string): string {
  const safe = locale || "en";
  return `/${safe}/audit/shared?t=${encodeURIComponent(token)}`;
}

/** @deprecated Prefer HMAC `buildSharedAuditHref` — kept for decoding old #fragment links in the client. */
export function buildLegacyFragmentHref(locale: string, report: unknown): string {
  const hash = encodeReportForShare(report as AuditReport);
  return `/${locale}/audit/shared#${hash}`;
}
