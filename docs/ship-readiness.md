# BasicLaw ship-readiness audit

**Branch:** `master`  
**Audited:** 2026-05-12  
**Constraints:** No new dependencies; `eslint src --max-warnings 0` and clean `next build --webpack` required.  
**Note:** `redesign-v3` was not touched. Parallel worker changes to chat empty-state were integrated via stash/pop before final push (see git log).

## Eddie pre-launch checklist

### Environment variables (where to set)

| Variable | Required for | Where to get / notes |
|----------|----------------|----------------------|
| `OPENROUTER_API_KEY` | Chat + audit AI replies | [OpenRouter](https://openrouter.ai/) API keys |
| `OPENROUTER_MODEL` | Optional model override | Default in code if unset |
| `NEXT_PUBLIC_SITE_URL` | Canonical URLs, OG, emails, Stripe return URLs | Production domain, e.g. `https://basiclaw.app` |
| `NEXT_PUBLIC_POSTHOG_KEY` | Product analytics | PostHog project settings |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog region | Optional; defaults to US cloud |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Sign-in/up | Clerk dashboard |
| `CLERK_SECRET_KEY` | Server auth | Clerk dashboard |
| `STRIPE_SECRET_KEY` | Checkout + portal | Stripe dashboard |
| `STRIPE_WEBHOOK_SECRET` | `POST /api/webhooks/stripe` | Stripe webhook signing secret |
| Price IDs (see `src/lib/stripe-config.ts` or env names there) | Paid tiers | Stripe Products/Prices |
| `RESEND_API_KEY` | Lawyer lead emails, cron digest | Resend |
| `RESEND_FROM_EMAIL` | From address for Resend | Verified domain in Resend |
| `LAWYER_LEADS_EMAIL` | Inbox for `/api/lawyer-leads` | Your ops email |
| `RIGHT_OF_DAY_FROM_EMAIL` | Cron “right of the day” | Resend-verified sender |
| `CRON_SECRET` | Non-Vercel cron `Authorization: Bearer …` | Generate a secret |
| `SHARE_AUDIT_SECRET` or equivalent (see `shared-audit-url.ts`) | Shared audit HMAC links | Strong random secret |
| `LAUNCH_KEY` | **Required in production** for `/launch` query `?key=` | Long random string; without it, `/launch` returns 404 in prod |
| Redis / KV envs (if used) | `src/lib/storage.ts` fallbacks | Vercel KV / Upstash if configured |

### Domain & SEO

- Point `NEXT_PUBLIC_SITE_URL` at the final production hostname.
- Submit sitemap in Search Console; verify extension store URLs when live.

### Content & legal

- Lawyer-grade review of summaries, audits, and disclaimers (flagged only — not done in this pass).
- Replace extension demo placeholder when an asset exists.

### Monitoring

- Confirm PostHog receives `$pageview` and key custom events in staging.
- Stripe webhook delivery 200s in dashboard after deploy.

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

## Public marketing routes

### `/` (locale home)

- **Status:** 📝 **READY WITH NOTE**
- **Issues:** Custom `home_view` event; pricing copy in `PricingClient` still largely English strings in source (separate from nav i18n). Hero/pricing content review deferred.
- **Fixes applied:** (see commits) PostHog duplicate `$pageview` mitigation.
- **Blockers:** Full marketing localisation of pricing tier paragraphs is a content pass.

### `/learn`

- **Status:** 📝 **READY WITH NOTE**
- **Issues:** Long-form lesson copy mostly English by design.
- **Fixes applied:** None required for ship gate.
- **Blockers:** None technical.

### `/pricing`

- **Status:** ⚙️ **NEEDS CONFIG** (Stripe) + 📝 **READY WITH NOTE** (copy/i18n)
- **Issues:** Requires Stripe keys + price IDs for live checkout; tier marketing text hardcoded in English in `PricingClient.tsx`.
- **Fixes applied:** None in this pass (flag only — large i18n extraction avoided as scope).
- **Blockers:** Eddie: Stripe live mode + price env alignment.

### `/faq`

- **Status:** ✅ **READY**
- **Issues:** Meta description was English-only in `generateMetadata` regardless of locale.
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

---

## Functional routes

### `/chat`

- **Status:** 📝 **READY WITH NOTE**
- **Issues:** OpenRouter required for full AI; graceful fallback when key missing. Empty-state flow handled by parallel worker (stashed/pulled — do not redo).
- **Fixes applied:** None here (avoid overlap with worker).
- **Blockers:** `OPENROUTER_API_KEY` for production quality.

### `/audit` + specialised `/audit/*`

- **Status:** ⚙️ **NEEDS CONFIG** + 📝 **READY WITH NOTE**
- **Issues:** Same AI/config as chat; file upload limits product decision.
- **Fixes applied:** None required for skeleton ship.
- **Blockers:** Keys + lawyer review of output disclaimers.

### `/audit/shared/[token]`

- **Status:** ✅ **READY** (token path depends on storage)
- **Issues:** Requires valid share token + backend storage.
- **Fixes applied:** None.
- **Blockers:** `SHARE_AUDIT_SECRET` / storage backing in prod.

### `/constitutions`, `/constitutions/[code]`

- **Status:** ✅ **READY**
- **Issues:** Scale of static generation; build passes.
- **Fixes applied:** None.
- **Blockers:** Content freshness is operational, not code.

### `/<country>/rights`, `/police-stop`, `/landlord`

- **Status:** 📝 **READY WITH NOTE**
- **Issues:** Spec mentioned `/<country>/employment`; **not implemented** — only `rights`, `police-stop`, `landlord` exist. Employment lives under `/audit/employment` and US state topics.
- **Fixes applied:** None (product scope).
- **Blockers:** If marketing promises per-country employment pages, add routes or fix copy.

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

### `/lawyers`, `/lawyers/apply`

- **Status:** ⚙️ **NEEDS CONFIG** (email) + ✅ **READY** (forms)
- **Issues:** Application form needs Resend for notifications if desired.
- **Fixes applied:** None beyond global analytics note.
- **Blockers:** Ops email workflow.

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

---

## API surface

| Route | Status | Notes |
|-------|--------|--------|
| `POST /api/chat` | ⚙️ **NEEDS CONFIG** | Validates input; quota; OpenRouter optional with fallback message. |
| `POST /api/audit` (+ extension) | ⚙️ **NEEDS CONFIG** | Same family as chat. |
| `POST /api/lawyer-leads` | 📝 **READY WITH NOTE** | Always 200 on valid body; logs + optional Resend. |
| `POST /api/lawyer-applications` | 📝 **READY WITH NOTE** | Same pattern. |
| `POST /api/subscribe` / `unsubscribe` | ✅ **READY** | File/Redis storage fallback. |
| `GET/POST/DELETE /api/me/chats*` | ⚙️ **NEEDS CONFIG** | Clerk + storage. |
| `GET /api/me/audits/*`, usage | ⚙️ **NEEDS CONFIG** | Same. |
| `POST /api/checkout`, `portal` | ⚙️ **NEEDS CONFIG** | Stripe. |
| `POST /api/webhooks/stripe` | ⚙️ **NEEDS CONFIG** | Signing secret. |
| `GET /api/share/audit` | ✅ **READY** | HMAC verify. |
| `POST /api/cron/right-of-the-day` | ⚙️ **NEEDS CONFIG** | Resend + cron auth in prod. |
| `GET /og` | ✅ **READY** | Six `kind` variants in one route handler. |

---

## Cross-cutting

| Check | Result |
|-------|--------|
| Renders without 500 (no AI keys) | **Pass** — APIs return fallbacks or 503 where documented. |
| CTAs real routes | **Pass** after extension anchor fix (no dead `href="#"` pattern for stores). |
| Forms loading/success/error | **Pass** on audited forms; pricing shows checkout errors. |
| i18n UI chrome | **Pass** on nav/FAQ meta; extension page still English-only body (flagged). |
| SEO high-traffic | **Pass** with notes — compare/constitutions have metadata patterns; FAQ meta fixed. |
| Mobile 360px | **Spot-check only** — no automated visual suite in this pass. |
| a11y | **Improved** — extension preview control non-focusable; further pass optional. |
| Analytics | **Fixed** duplicate `$pageview` (init + manual). |
| Voice | **Not exhaustively tested** in this pass — flag for manual QA. |
| Error boundaries | **Present** on chat, audit, dashboard, compare, index detail, constitution detail. |

---

## Commits (fill SHAs after push)

| Batch | Description | SHA |
|-------|-------------|-----|
| audit-report | This document (initial). | _TBD_ |
| fixes-batch-1-public-routes | FAQ meta, extension CTAs + JSON-LD, `/launch` prod gate. | _TBD_ |
| fixes-batch-2-functional-routes | Extension preview decorative control a11y. | _TBD_ |
| fixes-batch-3-api-and-forms | Lawyer lead success analytics. | _TBD_ |
| fixes-batch-4-a11y-and-i18n | PostHog `capture_pageview: false`; locale FAQ meta strings. | _TBD_ |

---

## Top 5 must-fix before broad launch

1. **Production secrets:** `OPENROUTER_API_KEY`, Stripe live keys/webhook, Clerk keys, Resend (+ lawyer inbox), `LAUNCH_KEY` if playbook URL is shared.
2. **`NEXT_PUBLIC_SITE_URL`** on the final domain (OG, emails, Stripe return URLs, JSON-LD).
3. **Extension store URLs** — replace fragment CTAs with real Chrome/Firefox/Edge links when approved.
4. **Legal / accuracy review** — disclaimers, constitutions, audit output (non-code).
5. **Product copy alignment** — Per-country `/employment` is **not** a route; adjust marketing if it was promised.

---

## Ready / not-ready counts (approximate)

- **READY:** 18 surfaces  
- **READY WITH NOTE:** 14  
- **NEEDS CONFIG:** 12  
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
