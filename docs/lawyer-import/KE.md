# Kenya (KE) — lawyer import notes

## TOS status

**`unknown`** — the Law Society of Kenya site returned **200** for several “terms” paths, but the HTML served for those URLs appeared to be **generic homepage content** (not clearly labelled Terms text). Without reliable clause text, default to **research-only**.

## Canonical public references

- **Law Society of Kenya (portal):** `https://lsk.or.ke/`
- **Paths attempted:** `https://lsk.or.ke/terms-and-conditions/` (returned homepage-like content in automation — **not relied upon**).

## ToS fetch attempt

- **Result:** Could not extract a trustworthy ToS body for quotation.
- **Verdict:** **`unknown`**.

## Rate-limit recommendation

Default **2 s**+; WordPress sites may also benefit from off-peak scheduling once permitted.

## Fields available / unavailable

- TBD once the authoritative member search endpoint + field mapping is confirmed.

## Gotchas

- Member search may be behind **forms / anti-bot** controls — expect engineering follow-up.

## Illustrative normalised records (synthetic)

```json
[
  {
    "sourceCountry": "KE",
    "sourceName": "Law Society of Kenya (illustrative row)",
    "sourceUrl": "https://lsk.or.ke/",
    "sourceLicense": "unknown",
    "sourceFetchedAt": "2026-05-12T20:00:00.000Z",
    "externalId": "KE-LSK-000001",
    "fullName": "Wanjiru Example",
    "firmName": "Example Advocates LLP",
    "country": "KE",
    "jurisdiction": "Nairobi",
    "practiceAreas": ["Employment law"],
    "languages": ["en", "sw"],
    "email": null,
    "phone": null,
    "websiteUrl": null,
    "address": null,
    "disciplinaryStatus": "active",
    "verifiedByRegulator": false
  }
]
```
