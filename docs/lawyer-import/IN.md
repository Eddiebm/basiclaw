# India (IN) — lawyer import notes

## TOS status

**`unknown`** — no authoritative, machine-readable **national** roll with clear reuse terms was verified in this pass.

## Canonical public references (patchy)

- **Bar Council of India (organisation):** `https://www.barcouncilofindia.org/`
- Practical verification often falls back to **state bar councils** with varying online presence.

## ToS fetch attempt

- No single ToS page was conclusively tied to a national “find a lawyer” API in automation.
- **Verdict:** **`unknown`** — treat as research-only.

## Rate-limit recommendation

If/when a concrete HTML/API target is chosen: default **2 s** spacing; prefer explicit written permission for bulk exports.

## Fields available / unavailable

- Highly variable by state; expect **incomplete** normalisation early on.

## Gotchas

- Transliteration / multi-script names may require extra fields later (`fullName` alone may be insufficient).

## Illustrative normalised records (synthetic)

```json
[
  {
    "sourceCountry": "IN",
    "sourceName": "Illustrative State Bar Council directory",
    "sourceUrl": "https://example-bar-council.in/search",
    "sourceLicense": "unknown",
    "sourceFetchedAt": "2026-05-12T20:00:00.000Z",
    "externalId": "IN-EX-000001",
    "fullName": "Priya Example",
    "firmName": "Example Legal Associates",
    "country": "IN",
    "jurisdiction": "Delhi",
    "practiceAreas": ["Criminal trial defence"],
    "languages": ["en", "hi"],
    "email": null,
    "phone": null,
    "websiteUrl": null,
    "address": null,
    "disciplinaryStatus": "unknown",
    "verifiedByRegulator": false
  }
]
```
