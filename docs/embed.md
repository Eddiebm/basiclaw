# BasicLaw embed (iframe)

Embeddable widgets live at:

- `GET /embed/ask` — plain-language legal Q&A (educational, not legal advice).
- `GET /embed/audit` — short contract / clause risk read.

Build iframe URLs on your origin with query parameters (see the in-app **Embed** developer page under each locale).

## Optional API key (`?key=`)

Admins can create **embed tenants** via:

- `POST /api/embed/tenants` (Clerk admin or `ADMIN_EMAILS`) — body: `{ "label": "My site", "allowedOrigins": ["https://example.com"], "plan": "free" | "pro" }`.
- `GET /api/embed/tenants` — list tenants (no secret key material; only `keyPrefix`).

The response includes a **raw API key once** (`blw_…`). Store it server-side; only a SHA-256 hash is persisted.

### Passing the key

- Query: `?key=blw_…` on `/embed/ask` or `/embed/audit`, and/or
- Header on API calls: `x-basiclaw-embed-key: blw_…`, and/or
- JSON body fields: `embedApiKey`, `embedReferrer` (see below), and/or
- `Authorization: Bearer blw_…` (only if the token starts with `blw_`; other Bearer tokens are left alone).

### Parent origin allow-list

If the tenant has a non-empty `allowedOrigins`, every `/api/chat` and `/api/audit` request must include **`embedReferrer`** set to a full URL (typically `document.referrer` from the iframe). Its **origin** must match one of the configured origins. Empty `allowedOrigins` disables this check (useful for local testing).

## Rate limits

Without a key, anonymous IP limits apply as for the public site. With a valid key, usage is counted per **tenant** (`free` ≈ default caps; `pro` = higher chat/audit limits).

## Pro branding

Tenants on `plan: "pro"` may add:

- `?logo=https://…` — HTTPS logo URL, shown above the widget.
- `?accent=#RRGGBB` — widget accent (validated hex).

Free tenants ignore `logo` / `accent` for branding; the default **Powered by BasicLaw** footer stays visible (Pro + logo uses a shorter attribution line).

## Signed telemetry (`EMBED_JWT_SECRET`)

When `EMBED_JWT_SECRET` is set, the server issues an **embed event token** for validated embed pages. The iframe client sends it as:

`Authorization: Bearer <token>`

on `POST /api/embed/event`. The token is an HMAC-signed JSON payload (`tid` = tenant id, `exp` = expiry). Logs include `signedTenantId` when verification succeeds so usage can be attributed even if the iframe is reframed.

If `EMBED_JWT_SECRET` is unset, telemetry still works but **no signed attribution** is available.
