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

### Middleware note

BasicLaw uses `src/middleware.ts` with **next-intl** for locale detection and routing. If a future Next.js release deprecates `middleware` in favour of a `proxy` entry convention, migrating will depend on next-intl’s supported integration path — track [next-intl middleware docs](https://next-intl.dev/docs/routing/middleware) before renaming files. Until then, keep `middleware.ts` as-is.

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

| Variable | Required | Purpose |
|----------|----------|---------|
| `OPENROUTER_API_KEY` | For live chat | Powers `/api/chat` via OpenRouter. Without it, the route returns a short constitutional fallback. |
| `OPENROUTER_MODEL` | No | OpenRouter model id (default in code if unset). |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical base URL for SEO and OpenRouter `HTTP-Referer`. |
| `RESEND_API_KEY` | No | If set with `LAWYER_LEADS_EMAIL` or `RESEND_FROM_EMAIL`, lawyer applications hit your inbox. |
| `LAWYER_LEADS_EMAIL` | No | Recipient for `/api/lawyer-leads` emails; defaults to `RESEND_FROM_EMAIL`. |
| `RESEND_FROM_EMAIL` | When emailing | Verified Resend sender (`Name <email@domain>`); also used as fallback recipient. |

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
  i18n/                        # routing, messages merge, middleware plugin path
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
