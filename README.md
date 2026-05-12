# BasicLaw

> Every country's constitution and rights, in plain language. Civic infrastructure for the digital age.

[basiclaw.vercel.app](https://basiclaw.vercel.app)

## What it is

BasicLaw turns the constitution and core rights of **every country in the world** into clear, jurisdiction-aware answers anyone can read — without needing a law degree, a subscription, or an hour-long consultation just to know what their rights are.

- **The Constitution Library.** Plain-language summaries of all 195 countries' constitutions, with key principles, adoption / amendment years, legal-system context, and outbound links to the official source.
- **The legal assistant.** Ask any question; the assistant answers in the context of the country you choose, with the educational disclaimer baked in.
- **Document help.** Paste a contract, lease, or notice; get a plain-language explanation.
- **Law School.** Step-by-step legal-literacy courses for non-lawyers.

## Stack

- **Framework:** Next.js 16 (App Router, Turbopack, Cache Components-ready)

### Middleware / i18n

BasicLaw uses **next-intl** with `src/middleware.ts` composed with **Clerk** on protected pages and `/api/me/*`. `/api/cron/*` is gated by `CRON_SECRET` / `x-vercel-cron` (not Clerk). Next.js 16 may warn that `middleware` is deprecated in favour of `proxy` — migration can follow upstream guidance when stable.

- **Styling:** Tailwind CSS v4, Radix UI, Framer Motion
- **AI:** OpenRouter (model-agnostic) — set `OPENROUTER_API_KEY`
- **Hosting:** Vercel
- **Data:** `src/data/countries.ts` — 195 countries with constitution metadata

## Local development

```bash
npm install
cp .env.example .env.local   # see Environment variables below
npm run dev
```

## Environment variables

| Group | Variable | Required? | Purpose |
|-------|----------|-----------|---------|
| Core | `OPENROUTER_API_KEY` | For live chat | Powers `/api/chat`. |
| Core | `OPENROUTER_MODEL` | No | Model id override. |
| Core | `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical URL, OpenRouter referer, email links. |
| Clerk | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | Optional | Sign-in, `/dashboard`, `/api/me/*`. App shows a banner when missing. |
| Storage | `KV_REST_API_URL` + `KV_REST_API_TOKEN` or `UPSTASH_REDIS_*` | Optional | Durable chats/audits/subscribers/usage. Falls back to `tmp/basiclaw-storage.json`. |
| Stripe | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | For billing | Checkout + webhooks. |
| Stripe | `STRIPE_PRICE_PRO_MONTHLY`, `STRIPE_PRICE_PRO_ANNUAL`, `STRIPE_PRICE_PLUS_MONTHLY`, `STRIPE_PRICE_PLUS_ANNUAL` | Recommended | Maps subscriptions → `publicMetadata.plan` via webhook. |
| Email | `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Optional | Lawyer leads + Right of the Day when configured. |
| Cron | `CRON_SECRET` | Optional (prod manual) | Bearer gate for `/api/cron/*` outside Vercel cron. |
| Cron | `RIGHT_OF_DAY_FROM_EMAIL` | When sending digest | Verified Resend sender for the newsletter cron. |
| Newsletter | `UNSUBSCRIBE_SECRET` | Recommended | Signs `/api/unsubscribe` tokens. |
| Sharing | `SHARED_AUDIT_SECRET` | Recommended | HMAC for dashboard “open shared audit” links. |
| Build | `BUILD_LLM_KEY` | Optional | US state card copy generation. |

See `.env.example` for copy-paste stubs.

## Project structure

```
src/
  app/
    [locale]/                  # next-intl locale segment (en, es, fr, ar, pt, hi, zh)
    [locale]/constitutions/    # library browse + per-country pages
    [locale]/chat/             # legal assistant
    [locale]/documents/        # document help
    [locale]/learn/            # Law School
    [locale]/pricing/, faq/, audit/, find-a-lawyer/
    api/chat/route.ts          # OpenRouter + constitution context
    api/lawyer-leads/route.ts  # lawyer marketplace submissions (+ optional Resend)
    sitemap.ts, robots.ts, og/ # SEO surfaces
  i18n/                        # routing, messages merge, proxy (Next 16) + middleware plugin path
  messages/                    # locale JSON overlays
  components/
    constitutions/CountryBrowser.tsx
    sections/{Hero, Navigation, Footer, ...}
  data/
    countries.ts               # all 195 countries + constitutions
    constitution-snippets/     # optional per-country snippets for /api/chat retrieval
    types.ts                   # legal-system / region taxonomy
  lib/
    jurisdictions.ts           # search, group-by helpers, official sources
    constitution-snippets.ts   # load + rank snippets for chat context
```

## Adding a country

Add an entry to `src/data/countries.ts` using the `c()` helper. Set `popular: true` to surface it on the home page; set `status: "active"` once the assistant is fully tuned for it.

## Disclaimer

BasicLaw is **educational only**. It is not a substitute for a licensed lawyer in your jurisdiction. Constitutional provisions can be amended, suspended, or interpreted differently by domestic courts — verify with the official source before relying on any provision.

## License

This project is provided as civic infrastructure. See `LICENSE` (TBD).
