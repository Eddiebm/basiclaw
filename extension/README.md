# BasicLaw — Browser Extension

> One click to audit the Terms of Service, lease, or contract on the page you're reading.

The BasicLaw extension is a thin client over the same audit API that powers
[basiclaw.vercel.app/audit](https://basiclaw.vercel.app/audit). It extracts
the readable contract text on the page (via Mozilla's `Readability.js`,
falling back to the user's text selection), POSTs it to
`https://basiclaw.vercel.app/api/audit/extension`, and renders the structured
audit result — risk grade, red flags, pushback lines, "ask a lawyer if…"
triggers — right inside the toolbar popup.

It is **educational only**, never a substitute for a licensed lawyer.

---

## Tech

- **Framework:** [WXT](https://wxt.dev) (MV3 from a single codebase → Chrome, Edge, Firefox).
- **UI:** React 18, vanilla CSS with light/dark tokens matching the web app.
- **Extraction:** `@mozilla/readability` (`Readability.js`), the same algorithm Firefox Reader View uses.
- **Privacy:** Nothing is stored. The only thing persisted across runs is the
  user's last-selected jurisdiction, kept in `chrome.storage.local`. Page text
  is only sent to BasicLaw when the user explicitly clicks **Audit this page**.

## Local development

```bash
cd extension
npm install
npm run dev          # Chrome (auto-opens a fresh profile)
npm run dev:firefox  # Firefox (auto-opens a fresh profile)
```

WXT watches your changes and reloads the extension automatically. The popup
opens from the browser toolbar; the content script runs on every page the
user explicitly clicks the extension on (`activeTab`).

To target a non-production API while developing:

```bash
BL_API_BASE=http://localhost:3000 npm run dev
```

(Make sure the local Next.js dev server allows `chrome-extension://` /
`moz-extension://` origins — the production `/api/audit/extension` route
already does, and the same origin check applies locally.)

## Production builds

Build a loadable unpacked extension for each browser:

```bash
npm run build           # → .output/chrome-mv3/   (Chrome + Edge)
npm run build:firefox   # → .output/firefox-mv3/  (Firefox)
```

Then load it manually:

- **Chrome / Edge:** `chrome://extensions` → enable "Developer mode" →
  *Load unpacked* → select `.output/chrome-mv3`.
- **Firefox:** `about:debugging#/runtime/this-firefox` →
  *Load Temporary Add-on…* → pick `.output/firefox-mv3/manifest.json`.

## Packaging for the stores

```bash
npm run zip           # → .output/basiclaw-<version>-chrome.zip
npm run zip:firefox   # → .output/basiclaw-<version>-firefox.zip
```

Submit those zips directly to the [Chrome Web
Store](https://chrome.google.com/webstore/devconsole/) and
[Firefox Add-ons](https://addons.mozilla.org/developers/) developer
dashboards.

## Store-submission checklist

- [x] Manifest V3 for Chrome, Edge, and Firefox (`manifest_version: 3`).
- [x] Icons: 16 / 32 / 48 / 128 PNGs in `public/icon/`. Regenerate via
      `node ./scripts/build-icons.mjs`.
- [x] Minimal permissions: `activeTab`, `scripting`. Host permissions limited
      to `basiclaw.vercel.app`, `basiclaw.app`, `www.basiclaw.app`.
- [x] Privacy policy URL: <https://basiclaw.vercel.app/privacy>.
- [x] Privacy notice in popup before any data leaves the device.
- [x] No analytics in extension unless `NEXT_PUBLIC_POSTHOG_KEY` is provided
      at build time (and even then we have not wired it — opt-in only).
- [ ] 4–5 screenshots (1280×800) — placeholder lives in
      `../public/extension/` once added on the web app side.
- [ ] Promo tile (440×280, optional) — same folder.

### Chrome Web Store listing draft

- **Title:** BasicLaw — Audit any Terms, lease, or contract
- **Short description (≤132 chars):**
  > One click to audit the Terms of Service, lease, or contract on the page
  > you're reading. Plain-language red flags. Educational.
- **Category:** Productivity
- **Long description:**
  > BasicLaw turns the legalese on any page into a plain-language risk audit
  > in seconds. Click the toolbar button on a Terms of Service, lease, offer
  > letter, or contract and you get:
  >
  > • A clear risk grade (low → critical) for the document.
  > • The top red flags, with the exact one-sentence pushback to put in
  >   writing.
  > • The positives — clauses that actually favour you.
  > • "Ask a lawyer if…" triggers for the moments that warrant a paid
  >   consult.
  > • A jurisdiction selector that adapts the audit to your country.
  >
  > Built on the same audit engine as basiclaw.app, with the same disclaimer:
  > educational only, never a substitute for a licensed lawyer.
  >
  > Privacy: nothing is stored. The page's text is sent to BasicLaw only when
  > you press Audit, and only for that single audit. No analytics, no
  > tracking pixels, no third-party requests.
- **Support URL:** <https://basiclaw.vercel.app/extension>
- **Privacy policy URL:** <https://basiclaw.vercel.app/privacy>

### Firefox Add-ons listing draft

Same copy as Chrome, plus:

- **Add-on ID:** `basiclaw@basiclaw.app`
- **Strict min version:** Firefox 115
- **Source code submission:** point AMO reviewers at the GitHub repo and the
  `extension/` subfolder — the build is reproducible via
  `npm install && npm run build:firefox`.

## Project structure

```
extension/
  wxt.config.ts            # WXT entry — manifest, vite define, modules.
  package.json             # Self-contained workspace (not in the Next.js app).
  entrypoints/
    background.ts          # MV3 service worker (just install handlers).
    content.ts             # Readability extraction + selection fallback.
    popup/
      index.html, main.tsx # React popup entry.
      App.tsx              # Form + jurisdiction selector + flow controller.
      ResultPanel.tsx      # Renders the AuditReport.
      Logo.tsx, style.css
  shared/
    api.ts                 # Fetches /api/audit/extension.
    audit-type.ts          # Heuristic auto-detection (lease/employment/terms).
    audit-types.ts         # AuditReport TS types mirrored from the web app.
    countries.ts           # Slim popup jurisdiction list (web app has all 195).
    messages.ts            # Typed popup ↔ content-script message protocol.
  public/icon/             # 16/32/48/128 PNGs.
  scripts/build-icons.mjs  # Regenerates icons from an inline SVG.
```

## Why not ship from the same `package.json` as the Next.js app?

Two reasons:

1. **Build determinism.** WXT runs Vite + esbuild and brings its own React
   runtime. Keeping it in a sibling workspace stops it from fighting the
   Next.js compile pipeline.
2. **Audit story for store reviewers.** A reviewer can clone the repo and
   reproduce the unpacked build with `cd extension && npm install && npm run
   build` — no Next.js, no Vercel-specific config, no environment secrets
   required.

## License

Same as the BasicLaw repo root.
