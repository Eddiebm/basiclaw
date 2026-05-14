# Vercel env setup runbook

Single source of truth for wiring BasicLaw env vars on Vercel. Follow top-to-bottom; the order is the order the app needs them to boot cleanly.

> Mirrors `.env.example` exactly. If you add a new env variable in code, add it to **both** files in the same PR.

---

## 1. Prerequisites

```bash
# One-time
npm i -g vercel
vercel login
# From the repo root
vercel link            # link this clone to the Vercel project
vercel pull --environment=production   # writes .vercel/.env.production.local
```

You should now have `.vercel/project.json` and a populated `.vercel/.env.production.local`.

---

## 2. `vercel env add` commands (copy-paste in order)

Each block is grouped by category. The third positional arg is the environment(s) — pick from `production`, `preview`, `development` (space-separated). Vercel CLI will then prompt for the value (paste secret, hit enter).

> Tip: pipe the value in non-interactively with `echo "VALUE" | vercel env add NAME production`.

### 2a. Core (set first — everything depends on `NEXT_PUBLIC_SITE_URL` for absolute URLs)

```bash
vercel env add NEXT_PUBLIC_SITE_URL production preview
# Production: https://basiclaw.app
# Preview:    https://basiclaw-git-<branch>-<scope>.vercel.app  (or omit and let Vercel default)
```

### 2b. LLM (chat + audit will hard-fall-back to a static "AI unavailable" message without one of these)

```bash
vercel env add AI_GATEWAY_API_KEY production preview            # preferred
vercel env add OPENROUTER_API_KEY production preview            # fallback if AI Gateway unset
# Optional model overrides:
vercel env add OPENROUTER_MODEL production preview
vercel env add OPENROUTER_AUDIT_MODEL production preview
vercel env add OPENROUTER_EMBEDDING_MODEL production preview
# Build-time only (US-state pages):
vercel env add BUILD_LLM_KEY production preview
vercel env add BUILD_LLM_MODEL production preview
```

### 2c. Auth — Clerk (both keys required together; admin list optional)

```bash
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production preview development
vercel env add CLERK_SECRET_KEY                  production preview development
vercel env add ADMIN_EMAILS                      production preview
```

### 2d. Storage — Vercel Marketplace KV (Upstash REST)

```bash
# If you provisioned KV through the Vercel Marketplace, these are often auto-injected — skip ahead.
vercel env add KV_REST_API_URL   production preview
vercel env add KV_REST_API_TOKEN production preview
```

### 2e. Stripe (skip until live billing)

```bash
vercel env add STRIPE_SECRET_KEY                 production preview
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production preview development
vercel env add STRIPE_WEBHOOK_SECRET             production preview
vercel env add STRIPE_PRODUCT_PRO                production preview
vercel env add STRIPE_PRODUCT_PLUS               production preview
vercel env add STRIPE_PRICE_PRO_MONTHLY          production preview
vercel env add STRIPE_PRICE_PRO_ANNUAL           production preview
vercel env add STRIPE_PRICE_PRO_PLUS_MONTHLY     production preview
vercel env add STRIPE_PRICE_PRO_PLUS_ANNUAL     production preview
```

### 2f. Email — Resend (set before any lead/press/cron flow goes public)

```bash
vercel env add RESEND_API_KEY              production preview
vercel env add RESEND_FROM_EMAIL           production preview
vercel env add LAWYER_LEADS_EMAIL          production preview
vercel env add LAWYER_APPLICATIONS_EMAIL   production preview
vercel env add PRESS_EMAIL                 production preview
vercel env add RIGHT_OF_DAY_FROM_EMAIL     production preview
```

### 2g. Analytics — PostHog

```bash
vercel env add NEXT_PUBLIC_POSTHOG_KEY  production preview development
vercel env add NEXT_PUBLIC_POSTHOG_HOST production preview              # only if not US cloud
```

### 2h. Observability — Sentry

