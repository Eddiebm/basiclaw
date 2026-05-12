type TagEvent = {
  tags?: Record<string, unknown>;
  request?: { url?: string };
};

/**
 * Enriches Sentry events with route / locale / jurisdiction when derivable
 * from the browser URL or server request URL (query params or path).
 */
export function applyRouteLocaleJurisdictionTags(event: TagEvent): void {
  const tags: Record<string, string> = {};
  for (const [k, v] of Object.entries(event.tags ?? {})) {
    if (v != null && v !== "") tags[k] = String(v);
  }

  if (typeof window !== "undefined") {
    tags.route = window.location.pathname;
    const parts = window.location.pathname.split("/").filter(Boolean);
    const maybeLocale = parts[0];
    if (maybeLocale && /^[a-z]{2}(-[a-z]+)?$/i.test(maybeLocale)) {
      tags.locale = maybeLocale;
    }
    const sp = new URLSearchParams(window.location.search);
    const country = sp.get("country") ?? sp.get("jurisdiction");
    if (country) tags.jurisdiction = country;
    const tenant = sp.get("tenantId") ?? sp.get("tenant");
    if (tenant) tags.embedTenantId = tenant;
    event.tags = tags;
    return;
  }

  const reqUrl = event.request?.url;
  if (typeof reqUrl === "string" && reqUrl.length > 0) {
    try {
      const u = new URL(reqUrl);
      if (!tags.route) tags.route = u.pathname;
      const parts = u.pathname.split("/").filter(Boolean);
      const maybeLocale = parts[0];
      if (!tags.locale && maybeLocale && /^[a-z]{2}(-[a-z]+)?$/i.test(maybeLocale)) {
        tags.locale = maybeLocale;
      }
      const country = u.searchParams.get("country") ?? u.searchParams.get("jurisdiction");
      if (!tags.jurisdiction && country) tags.jurisdiction = country;
    } catch {
      /* ignore malformed URLs */
    }
  }

  event.tags = tags;
}
