# Ghana (GH) — lawyer import notes

## TOS status

**`unknown`** — no authoritative online roll + ToS pairing was verified in this scaffolding pass.

## Canonical public references

- **Ghana Bar Association (organisation):** `https://ghanabar.org/` (verify current canonical domain in production before crawling).

## ToS fetch attempt

- No crawl-grade ToS text was captured for a specific “find a lawyer” dataset.
- **Verdict:** **`unknown`**.

## Rate-limit recommendation

Default **2 s**+ spacing; prefer explicit permission for bulk reuse.

## Fields available / unavailable

- TBD pending selection of a concrete directory endpoint.

## Gotchas

- Many smaller jurisdictions publish **PDF notices** rather than queryable HTML — importer may need a different modality later.

## Illustrative normalised records (synthetic)

```json
[
  {
    "sourceCountry": "GH",
    "sourceName": "Illustrative Ghana directory",
    "sourceUrl": "https://example-ghanabar.gh/search",
    "sourceLicense": "unknown",
    "sourceFetchedAt": "2026-05-12T20:00:00.000Z",
    "externalId": "GH-EX-000001",
    "fullName": "Ama Example",
    "firmName": "Example Chambers",
    "country": "GH",
    "jurisdiction": "Greater Accra",
    "practiceAreas": ["Energy regulation"],
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
