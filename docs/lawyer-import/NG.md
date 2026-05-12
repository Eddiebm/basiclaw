# Nigeria (NG) — lawyer import notes

## TOS status

**`unknown`** — a stable, authoritative, machine-readable **national bar roll** with clear website ToS for automated reuse was **not** confirmed here.

## Canonical public references

- **Nigerian Bar Association (organisation):** `https://nigerianbar.org.ng/`
- Expect supplementation from **Supreme Court / NBA branch** materials; verify with local counsel before any crawl.

## ToS fetch attempt

- No dedicated ToS page for a national online roll was captured in this scaffolding pass.
- **Verdict:** **`unknown`**.

## Rate-limit recommendation

Default **2 s**+ between requests once a concrete target exists; prefer written permission for bulk exports.

## Fields available / unavailable

- Until a concrete directory is chosen: treat all field mappings as **TBD**.

## Gotchas

- Public directories (if any) may be **PDF-first** or updated irregularly — plan for OCR / manual pipelines separately.

## Illustrative normalised records (synthetic)

```json
[
  {
    "sourceCountry": "NG",
    "sourceName": "Illustrative Nigerian directory",
    "sourceUrl": "https://example-nba-directory.ng/",
    "sourceLicense": "unknown",
    "sourceFetchedAt": "2026-05-12T20:00:00.000Z",
    "externalId": "NG-EX-000001",
    "fullName": "Chidi Example",
    "firmName": "Example LP",
    "country": "NG",
    "jurisdiction": "Lagos",
    "practiceAreas": ["Commercial transactions"],
    "languages": ["en"],
    "email": null,
    "phone": null,
    "websiteUrl": null,
    "address": null,
    "disciplinaryStatus": "unknown",
    "verifiedByRegulator": false
  }
]
```
