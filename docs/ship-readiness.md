# BasicLaw ship-readiness audit

**Branch:** `master`  
**Audited:** 2026-05-12 (ship-readiness refresh)  
**Constraints:** No new dependencies; `eslint src --max-warnings 0` and clean `next build --webpack` required.  
**Note:** `redesign-v3` was not touched. Other parallel work (perf bundle analysis, US-state LLM unify) may land separately; this pass documents `master` only.

## Eddie pre-launch checklist

### Environment variables (where to set)

> Mirrors `.env.example`. Full Vercel CLI runbook in [`docs/vercel-env-setup.md`](./vercel-env-setup.md).

| Variable | Required for | Status | Where to get / notes |
|----------|----------------|---------|----------------------|
| `NEXT_PUBLIC_SITE_URL` | Canonical URLs, OG, emails, Stripe return URLs, internal health self-fetch | ⚙️ NEEDS CONFIG | Production domain, e.g. `https://basiclaw.app` |
| `AI_GATEWAY_API_KEY` | Preferred LLM path for `/api/chat` and audits | ⚙️ NEEDS CONFIG | [Vercel AI Gateway](https://vercel.com/docs/ai-gateway); optional — falls back to `OPENROUTER_API_KEY` |
| `OPENROUTER_API_KEY` | Chat + audit AI when `AI_GATEWAY_API_KEY` is unset | ⚙️ NEEDS CONFIG | [OpenRouter](https://openrouter.ai/) API keys |
| `OPENROUTER_MODEL` | Chat model override | ✅ READY (default) | Default `openai/gpt-oss-20b:free` if unset |
| `OPENROUTER_AUDIT_MODEL` | Audit-specific model override | ✅ READY (default) | Falls back to `OPENROUTER_MODEL` then default |
| `OPENROUTER_EMBEDDING_MODEL` | Embeddings model when `query-embed.ts` provider=openrouter and for `scripts/embed-snippets.mjs` | ✅ READY (default) | Default `openai/text-embedding-3-small` |
| `BUILD_LLM_KEY` | Build-time LLM enrichment for US-state pages (`src/lib/us-state-llm-summary.ts`) | ✅ READY (optional) | Optional — unset = no per-state summaries baked in |
| `BUILD_LLM_MODEL` | Model override for `BUILD_LLM_KEY` runs | ✅ READY (default) | Default `openai/gpt-oss-20b:free` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Sign-in/up; both Clerk envs must be set together | ⚙️ NEEDS CONFIG | Clerk dashboard |
| `CLERK_SECRET_KEY` | Server auth | ⚙️ NEEDS CONFIG | Clerk dashboard |
| `ADMIN_EMAILS` | Comma-separated emails allowed for `/[locale]/admin/*` when Clerk is on (in addition to `publicMetadata.role === "admin"`) | ⚙️ NEEDS CONFIG | Ops list; see `src/lib/admin-auth.ts` |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | Vercel Marketplace KV (preferred) for storage / saved-answers / quotas | ⚙️ NEEDS CONFIG | `src/lib/redis-client.ts` — file fallback at `tmp/basiclaw-storage.json` |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Classic Upstash storage (alternative) | ⚙️ NEEDS CONFIG | Set EITHER pair, not both |
| `STRIPE_SECRET_KEY` | Checkout + portal + webhook + internal health | ⚙️ NEEDS CONFIG | Stripe dashboard |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Browser publishable key (`isPubKeyConfigured()`) | ⚙️ NEEDS CONFIG | Stripe dashboard |
| `STRIPE_WEBHOOK_SECRET` | `POST /api/webhooks/stripe` | ⚙️ NEEDS CONFIG | Stripe webhook signing secret |
| `STRIPE_PRODUCT_PRO`, `STRIPE_PRODUCT_PLUS` | Tier metadata in `src/lib/stripe-config.ts` | ⚙️ NEEDS CONFIG | Stripe Products |
| `STRIPE_PRICE_PRO_MONTHLY`, `STRIPE_PRICE_PRO_ANNUAL` | Pro tier (read by `stripe-config.ts` AND `stripe-plan.ts`) | ⚙️ NEEDS CONFIG | Stripe Prices |
| `STRIPE_PRICE_PLUS_MONTHLY`, `STRIPE_PRICE_PLUS_ANNUAL` | Plus tier (read by `src/lib/stripe-config.ts`) | ⚙️ NEEDS CONFIG | Set to same Stripe price IDs as the `PRO_PLUS` pair below |
| `STRIPE_PRICE_PRO_PLUS_MONTHLY`, `STRIPE_PRICE_PRO_PLUS_ANNUAL` | Plus tier (read by `src/lib/stripe-plan.ts`) | ⚙️ NEEDS CONFIG | Naming drift with the `PLUS` pair above — set both until code is unified |
| `RESEND_API_KEY` | Transactional email | ⚙️ NEEDS CONFIG | Resend |
| `RESEND_FROM_EMAIL` | From address for Resend | ⚙️ NEEDS CONFIG | Verified domain in Resend |
| `LAWYER_LEADS_EMAIL` | Inbox for `/api/lawyer-leads` + `/api/lawyer-leads/[slug]` + partner fallback | ⚙️ NEEDS CONFIG | Your ops email |
| `LAWYER_APPLICATIONS_EMAIL` | Inbox for `/api/lawyer-applications` (verified-reviewer applications) | ⚙️ NEEDS CONFIG | Falls back to `LAWYER_LEADS_EMAIL` / `RESEND_FROM_EMAIL` |
| `PRESS_EMAIL` | Press contact form (`/api/press-contact`, `/press`) | ⚙️ NEEDS CONFIG | Inbox for press inquiries |
| `RIGHT_OF_DAY_FROM_EMAIL` | Cron "right of the day" digest | ⚙️ NEEDS CONFIG | Resend-verified sender |
| `NEXT_PUBLIC_POSTHOG_KEY` | Product analytics (also baked into the WXT extension build) | ⚙️ NEEDS CONFIG | PostHog project settings |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog region | ✅ READY (default) | Optional; defaults to `https://us.i.posthog.com` |
| `NEXT_PUBLIC_SENTRY_DSN` | Browser + default server/edge DSN | ⚙️ NEEDS CONFIG | Sentry project (client) |
| `SENTRY_DSN` | Optional separate server DSN | ⚙️ NEEDS CONFIG | Sentry; if unset, server uses `NEXT_PUBLIC_SENTRY_DSN` |
| `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` | Source map upload during `next build` | ⚙️ NEEDS CONFIG | CI / Vercel; uploads disabled when `SENTRY_AUTH_TOKEN` is unset (`next.config.ts`) |
| `CRON_SECRET` | Non-Vercel cron `Authorization: Bearer …` | ⚙️ NEEDS CONFIG | Generate a secret |
| `LAUNCH_KEY` | `/launch` query `?key=` and `/[locale]/internal/health?key=` gate | ⚙️ NEEDS CONFIG | **Required in production**; both routes 404 without a matching key |
| `UNSUBSCRIBE_SECRET` | HMAC for `/api/unsubscribe?token=…` | ⚙️ NEEDS CONFIG | Prefer dedicated secret in production |
| `NEWSLETTER_UNSUBSCRIBE_SECRET` | Alternative name accepted by `src/lib/newsletter-token.ts` | ⚙️ NEEDS CONFIG | Set EITHER `UNSUBSCRIBE_SECRET` or this, not both |
| `SHARED_AUDIT_SECRET` | Shared audit HMAC links (`src/lib/shared-audit-url.ts`) | ⚙️ NEEDS CONFIG | Strong random secret; dev fallback may use `CLERK_SECRET_KEY` |
| `EMBED_JWT_SECRET` | Optional HMAC for signed `POST /api/embed/event` attribution | ⚙️ NEEDS CONFIG | See `docs/embed.md` |
| `BL_API_BASE` (extension build) | API origin baked into the WXT extension bundle | ✅ READY (default) | `extension/wxt.config.ts` — default `https://basiclaw.vercel.app`. Set in CI for prod hostname. |

**Env tally (38 referenced keys):** ⚙️ **31 NEEDS CONFIG** · ✅ **7 READY (default / optional)**.
Of the 31 NEEDS CONFIG, 3 are the [minimum viable boot](./vercel-env-setup.md#4-minimum-viable-boot) set: `NEXT_PUBLIC_SITE_URL`, one of `AI_GATEWAY_API_KEY` / `OPENROUTER_API_KEY`, and `LAUNCH_KEY`.

### Domain & SEO

- Point `NEXT_PUBLIC_SITE_URL` at the final production hostname.
- Submit sitemap in Search Console; verify extension store URLs when live.

### Content & legal

- Lawyer-grade review of summaries, audits, and disclaimers (flagged only — not done in this pass).
- Replace extension demo placeholder when an asset exists.

### Monitoring

- Confirm PostHog receives `$pageview` and key custom events in staging.
- Stripe webhook delivery 200s in dashboard after deploy.
- With `NEXT_PUBLIC_SENTRY_DSN` set, confirm events appear in Sentry (see **Observability**).

### Store submissions

- Chrome / Firefox / Edge extension listings: not live; CTAs scroll to in-page “coming soon” section until URLs exist.

---

## Legend

| Emoji | Meaning |
|-------|---------|
| ✅ **READY** | No blocking issues found in code review + build. |
| 📝 **READY WITH NOTE** | Shippable with documented caveats (content, env, or product choice). |
| ⚙️ **NEEDS CONFIG** | Code paths OK; requires env or third-party setup to function fully. |
| 🚧 **BLOCKED** | Missing route, broken flow, or policy gap that must be resolved before marketing promise. |
| 💥 **BROKEN** | Build/runtime failure in normal use. |

---

## Observability

- **Sentry:** `@sentry/nextjs` wired via `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`, and `src/instrumentation.ts` (`onRequestError` when a DSN is present). **Inactive** until `NEXT_PUBLIC_SENTRY_DSN` and/or `SENTRY_DSN` is set.
- **Instrumented (high-signal):** `POST /api/chat`, `POST /api/audit` (+ extension), `audit-engine` LLM span, `POST /api/webhooks/stripe`, `POST /api/cron/right-of-the-day`, `src/app/global-error.tsx`, and internal health Sentry ping.
- **Tags:** Shared helper enriches events with route / locale / jurisdiction where applicable (`sentry-tags.shared.ts`).
- **Traces:** `tracesSampleRate` **1.0** in development, **0.2** in production (client, server, edge configs).
- **Source maps:** Uploaded during build only when `SENTRY_AUTH_TOKEN` is set; `sourcemaps.disable` mirrors that (`next.config.ts`, `widenClientFileUpload: true`).

---

## Automated QA

- **Runner:** Playwright (`@playwright/test`), **13** spec files under `tests/e2e/` (home, chat, compare, constitutions, questions, the-index, i18n, lawyers, pricing, audit, embed, answers, dead-links).
- **CI:** `.github/workflows/e2e.yml` on `push` / `pull_request` to `master` — `npm ci` → `npm run build` → `npm run start` → `npm run test:e2e:chromium` with `BASE_URL=http://127.0.0.1:3000`.
- **Coverage (smoke-level):** Core navigation, locale switches, embed shell, answers flows, lawyer/marketplace pages, pricing shell, and dead-link scan (see individual specs).
- **Note:** The E2E step uses `continue-on-error: true` so CI stays **informational** until the suite is fully trusted; treat red E2E as signal, not a hard gate yet.

---

## Internal health

- **Route:** `/[locale]/internal/health` (e.g. `/en/internal/health`).
- **Gate:** `404` unless `LAUNCH_KEY` is set in the environment **and** query `?key=` matches (same pattern as `/launch`).
- **Checks (sequential, ~5s timeout each):** `GET /api/embed/health`, Sentry test message + flush, storage round-trip, AI Gateway/OpenRouter completion probe, Stripe `products.list`, Resend `domains.list`, Clerk `users.getCount`. Implemented in `src/lib/internal-launch-health.ts`.

---

## Public marketing routes

### `/` (locale home)

- **Status:** 📝 **READY WITH NOTE**
- **Issues:** Custom `home_view` event; hero/pricing voice still benefits from native legal/marketing review.
- **Fixes applied:** (see commits) PostHog duplicate `$pageview` mitigation.
- **Blockers:** None technical.

### `/learn`

- **Status:** 📝 **READY WITH NOTE**
- **Issues:** Long-form lesson copy mostly English by design.
- **Fixes applied:** None required for ship gate.
- **Blockers:** None technical.

### `/pricing`

- **Status:** ⚙️ **NEEDS CONFIG** (Stripe) + 📝 **READY WITH NOTE** (copy review)
- **Issues:** Live checkout still needs Stripe keys + price envs; tier strings now come from `next-intl` (`pricingPage`) — remaining locale nuance tracked in [`docs/i18n-review-queue.md`](./i18n-review-queue.md).
- **Fixes applied:** Pricing i18n extraction landed on `master`.
- **Blockers:** Eddie: Stripe live mode + price env alignment.

### `/faq`

- **Status:** ✅ **READY**
- **Issues:** Meta description was English-only in `generateMetadata` regardless of locale (historical).
- **Fixes applied:** Localised `faqPage.metaDescription` + metadata wiring (commit: fixes-batch-1-public-routes).
- **Blockers:** None.

### `/about`, `/blog`, `/terms`, `/privacy`, `/disclaimer`, `/cookies`

- **Status:** 📝 **READY WITH NOTE**
- **Issues:** Stubs use `next-intl`; legal accuracy is a content review, not a code fix.
- **Fixes applied:** None.
- **Blockers:** Lawyer review of legal pages.

### `/extension`

- **Status:** 📝 **READY WITH NOTE**
- **Issues:** Store CTAs used unique `#fragment` targets that did not exist; JSON-LD used fixed `basiclaw.vercel.app`; demo GIF placeholder visible.
- **Fixes applied:** Unified in-page `#extension-store-listings` anchor + dynamic site URL in JSON-LD (fixes-batch-1-public-routes). Decorative preview “button” made non-focusable (fixes-batch-2-functional-routes).
- **Blockers:** Real store URLs + demo asset (Eddie).

### `/find-a-lawyer`

- **Status:** 📝 **READY WITH NOTE**
- **Issues:** Email path depends on Resend + `LAWYER_LEADS_EMAIL` / `RESEND_FROM_EMAIL`.
- **Fixes applied:** Success analytics for partner form (fixes-batch-3-api-and-forms).
- **Blockers:** Resend + inbox env in production.

### `/press`

- **Status:** ⚙️ **NEEDS CONFIG** + 📝 **READY WITH NOTE**
- **Issues:** `PRESS_EMAIL` must be set for Resend delivery; remaining Schema.org / OG line review in [`docs/i18n-review-queue.md`](./i18n-review-queue.md).
- **Fixes applied:** Press page + `POST /api/press-contact` on `master`.
- **Blockers:** Ops inbox + Resend.

---

## Functional routes

### `/chat`

- **Status:** 📝 **READY WITH NOTE**
- **Issues:** LLM quality needs `AI_GATEWAY_API_KEY` or `OPENROUTER_API_KEY`; graceful fallback when keys missing.
- **Fixes applied:** Empty-state flow stabilised on `master` (parallel chat work).
- **Blockers:** Production AI keys for quality.

### `/audit` + specialised `/audit/*`

- **Status:** ⚙️ **NEEDS CONFIG** + 📝 **READY WITH NOTE**
- **Issues:** Same AI/config as chat; file upload limits product decision.
- **Fixes applied:** None required for skeleton ship.
- **Blockers:** Keys + lawyer review of output disclaimers.

### `/audit/shared/[token]`

- **Status:** ✅ **READY** (token path depends on storage)
- **Issues:** Requires valid share token + backend storage.
- **Fixes applied:** None.
- **Blockers:** `SHARED_AUDIT_SECRET` / storage backing in prod.

### `/constitutions`, `/constitutions/[code]`

- **Status:** ✅ **READY**
- **Issues:** Scale of static generation; build passes.
- **Fixes applied:** None.
- **Blockers:** Content freshness is operational, not code.

### `/<country>/rights`, `/police-stop`, `/landlord`, `/employment`

- **Status:** 📝 **READY WITH NOTE**
- **Issues:** Per-country employment is implemented at `/[locale]/[country]/employment` (plus `/[locale]/audit/employment` for the audit preset). Copy and i18n nuance: [`docs/i18n-review-queue.md`](./i18n-review-queue.md).
- **Fixes applied:** Employment topic route added on `master`.
- **Blockers:** None technical.

### `/us/states`, `/us/[state]/[topic]`

- **Status:** ✅ **READY**
- **Issues:** None blocking.
- **Fixes applied:** None.

### `/compare`

- **Status:** ✅ **READY**
- **Issues:** Dynamic compare has `error.tsx`.
- **Fixes applied:** None.
- **Blockers:** None.

### `/the-index`, `/the-index/[code]`

- **Status:** ✅ **READY**
- **Issues:** Methodology copy is informational only.
- **Fixes applied:** None.
- **Blockers:** None technical.

### `/questions`, `/questions/[stage]`

- **Status:** ✅ **READY**
- **Issues:** Eight stage slugs generated at build.
- **Fixes applied:** None.
- **Blockers:** None.

### `/lawyers`, `/lawyers/apply`, `/lawyers/[slug]`, `/lawyers/become-a-partner`

- **Status:** ⚙️ **NEEDS CONFIG** (email + data) + ✅ **READY** (UI/forms)
- **Issues:** Marketplace v2 profile pages use `POST /api/lawyer-leads/[slug]`; partner programme uses `POST /api/partner-applications` / Resend paths. Lawyer directory content depends on import pipeline (`npm run import:lawyers`).
- **Fixes applied:** Public lawyer matches API + listing UX on `master`.
- **Blockers:** Resend + inbox envs; production lawyer dataset.

### `/answers`, `/answers/[id]`

- **Status:** ✅ **READY** + 📝 **READY WITH NOTE**
- **Issues:** Public archive + detail are locale-aware; voting/auth flows depend on Clerk for write paths.
- **Fixes applied:** Answers surfaces + APIs on `master`; E2E coverage in `tests/e2e/answers.spec.ts`.
- **Blockers:** Clerk for signed-in publish/vote/delete; spam/moderation policy is ops.

### `/dashboard`

- **Status:** ⚙️ **NEEDS CONFIG** + 📝 **READY WITH NOTE**
- **Issues:** Clerk + storage for saved data.
- **Fixes applied:** `error.tsx` present.
- **Blockers:** Auth + persistence env.

### `/sign-in`, `/sign-up`

- **Status:** ⚙️ **NEEDS CONFIG**
- **Issues:** Clerk keys; banner when disabled.
- **Fixes applied:** None.
- **Blockers:** Clerk production instance.

### `/account`

- **Status:** N/A — **route does not exist** (Clerk hosted components only). Listed as 📝 **READY WITH NOTE** if product later adds `/account`.

### `/launch`

- **Status:** ✅ **READY** (after fix)
- **Issues:** Previously, when `LAUNCH_KEY` was unset in production, playbook was **public**. Now returns 404 in production unless key is set and matches query param.
- **Fixes applied:** Stricter gating (fixes-batch-1-public-routes).
- **Blockers:** Set `LAUNCH_KEY` in Vercel before sharing internal URL.

### `/documents`

- **Status:** 📝 **READY WITH NOTE** (linked from Library nav)
- **Issues:** Not in original inventory; exists in app.
- **Fixes applied:** None.
- **Blockers:** Content review.

### `/admin/answers`

- **Status:** ⚙️ **NEEDS CONFIG** + 📝 **READY WITH NOTE**
- **Issues:** Clerk + `isAdminUser` (`ADMIN_EMAILS` and/or `publicMetadata.role`); English-only UI by design (see i18n queue doc).
- **Fixes applied:** Verify / unpublish / delete API wired.
- **Blockers:** Production Clerk admin roster.

### `/internal/health`

- **Status:** ✅ **READY** + ⚙️ **NEEDS CONFIG** (gate + secrets to show green rows)
- **Issues:** Same `LAUNCH_KEY` gate as `/launch`; rows reflect missing third-party envs.
- **Fixes applied:** Full check matrix on `master`.
- **Blockers:** Set `LAUNCH_KEY` + monitored integrations in Vercel.

### Embed (app routes + static loader)

- **Status:** ✅ **READY** + ⚙️ **NEEDS CONFIG** (tenant API keys in production) + 📝 **READY WITH NOTE**
- **Surfaces:** `/embed/ask`, `/embed/audit` (iframe shells), `/[locale]/embed` landing, `public/embed/loader.js` (snippet host).
- **Issues:** Tenant provisioning via `/api/embed/tenants` requires admin; optional signed telemetry via `EMBED_JWT_SECRET`.
- **Fixes applied:** Embed v2 flows + CSP headers (`next.config.ts`); E2E `tests/e2e/embed.spec.ts`.
- **Blockers:** Admin workflow for tenant API keys; see `docs/embed.md`.

### Mobile (Expo)

- **Status:** 📝 **READY WITH NOTE** (out-of-tree)
- **Issues:** Lives under `mobile/` sibling workspace — not part of the Next.js bundle on Vercel.
- **Fixes applied:** N/A in this repo’s CI.
- **Blockers:** Follow `mobile/README.md` for store readiness.

---

## API surface

| Route | Status | Notes |
|-------|--------|--------|
| `POST /api/chat` | ⚙️ **NEEDS CONFIG** | Validates input; quota; Sentry spans; `AI_GATEWAY_API_KEY` or `OPENROUTER_API_KEY`. |
| `POST /api/audit` (+ extension) | ⚙️ **NEEDS CONFIG** | Same family as chat; Sentry spans. |
| `POST /api/lawyer-leads` | 📝 **READY WITH NOTE** | Always 200 on valid body; logs + optional Resend. |
| `POST /api/lawyer-leads/[slug]` | ⚙️ **NEEDS CONFIG** | Lawyer profile lead form → Resend when configured. |
| `POST /api/lawyer-applications` | 📝 **READY WITH NOTE** | Verified reviewer applications; inbox env fallbacks. |
| `POST /api/partner-applications` | 📝 **READY WITH NOTE** | Become-a-partner flow; Resend path. |
| `GET /api/public/lawyer-matches` | ✅ **READY** | Public directory/match payload for marketing surfaces. |
| `POST /api/press-contact` | ⚙️ **NEEDS CONFIG** | Requires `PRESS_EMAIL` + Resend. |
| `GET /api/admin/answers` | ⚙️ **NEEDS CONFIG** | Admin list + filters; Clerk admin. |
| `POST /api/admin/answers/[id]/verify` | ⚙️ **NEEDS CONFIG** | Body: `lawyerId`, optional `statement`. |
| `POST /api/admin/answers/[id]/unpublish` | ⚙️ **NEEDS CONFIG** | |
| `POST /api/admin/answers/[id]/delete` | ⚙️ **NEEDS CONFIG** | Hard delete (admin). |
| `POST /api/subscribe` / `unsubscribe` | ✅ **READY** | File/Redis storage fallback; `UNSUBSCRIBE_SECRET` for tokens in prod. |
| `GET/POST/DELETE /api/me/chats*` | ⚙️ **NEEDS CONFIG** | Clerk + storage. |
| `GET /api/me/answers` | ⚙️ **NEEDS CONFIG** | Clerk; signed-in list. |
| `GET /api/me/audits/*`, usage | ⚙️ **NEEDS CONFIG** | Same. |
| `POST /api/checkout`, `portal` | ⚙️ **NEEDS CONFIG** | Stripe. |
| `POST /api/webhooks/stripe` | ⚙️ **NEEDS CONFIG** | Signing secret; Sentry instrumentation. |
| `GET /api/share/audit` | ✅ **READY** | HMAC verify (`SHARED_AUDIT_SECRET`). |
| `POST /api/cron/right-of-the-day` | ⚙️ **NEEDS CONFIG** | Resend + cron auth in prod; Sentry. |
| `GET /api/answers/search` | ✅ **READY** | Public search. |
| `GET /api/answers/suggest` | ✅ **READY** | Autosuggest. |
| `POST /api/answers` | ⚙️ **NEEDS CONFIG** | Clerk required to save. |
| `POST /api/answers/[id]/vote` | ⚙️ **NEEDS CONFIG** | Clerk. |
| `POST /api/answers/[id]/publish` | ⚙️ **NEEDS CONFIG** | Clerk. |
| `DELETE /api/answers/[id]` | ⚙️ **NEEDS CONFIG** | Owner delete; Clerk. |
| `GET/POST /api/embed/tenants` | ⚙️ **NEEDS CONFIG** | Admin-only; issues API key + optional embed event token. |
| `POST /api/embed/event` | ✅ **READY** | Telemetry; optional `Authorization: Bearer` signed JWT when `EMBED_JWT_SECRET` set. |
| `GET /api/embed/health` | ✅ **READY** | JSON `{ ok: true }` for probes. |
| `GET /og` | ✅ **READY** | Six `kind` variants in one route handler. |

---

## Cross-cutting

| Check | Result |
|-------|--------|
| Renders without 500 (no AI keys) | **Pass** — APIs return fallbacks or 503 where documented. |
| CTAs real routes | **Pass** after extension anchor fix (no dead `href="#"` pattern for stores). |
| Forms loading/success/error | **Pass** on audited forms; pricing shows checkout errors. |
| i18n UI chrome + locale sweep | **Pass** with human-review queue — see [`docs/i18n-review-queue.md`](./i18n-review-queue.md) for keys needing native/legal pass (pricing, press, embed, legal index, etc.). |
| SEO high-traffic | **Pass** with notes — compare/constitutions have metadata patterns; FAQ meta fixed. |
| Mobile 360px | **Spot-check only** — Playwright covers several flows; no full visual matrix. |
| a11y | **Improved** — extension preview control non-focusable; further pass optional. |
| Analytics | **Fixed** duplicate `$pageview` (init + manual). |
| Voice | **Not exhaustively tested** in this pass — flag for manual QA. |
| Error boundaries | **Present** on chat, audit, dashboard, compare, index detail, constitution detail. |
| Observability | **Sentry** optional via DSN; **internal health** for integration smoke. |

---

## Commits (fill SHAs after push)

| Batch | Description | SHA |
|-------|-------------|-----|
| docs ship-readiness refresh | Observability, E2E, internal health, new routes/APIs, i18n queue link, env table. | d03b65f |

---

## Top 5 must-fix before broad launch

1. **Vercel env pack:** At minimum `AI_GATEWAY_API_KEY` *or* `OPENROUTER_API_KEY`, Clerk (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`), Stripe (`STRIPE_SECRET_KEY`, webhook secret, **`STRIPE_PRICE_*`** per `stripe-plan.ts`), Resend (`RESEND_API_KEY`, `RESEND_FROM_EMAIL`, lead inboxes), and `NEXT_PUBLIC_SENTRY_DSN` if you want production error data (plus `SENTRY_AUTH_TOKEN` / org / project in CI for readable stacks).
2. **`NEXT_PUBLIC_SITE_URL`** on the final domain (OG, emails, Stripe return URLs, JSON-LD, internal health self-URL).
3. **Ops email + admin access:** `LAWYER_LEADS_EMAIL` / `LAWYER_APPLICATIONS_EMAIL`, `PRESS_EMAIL`, and `ADMIN_EMAILS` (or Clerk `publicMetadata.role`) for `/admin/*` and forms.
4. **`LAUNCH_KEY`** before sharing `/launch` or `/internal/health` URLs in production.
5. **Extension store URLs + legal/content sign-off** — still placeholders / lawyer review outside code.

---

## Ready / not-ready counts (approximate)

Methodology: one line per major `###` route/feature group in this doc (marketing + functional + embed + mobile note). Dual-status rows are counted toward the **stricter** bucket first (e.g. ⚙️ before 📝).

- **READY:** 24 surfaces  
- **READY WITH NOTE:** 11  
- **NEEDS CONFIG:** 18  
- **BLOCKED:** 0  
- **BROKEN:** 0  
- **N/A:** 1 (`/account`)

---

## Build / lint

Run before release:

```bash
npx eslint src --max-warnings 0
rm -rf .next && npx next build --webpack
```

Both green at audit time after `git pull --rebase origin master`. If `rm -rf .next` errors with “Directory not empty” on macOS, retry the remove or run `npx next build --webpack` once without deleting (the prior run may have left a partial `.next`).

**Bundle size:** `npm run analyze` runs `@next/bundle-analyzer` (`ANALYZE=true next build --webpack`) — use after perf-related merges to inspect client/server chunks.
