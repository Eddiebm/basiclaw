# Performance notes (2026-05-12)

Prioritised follow-ups. Items marked **measure** need Lighthouse / Web Vitals on production traffic before changing code.

## Done in this pass

- **`@next/bundle-analyzer`** — run `npm run analyze` locally after `ANALYZE=true` to inspect client/server bundles (see `next.config.ts`).
- **`experimental.optimizeCss: true`** — enables CSS optimisation in Next 16; **measure** for any regression with Tailwind v4 + third-party CSS.
- **`<img>` → `next/image`** — press kit OG previews use same-origin `/og` paths (`buildOgImagePath`) with **`unoptimized`** because Next 16 requires explicit `images.localPatterns` for dynamic query strings on local `Image` srcs; follow-up is to add a tight pattern for `/og?…` if we want the image pipeline to optimise those renders. Lawyer headshots and embed tenant logos use `next/image` with `unoptimized` for arbitrary HTTPS URLs (see P1 for remotePatterns).
- **Fonts** — app shell already uses `next/font/google` (`Geist`, `Instrument_Serif`); no inline Google Fonts `<link>` tags found in `src/`.

## P1 — measure or quick wins

1. **Voice + Sentry replay bundle** — `VoiceDictationButton`, `ReadAloudButton`, and related hooks are still static-imported from heavy chat/audit surfaces. **Follow-up:** `next/dynamic` those components with `ssr: false` on routes where they are below the fold, and confirm LCP/FCP in Lighthouse.
2. **`images.remotePatterns`** — define explicit host patterns for known lawyer headshot hosts (e.g. Vercel Blob, partner CDNs) and drop `unoptimized` where safe for better caching.
3. **PostHog / analytics chunk** — ensure analytics loads after idle or interaction where possible (**measure** impact on TBT).

## P2 — larger refactors (needs product sign-off)

- Split `CountryBrowser` / legal index clients into smaller lazy islands for first paint on huge locale matrices.
- Review static generation surface area (8k+ prerendered paths) vs on-demand ISR for cold deploy times.

## Commands

```bash
npm run analyze
rm -rf .next && npx next build --webpack
```
