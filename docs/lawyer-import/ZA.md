# South Africa (ZA) — lawyer import notes

## TOS status

**`unknown`** — the Legal Practice Council publishes a **public-facing “List of Legal Practitioners”** page, but this pass could not locate a dedicated **website Terms / data reuse** document with quotable clauses for automated bulk extraction.

## Canonical public directory

- **LPC — List of Legal Practitioners:** `https://lpc.org.za/members-of-the-public/list-of-legal-practitioners/`

## ToS fetch attempt

- **Homepage fetched (200):** `https://lpc.org.za/`
- **Dedicated terms URL:** not found via quick WP JSON search (`/wp-json/wp/v2/pages?search=…` returned no obvious “terms/disclaimer” page).
- **Verdict:** **`unknown`** until counsel captures and reviews an explicit reuse policy.

## Rate-limit recommendation

Default **2 s**+; the directory experience may be **dynamic** — prefer caching HTML snapshots once permitted.

## Fields available / unavailable

- Expect practitioner identifiers and status fields once the underlying tool is reverse-engineered **lawfully**.

## Gotchas

- LPC pages are **WordPress + Toolset/Formidable** — stable selectors may change; plan for defensive parsing.

## Illustrative normalised records (synthetic)

```json
[
  {
    "sourceCountry": "ZA",
    "sourceName": "Legal Practice Council (illustrative row)",
    "sourceUrl": "https://lpc.org.za/members-of-the-public/list-of-legal-practitioners/",
    "sourceLicense": "unknown",
    "sourceFetchedAt": "2026-05-12T20:00:00.000Z",
    "externalId": "ZA-LPC-000001",
    "fullName": "Thabo Example",
    "firmName": "Example Inc.",
    "country": "ZA",
    "jurisdiction": "Gauteng",
    "practiceAreas": ["Litigation"],
    "languages": ["en", "af"],
    "email": null,
    "phone": null,
    "websiteUrl": null,
    "address": null,
    "disciplinaryStatus": "active",
    "verifiedByRegulator": false
  }
]
```
