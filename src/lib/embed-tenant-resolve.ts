import { createHash } from "node:crypto";
import type { NextRequest } from "next/server";
import type { EmbedTenant } from "@/lib/embed-tenants";
import { getEmbedTenantByKeyHash } from "@/lib/embed-tenants";

function hashApiKey(raw: string): string {
  return createHash("sha256").update(raw, "utf8").digest("hex");
}

function normaliseOrigin(o: string): string {
  return o.replace(/\/$/, "").toLowerCase();
}

/**
 * When `allowedOrigins` is empty, any parent is accepted (dev / same-site).
 * Otherwise `embedReferrer` must be a URL whose origin matches an allowed entry.
 */
export function embedParentOriginAllowed(allowedOrigins: string[], embedReferrer: string | null | undefined): boolean {
  if (!allowedOrigins.length) return true;
  const ref = (embedReferrer ?? "").trim();
  if (!ref) return false;
  try {
    const origin = normaliseOrigin(new URL(ref).origin);
    const allowed = allowedOrigins.map((a) => {
      try {
        return normaliseOrigin(new URL(a).origin);
      } catch {
        return normaliseOrigin(a);
      }
    });
    return allowed.includes(origin);
  } catch {
    return false;
  }
}

export function extractEmbedApiKey(
  request: NextRequest,
  body?: Record<string, unknown> | null,
  form?: globalThis.FormData | null
): string | null {
  const auth = request.headers.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) {
    const t = auth.slice(7).trim();
    if (t && t.startsWith("blw_")) return t;
  }
  const h = request.headers.get("x-basiclaw-embed-key")?.trim();
  if (h) return h;
  const q = request.nextUrl.searchParams.get("key")?.trim();
  if (q) return q;
  if (form) {
    const fk = form.get("embedApiKey");
    if (typeof fk === "string" && fk.trim()) return fk.trim();
  }
  const fromBody = body && typeof body.embedApiKey === "string" ? body.embedApiKey.trim() : "";
  if (fromBody) return fromBody;
  return null;
}

export function extractEmbedReferrer(
  body?: Record<string, unknown> | null,
  form?: globalThis.FormData | null
): string | null {
  if (form) {
    const v = form.get("embedReferrer");
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  const fromBody = body && typeof body.embedReferrer === "string" ? body.embedReferrer.trim() : "";
  return fromBody || null;
}

export type EmbedKeyResolution =
  | { ok: true; tenant: null }
  | { ok: true; tenant: EmbedTenant }
  | { ok: false; status: 401 | 403; error: string };

export async function resolveEmbedTenantForRequest(
  request: NextRequest,
  json?: Record<string, unknown> | null,
  form?: globalThis.FormData | null
): Promise<EmbedKeyResolution> {
  const merged: Record<string, unknown> = { ...(json ?? {}) };
  if (form) {
    const k = form.get("embedApiKey");
    if (typeof k === "string" && k.trim()) merged.embedApiKey = k.trim();
    const r = form.get("embedReferrer");
    if (typeof r === "string" && r.trim()) merged.embedReferrer = r.trim();
  }

  const rawKey = extractEmbedApiKey(request, merged, null);
  if (!rawKey) return { ok: true, tenant: null };

  const tenant = await getEmbedTenantByKeyHash(hashApiKey(rawKey));
  if (!tenant) {
    return { ok: false, status: 401, error: "invalid_embed_key" };
  }

  const ref = extractEmbedReferrer(merged, form);
  if (!embedParentOriginAllowed(tenant.allowedOrigins, ref)) {
    return { ok: false, status: 403, error: "embed_origin_not_allowed" };
  }

  return { ok: true, tenant };
}
