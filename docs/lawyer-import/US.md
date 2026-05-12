# United States (US) — lawyer import notes

## TOS status

**`unknown`** (default **research-only** until human review).

## Canonical public sources (fragmented)

US lawyer licensing is **state-level**. There is **no single federal bar roll** comparable to smaller jurisdictions.

Reasonable starting points (non-exhaustive):

- **California** — State Bar attorney search: `https://www.calbar.ca.gov/Attorneys/LicenseSearch`
- **Texas** — State Bar directory: `https://www.texasbar.com/AM/Template.cfm?Section=Find_A_Lawyer`
- **New York** — Attorney search (Unified Court System / NYS courts): `https://iapps.courts.state.ny.us/attorney/AttorneySearch`
- **Florida** — Bar member search: `https://www.floridabar.org/directories/find-mbr/`
- **Illinois** — ARDC lawyer search: `https://www.iardc.org/lawyersearch.asp`
- **ABA** — general public resources exist but **automated ToS retrieval failed** (Cloudflare interstitial from this environment on `https://www.americanbar.org/disclaimer/`).

## ToS fetch attempt (ABA)

- **URL attempted:** `https://www.americanbar.org/disclaimer/`
- **Result:** HTTP **403** with a Cloudflare “Just a moment…” interstitial — **body not reviewed** in automation.
- **Verdict:** classify as **`unknown`**; do **not** scrape ABA properties until a human captures the governing terms out-of-band.

## Rate-limit recommendation

Assume **strict** per-host courtesy: default **≥ 2 s** between requests, respect `robots.txt`, and prefer official APIs / bulk data downloads if offered.

## Fields available / unavailable

- **Likely available (varies by state):** name, bar number, admission status, sometimes practice location, discipline summaries.
- **Often missing or partial:** normalised `practiceAreas`, `languages`, public `email`/`phone` (many states redact or omit).

## Gotchas

- Normalising **50+ jurisdictions** will require either many sub-importers or a deliberate subset strategy.
- Discipline narratives may live on **different subdomains** than the licence search UI.

## Illustrative normalised records (synthetic — schema demo only)

```json
[
  {
    "sourceCountry": "US",
    "sourceName": "Example State Bar (illustrative)",
    "sourceUrl": "https://example-state-bar.invalid/search",
    "sourceLicense": "unknown",
    "sourceFetchedAt": "2026-05-12T20:00:00.000Z",
    "externalId": "US-EX-000001",
    "fullName": "Alex Example",
    "firmName": "Example LLP",
    "country": "US",
    "jurisdiction": "California",
    "practiceAreas": ["Civil litigation"],
    "languages": ["en"],
    "email": null,
    "phone": null,
    "websiteUrl": null,
    "address": null,
    "disciplinaryStatus": "active",
    "verifiedByRegulator": false
  }
]
```
