# Canada (CA) — lawyer import notes (Ontario / LSO focus)

## TOS status

**`unknown`** — automated review of the Law Society of Ontario website **Terms of Use** could not be completed from this environment (Cloudflare interstitial on `https://lso.ca/`).

## Canonical public directory (starting point)

- **Law Society of Ontario — public lawyer search:** `https://lso.ca/` → lawyer search (exact deep link may change with site IA).

## ToS fetch attempt

- **URL pattern attempted:** `https://lso.ca/about-lso/policies/terms-of-use`
- **Result:** HTTP **403** “Just a moment…” (Cloudflare challenge) — **no clause text captured**.

## Rate-limit recommendation

Once ToS is readable: assume **conservative** throttling (default **2 s**+) and honour any published crawl/API policy.

## Fields available / unavailable

- Expect: licence numbers, status, employer, addresses (where published).
- May lack: rich `practiceAreas`, languages.

## Gotchas

- Canadian regulation is **provincial**; other provinces (BC, Alberta, Québec) will need sibling importers if you expand beyond Ontario.

## Illustrative normalised records (synthetic)

```json
[
  {
    "sourceCountry": "CA",
    "sourceName": "Law Society of Ontario (illustrative row)",
    "sourceUrl": "https://lso.ca/",
    "sourceLicense": "unknown",
    "sourceFetchedAt": "2026-05-12T20:00:00.000Z",
    "externalId": "ON-LSO-000001",
    "fullName": "Jordan Example",
    "firmName": "Example Legal Professional Corporation",
    "country": "CA",
    "jurisdiction": "Ontario",
    "practiceAreas": ["Corporate law"],
    "languages": ["en", "fr"],
    "email": null,
    "phone": null,
    "websiteUrl": null,
    "address": null,
    "disciplinaryStatus": "active",
    "verifiedByRegulator": false
  }
]
```