```bash
vercel env add NEXT_PUBLIC_SENTRY_DSN production preview development
vercel env add SENTRY_DSN             production preview                 # only if you want a separate server DSN
# Build-time source-map upload (set in Vercel so prod stacks are readable):
vercel env add SENTRY_AUTH_TOKEN production preview
vercel env add SENTRY_ORG        production preview
vercel env add SENTRY_PROJECT    production preview
```

### 2i. Cron / internal launch

```bash
vercel env add CRON_SECRET production preview
vercel env add LAUNCH_KEY  production           # set BEFORE sharing /launch or /internal/health URLs
```

### 2j. Newsletter / shared audit / embed (HMAC secrets)

```bash
vercel env add NEWSLETTER_UNSUBSCRIBE_SECRET production preview
vercel env add SHARED_AUDIT_SECRET           production preview
vercel env add EMBED_JWT_SECRET              production preview
```

### 2k. Extension (only needed if you build the WXT extension in CI)

These are read by `extension/wxt.config.ts` at build time — they get baked into the extension bundle, so they live in the **CI environment** (e.g. GitHub Actions) rather than Vercel. Set as repo secrets if/when the extension build needs them.

```yaml
# Example (GitHub Actions):
env:
  BL_API_BASE: https://basiclaw.app
  NEXT_PUBLIC_POSTHOG_KEY: ${{ secrets.NEXT_PUBLIC_POSTHOG_KEY }}
```

---

## 3. Per-environment matrix

| Variable | Production | Preview | Development |
|----------|:---------:|:-------:|:-----------:|
| `NEXT_PUBLIC_SITE_URL` | required | required | optional (defaults to localhost) |
| `AI_GATEWAY_API_KEY` *or* `OPENROUTER_API_KEY` | required | required | optional |
| `OPENROUTER_MODEL` / `OPENROUTER_AUDIT_MODEL` / `OPENROUTER_EMBEDDING_MODEL` | optional | optional | optional |
| `BUILD_LLM_KEY` / `BUILD_LLM_MODEL` | optional | optional | optional |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` | required if you want sign-in | required | required if testing auth locally |
| `ADMIN_EMAILS` | recommended | recommended | optional |
| `KV_REST_API_URL` + `KV_REST_API_TOKEN` | required | recommended | optional (file fallback works) |
| `STRIPE_SECRET_KEY` + `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` + `STRIPE_WEBHOOK_SECRET` | required for paid tiers | recommended (test mode) | optional |
| `STRIPE_PRODUCT_*` / `STRIPE_PRICE_*` (two products + four price IDs) | required for paid tiers | recommended | optional |
| `RESEND_API_KEY` + `RESEND_FROM_EMAIL` | required for email flows | recommended | optional |
| `LAWYER_LEADS_EMAIL` / `LAWYER_APPLICATIONS_EMAIL` / `PRESS_EMAIL` / `RIGHT_OF_DAY_FROM_EMAIL` | required for those flows | recommended | optional |
| `NEXT_PUBLIC_POSTHOG_KEY` (+ `NEXT_PUBLIC_POSTHOG_HOST` if non-US) | recommended | recommended | optional |
| `NEXT_PUBLIC_SENTRY_DSN` (+ `SENTRY_DSN`) | recommended | recommended | optional |
| `SENTRY_AUTH_TOKEN` + `SENTRY_ORG` + `SENTRY_PROJECT` | recommended (source maps) | recommended | not used |
| `CRON_SECRET` | required for non-Vercel cron auth | recommended | optional |
| `LAUNCH_KEY` | required before sharing `/launch` | recommended | not used |
| `NEWSLETTER_UNSUBSCRIBE_SECRET` | recommended | recommended | optional |
| `SHARED_AUDIT_SECRET` | recommended | recommended | optional (Clerk secret is dev fallback) |
| `EMBED_JWT_SECRET` | required if you sign embed events | recommended | optional |

---

## 4. Minimum viable boot

The tightest set that lets the **homepage render**, **/chat answer**, **/audit return real output**, and **/internal/health pass everything except the third-party rows**:

1. `NEXT_PUBLIC_SITE_URL`
2. `AI_GATEWAY_API_KEY` *or* `OPENROUTER_API_KEY`
3. `LAUNCH_KEY`

That's three variables. With these set in Production:

- Marketing routes render and have correct canonical/OG URLs.
- `POST /api/chat` and `POST /api/audit` return real LLM output.
- `/launch?key=…` and `/[locale]/internal/health?key=…` are reachable behind the gate.
- Everything else (Clerk-gated, Stripe, Resend, Sentry, PostHog, Redis) gracefully degrades — no crashes, just disabled features.

Add the rest as you turn each integration on (auth → storage → email → billing → analytics → observability).

---

## 5. Post-setup verification

```bash
# Re-pull to confirm the env was committed to the project
vercel env pull .env.production.local --environment=production

