# Lawyer import scaffolding (BasicLaw)

This folder documents **read-only, cache-only** importers that may eventually populate `data/imported-lawyers/<ISO2>.json`. **Nothing here writes to** `PartnerLawyer` storage, `src/lib/storage.ts`, or any `/lawyers` / `/api/lawyer-leads` / `/api/partner-applications` surface — that ingestion step is intentionally deferred until the marketplace v2 workstream finishes.

## What the scripts do

- Entry points: `scripts/import-lawyers/<ISO2>.mjs` (one per country).
- Shared helpers: `scripts/import-lawyers/_lib.mjs` (throttle, disk cache, JSON helpers, `User-Agent`).
- Status map: `scripts/import-lawyers/status-map.mjs` (single source for `TOS_STATUS` classification).
- Orchestrator: `scripts/import-lawyers/run-all.mjs` (runs only **live** importers — see status map).
- NPM: `pnpm import:lawyers` / `npm run import:lawyers`.

## Flags (all importers)

| Flag | Meaning |
| --- | --- |
| `--dry-run` | No outbound HTTP. (If an importer were live, parsers could still run against on-disk cache only — see `_lib.mjs`.) |
| `--limit N` | Cap records processed (for incremental testing). |
| `--page N` | Pagination hint (source-specific; reserved for future parsers). |
| `--resume` | Skip `externalId` values already present in `data/imported-lawyers/<ISO2>.json`. |
| `--throttle-ms` | Minimum spacing between HTTP requests (default **2000** ms ⇒ **≤ 1 request / 2 s**). |

## `TOS_STATUS` values

| Status | Importer |
| --- | --- |
| `permitted-public-roll` | May run against the public regulator roll (subject to technical courtesy throttles). |
| `permitted-with-attribution` | May run; each record must carry regulator attribution + canonical link. |
| `rate-limited` | Allowed but capped — honour documented caps + local cache. |
| `restricted-personal-use-only` | **Do not** bulk-fetch / store for product ingestion; script remains a **stub**. |
| `unknown` | Treat as **research-only** until counsel reviews the fetched ToS / statutory basis. |

## Per-country ToS summary

| ISO | Status | Primary public directory URL | Next action |
| --- | --- | --- | --- |
| US | `unknown` | (fragmented) See `US.md` — start with largest state bars or ABA once ToS is clear | Human: pick authoritative roll(s); capture ToS |
| GB | `restricted-personal-use-only` | https://www.sra.org.uk/consumers/solicitor-check/ | Human: seek permission / alternate open licence for bulk use |
| CA | `unknown` | https://lso.ca/ (Law Society of Ontario — lawyer search) | Human: retrieve ToS behind bot protection |
| AU | `restricted-personal-use-only` | https://www.lawsociety.com.au/register-of-solicitors | Human: written consent or statutory route for bulk cache |
| IN | `unknown` | Bar Council of India (patchy online roll) | Human: confirm authoritative machine-readable source |
| NG | `unknown` | Nigerian Bar Association (no stable public roll located here) | Human: locate regulator-endorsed directory + ToS |
| GH | `unknown` | Ghana Bar Association (no stable public roll located here) | Human: locate regulator-endorsed directory + ToS |
| KE | `unknown` | https://lsk.or.ke/ (Law Society of Kenya) | Human: obtain crawl/API terms for member search |
| ZA | `unknown` | https://lpc.org.za/members-of-the-public/list-of-legal-practitioners/ | Human: locate explicit website / data reuse terms |
| BR | `unknown` | https://www.oab.org.br/ (national portal; state sections for consulta) | Human: capture Federación / OAB ToS for consulta data |

## Ingestion (follow-up)

1. Marketplace v2 lands `PartnerLawyer` storage and UI.
2. Add a small ingestion worker that reads `data/imported-lawyers/<ISO2>.json`, validates, dedupes, and upserts into the live store.
3. Until then, treat JSON files as **non-authoritative caches**.

## Manual promotion checklist (production)

- [ ] Name matches regulator roll exactly (no typos / merged fields).
- [ ] `disciplinaryStatus` reconciled against regulator discipline listings.
- [ ] Remove or null non-public PII (`email`, `phone`, `address`) unless explicitly public on the roll.
- [ ] `sourceUrl` + `sourceName` retained for attribution / audit trail.
- [ ] Re-verify ToS if the importer was ever `unknown` or `restricted-*`.

## Dry-run log (2026-05-12)

All countries are currently **non-live** (`unknown` or `restricted-personal-use-only`). Ran:

`for iso in US GB CA AU IN NG GH KE ZA BR; do node scripts/import-lawyers/$iso.mjs --dry-run --limit 5 --page 1 --resume --throttle-ms 2000; done`

**Live records parsed:** 0 per country (stubs). Each script printed `Importer disabled pending ToS clarification — see docs/lawyer-import/<ISO>.md`.

Illustrative normalised examples (synthetic, **not** from regulators) live inside each `docs/lawyer-import/<ISO>.md` (GB includes a **5-row** JSON demo).
