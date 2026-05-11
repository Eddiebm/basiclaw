import { NextResponse } from "next/server";
import {
  MIN_TEXT_CHARS,
  normaliseAuditType,
  runAuditPipeline,
} from "@/lib/audit-engine";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Dedicated CORS-friendly audit endpoint for the BasicLaw browser extension.
 *
 * The main /api/audit route is intentionally *not* CORS-open, so we expose this
 * surface with explicit allowed-origin checks instead. We accept:
 *   - chrome-extension://<any-id>   (Chrome / Edge unpacked + Web Store)
 *   - moz-extension://<any-id>      (Firefox unpacked + AMO)
 *   - safari-web-extension://<any-id>
 *
 * Plus our own production web origin so the /extension landing page can also
 * call this endpoint from the browser if we want a parity demo button there.
 *
 * Rate-limit: a simple per-IP token bucket kept in memory. Vercel's
 * serverless functions don't share state, so this is best-effort — it bounds
 * abuse from a single warm instance and we document Upstash as the upgrade
 * path. It's *not* a security control; the OpenRouter key still must be
 * authoritative on cost.
 */

const ALLOWED_ORIGIN_PREFIXES = [
  "chrome-extension://",
  "moz-extension://",
  "safari-web-extension://",
];

const ALLOWED_WEB_ORIGINS = new Set([
  "https://basiclaw.vercel.app",
  "https://www.basiclaw.app",
  "https://basiclaw.app",
]);

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  if (ALLOWED_ORIGIN_PREFIXES.some((p) => origin.startsWith(p))) return true;
  if (ALLOWED_WEB_ORIGINS.has(origin)) return true;
  if (process.env.NODE_ENV !== "production" && origin.startsWith("http://localhost")) return true;
  return false;
}

function corsHeaders(origin: string | null): Record<string, string> {
  // Echo the request origin back when allowed. When disallowed we still need a
  // value for browsers to surface a useful error, so we fall back to the
  // production extension landing-page URL. This is harmless because the body
  // is also gated below.
  const allowed = origin && isAllowedOrigin(origin) ? origin : "https://basiclaw.vercel.app";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept, x-basiclaw-extension",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

// In-memory token bucket. Per-IP, 10 audits per 10 minutes.
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 10;
const buckets = new Map<string, { count: number; resetAt: number }>();

function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

function rateLimit(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const bucket = buckets.get(ip);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetAt: now + RATE_LIMIT_WINDOW_MS };
  }
  if (bucket.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, resetAt: bucket.resetAt };
  }
  bucket.count += 1;
  return { allowed: true, remaining: RATE_LIMIT_MAX - bucket.count, resetAt: bucket.resetAt };
}

interface ExtensionAuditPayload {
  text?: string;
  jurisdiction?: string;
  documentType?: string;
  auditType?: string;
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin");
  if (!isAllowedOrigin(origin)) {
    // Still respond with CORS headers but a 403 so the browser surfaces a
    // useful preflight error.
    return new NextResponse(null, { status: 403, headers: corsHeaders(origin) });
  }
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const headers = corsHeaders(origin);

  if (!isAllowedOrigin(origin)) {
    return NextResponse.json(
      { error: "forbidden_origin", message: "This endpoint only accepts requests from BasicLaw extensions." },
      { status: 403, headers }
    );
  }

  const ip = clientIp(request);
  const limit = rateLimit(ip);
  if (!limit.allowed) {
    const retryInSeconds = Math.max(1, Math.ceil((limit.resetAt - Date.now()) / 1000));
    return NextResponse.json(
      {
        error: "rate_limited",
        message: `Too many audits from this IP. Try again in ~${Math.ceil(retryInSeconds / 60)} minute(s).`,
      },
      {
        status: 429,
        headers: {
          ...headers,
          "Retry-After": String(retryInSeconds),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  let payload: ExtensionAuditPayload;
  try {
    payload = (await request.json()) as ExtensionAuditPayload;
  } catch {
    return NextResponse.json(
      { error: "invalid_json", message: "Request body must be JSON." },
      { status: 400, headers }
    );
  }

  const text = (payload.text ?? "").trim();
  if (text.length < MIN_TEXT_CHARS) {
    return NextResponse.json(
      {
        error: "too_short",
        message: `Need at least ${MIN_TEXT_CHARS} characters of document text. Select the contract text on the page and try again.`,
      },
      { status: 400, headers }
    );
  }

  const auditType = normaliseAuditType(payload.auditType);
  const jurisdiction = (payload.jurisdiction ?? "us").toLowerCase();

  const outcome = await runAuditPipeline({
    text,
    jurisdiction,
    documentType: payload.documentType,
    auditType,
    source: "extension",
  });

  if (!outcome.ok) {
    return NextResponse.json(
      { error: outcome.error, message: outcome.message },
      { status: outcome.status, headers }
    );
  }

  return NextResponse.json({ report: outcome.report }, { headers });
}