# Sanity build with the same env the runtime will use
rm -rf .next && npx next build --webpack

# After deploy, hit the gated probe:
curl "https://basiclaw.app/en/internal/health?key=${LAUNCH_KEY}" | jq .
# Expected: ok=true on each row you wired (chat, storage, stripe, resend, clerk, sentry).
```

If `/internal/health` returns 404, `LAUNCH_KEY` is not set or the query param doesn't match.

If a row reports `ok=false`, the inline `detail` field tells you which env is missing or which credential rejected — paste that detail back here and re-run the matching `vercel env add` command.

Lint stays untouched by env changes:

```bash
npx eslint src --max-warnings 0
```

---

## 6. Rotation / revocation playbook

| Provider | Rotate where | Then run |
|----------|--------------|----------|
| Clerk | https://dashboard.clerk.com → API Keys → roll secret + publishable | `vercel env rm CLERK_SECRET_KEY production && vercel env add CLERK_SECRET_KEY production` (and same for publishable); redeploy |
| Stripe | https://dashboard.stripe.com/apikeys → roll restricted/secret key, then https://dashboard.stripe.com/webhooks → reveal new signing secret | re-add `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`; redeploy; replay any failed webhook events |
| OpenRouter | https://openrouter.ai/keys → revoke + create new | re-add `OPENROUTER_API_KEY`; no redeploy needed if Vercel reads at request time, but redeploy for safety |
| Vercel AI Gateway | https://vercel.com/dashboard → AI → Gateway → keys | re-add `AI_GATEWAY_API_KEY`; redeploy |
| Resend | https://resend.com/api-keys → revoke + create new | re-add `RESEND_API_KEY`; redeploy |
| Upstash / Vercel KV | Marketplace integration → rotate REST token | re-add `KV_REST_API_TOKEN`; redeploy; existing sessions stay intact (Redis-side) |
| Sentry | https://sentry.io → Settings → Auth Tokens for `SENTRY_AUTH_TOKEN`; project DSN page for DSN rotation | re-add the affected envs; trigger a new build to pick up DSN changes |
| PostHog | https://app.posthog.com → Project Settings → API keys (rotation creates a new project key — be ready to update extension build too) | re-add `NEXT_PUBLIC_POSTHOG_KEY`; rebuild extension |
| Internal (`CRON_SECRET`, `LAUNCH_KEY`, `NEWSLETTER_UNSUBSCRIBE_SECRET`, `SHARED_AUDIT_SECRET`, `EMBED_JWT_SECRET`) | `openssl rand -hex 32` | re-add via `vercel env add`; redeploy. Note: rotating `NEWSLETTER_UNSUBSCRIBE_SECRET` / `SHARED_AUDIT_SECRET` invalidates outstanding tokens (acceptable — re-issue from app). |
| Admin emails | edit `ADMIN_EMAILS` | `vercel env rm ADMIN_EMAILS production && vercel env add …`; redeploy |

To reset everything for a clean re-bootstrap:

```bash
vercel env ls production              # snapshot what's there
vercel env rm <NAME> production --yes # repeat per key
# then walk back through §2
```

---

## Follow-ups for the user (don't forget)

- [ ] Paste real `STRIPE_WEBHOOK_SECRET` after creating the production webhook in Stripe (`https://dashboard.stripe.com/webhooks`).
- [ ] Pick a real `LAUNCH_KEY` value and store it in 1Password before sharing `/launch` or `/internal/health` URLs.
