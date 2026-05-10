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
- **Styling:** Tailwind CSS v4, Radix UI, Framer Motion
- **AI:** OpenRouter (model-agnostic) — set `OPENROUTER_API_KEY`
- **Hosting:** Vercel
- **Data:** `src/data/countries.ts` — 195 countries with constitution metadata

## Local development

```bash
npm install
cp .env.example .env.local   # add OPENROUTER_API_KEY
npm run dev
```

## Project structure

```
src/
  app/
    constitutions/             # the library (browse + per-country pages)
    chat/                      # the legal assistant
    documents/                 # document help
    learn/                     # Law School
    pricing/, faq/             # commercial + trust surfaces
    api/chat/route.ts          # OpenRouter integration
    sitemap.ts, robots.ts, og/ # SEO surfaces
  components/
    constitutions/CountryBrowser.tsx
    sections/{Hero, Navigation, Footer, ...}
  data/
    countries.ts               # all 195 countries + constitutions
    types.ts                   # legal-system / region taxonomy
  lib/
    jurisdictions.ts           # search, group-by helpers
```

## Adding a country

Add an entry to `src/data/countries.ts` using the `c()` helper. Set `popular: true` to surface it on the home page; set `status: "active"` once the assistant is fully tuned for it.

## Disclaimer

BasicLaw is **educational only**. It is not a substitute for a licensed lawyer in your jurisdiction. Constitutional provisions can be amended, suspended, or interpreted differently by domestic courts — verify with the official source before relying on any provision.

## License

This project is provided as civic infrastructure. See `LICENSE` (TBD).
