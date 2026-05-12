import { createHash } from "node:crypto";
import { headers } from "next/headers";
import type { EmbedTenant } from "@/lib/embed-tenants";
import { getEmbedTenantByKeyHash } from "@/lib/embed-tenants";
import { embedParentOriginAllowed } from "@/lib/embed-tenant-resolve";
import { parseAccentHex, parseEmbedLogoUrl } from "@/lib/embed-params";
import { issueEmbedEventToken } from "@/lib/embed-event-token";

function hashApiKey(raw: string): string {
  return createHash("sha256").update(raw, "utf8").digest("hex");
}

export type EmbedPageBootstrap = {
  apiKey: string | null;
  tenant: EmbedTenant | null;
  embedEventToken: string | null;
  /** Resolved accent CSS (#rrggbb) for the shell */
  accentCss: string | null;
  logoUrl: string | null;
};

/**
 * Validates optional `key` against the incoming Referer and returns safe props for embed clients.
 */
export async function loadEmbedPageBootstrap(opts: {
  apiKeyRaw: string | undefined;
  logoQuery: string | undefined;
  accentQuery: string | undefined;
  /** When no valid tenant, `?accent=` is still applied (anonymous embed). */
  accentIfAnonymous: string | null;
}): Promise<EmbedPageBootstrap> {
  const h = await headers();
  const referer = h.get("referer") ?? h.get("referrer");
  const apiKeyRaw = opts.apiKeyRaw?.trim();
  if (!apiKeyRaw) {
    return {
      apiKey: null,
      tenant: null,
      embedEventToken: null,
      accentCss: opts.accentIfAnonymous,
      logoUrl: null,
    };
  }

  const tenant = await getEmbedTenantByKeyHash(hashApiKey(apiKeyRaw));
  if (!tenant || !embedParentOriginAllowed(tenant.allowedOrigins, referer)) {
    return {
      apiKey: null,
      tenant: null,
      embedEventToken: null,
      accentCss: opts.accentIfAnonymous,
      logoUrl: null,
    };
  }

  const isPro = tenant.plan === "pro";
  const logoUrl = isPro ? parseEmbedLogoUrl(opts.logoQuery) : null;
  const accentOverride = isPro ? parseAccentHex(opts.accentQuery) : null;
  const accentCss = isPro ? accentOverride ?? opts.accentIfAnonymous : null;

  return {
    apiKey: apiKeyRaw,
    tenant,
    embedEventToken: issueEmbedEventToken(tenant.id),
    accentCss,
    logoUrl,
  };
}
