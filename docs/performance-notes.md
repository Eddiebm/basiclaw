# Performance notes

Prioritised follow-ups. Items marked **measure** need Lighthouse / Web Vitals on production traffic before changing code.

## Done in this pass

- **`@next/bundle-analyzer`** — `next.config.ts` wraps the merged config with `withAnalyzer` from `@next/bundle-analyzer` when `process.env.ANALYZE === "true"`, then `withSentryConfig`. Run `npm run analyze` to open the bundle report after a webpack build.
- **`experimental.optimizeCss: true`** — left enabled in `next.config.ts`; **measure** for any regression with Tailwind v4 + third-party CSS.
- **Voice controls** — `VoiceDictationButton` and `ReadAloudButton` are re-exported from `src/components/voice/dynamic-voice-controls.tsx` using `next/dynamic` with `{ ssr: false }` and small loading placeholders so chat, audit, topics, constitutions, and questions routes defer Web Speech / TTS chunks.
- **`<img>` audit** — grep of `src/` for raw `<img` tags found **no** occurrences; no `<img>` → `next/image` conversions were required this round (press kit / lawyers already on `next/image` where applicable).
- **Fonts** — no `fonts.googleapis.com` `<link>` usage in `src/`; shell fonts use `next/font/google` in `src/app/layout.tsx`.
- **Webpack + edge handler** — `src/middleware.ts` (Clerk + next-intl, same logic as the former `proxy.ts`) so `next build --webpack` can finalize (`proxy.js` → `middleware.js` rename was failing with `ENOENT` on Next 16.2.6 for `proxy.ts`-only setups).

## P1 — measure or quick wins

1. **`images.remotePatterns`** — define explicit host patterns for known lawyer headshot hosts (e.g. Vercel Blob, partner CDNs) and drop `unoptimized` where safe for better caching.
2. **PostHog / analytics chunk** — ensure analytics loads after idle or interaction where possible (**measure** impact on TBT).
3. **Audit read-aloud** — `AuditReportCard` still uses `useSpeechSynthesis` inline for the summary button; consider extracting a tiny lazy island if that route’s JS stays hot.

## P2 — larger refactors (needs product sign-off)

- Split `CountryBrowser` / legal index clients into smaller lazy islands for first paint on huge locale matrices.
- Review static generation surface area (8k+ prerendered paths) vs on-demand ISR for cold deploy times.

## Watch-list (heavy or chatty dependencies)

| Area | Notes |
|------|--------|
| `react-markdown` | Used by `MarkdownContent`; keep inside client islands. |
| `framer-motion` | Many marketing and chat clients; acceptable where already `"use client"`. |
| `@xenova/transformers` | `serverExternalPackages` entry; keep server-only. |
| `posthog-js` | Third-party analytics; defer or gate if TBT regresses (**measure** first). |

## Commands

```bash
npm run analyze
rm -rf .next && npx next build --webpack
npx eslint src --max-warnings 0
```
