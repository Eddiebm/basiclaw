# Great Britain — England & Wales (GB) — lawyer import notes

## TOS status

**`restricted-personal-use-only`** — automated bulk caching for product ingestion **must not run** until counsel confirms an alternative lawful basis (e.g. contractual permission, separate open-data licence, or statutory instrument explicitly permitting reuse).

## Canonical public directory

- **SRA Solicitor / firm check (consumer-facing):** `https://www.sra.org.uk/consumers/solicitor-check/`
- **Solicitors Register (linked from SRA navigation):** `https://www.sra.org.uk/consumers/register/`

## ToS source reviewed

- **Terms URL (fetched successfully):** `https://www.sra.org.uk/sra/how-we-work/terms-conditions-service/`

### Relevant clauses (quoted)

**Copyright / reuse (Section 7.1)**

> “All information on the website, all motifs, designs and logos are protected by copyright unless specifically stated otherwise. You can use extracts of our information on our website for purposes of review, discussion, academic study and other legitimate pursuits without prior authorisation. Any unauthorised use of these materials may violate copyright, trademark and other laws. **Materials on the website may not be modified, reproduced or publicly displayed, performed, distributed, or used for any public or commercial purposes.**”

**Acceptable use — high level (Section 5.1)**

The policy lists prohibited misuses (fraud, unauthorised access, malware, etc.). Even where not explicitly mentioning “scraping”, the **copyright section** above is the dominant constraint for **bulk reproduction / distribution** of HTML roll content into a separate commercial dataset.

## Rate-limit recommendation

If permission is obtained: **≥ 2 s** between requests as a courtesy default; prefer any official bulk/API channel the SRA offers.

## Fields available / unavailable

- **Often public:** SRA number (`externalId`), practising status, organisation, some office locations.
- **May be partial:** granular `practiceAreas`, languages beyond defaults.

## Gotchas

- “Find a solicitor” experiences may be **dynamic** (JS-heavy) — plan for HTML snapshot caching + structured API discovery.
- Scotland / Northern Ireland have **separate** regulators — this importer scope is **England & Wales** unless extended.

## Illustrative normalised records (synthetic)

```json
[
  {
    "sourceCountry": "GB",
    "sourceName": "Solicitors Regulation Authority (illustrative row 1/5)",
    "sourceUrl": "https://www.sra.org.uk/consumers/solicitor-check/",
    "sourceLicense": "restricted-personal-use-only",
    "sourceFetchedAt": "2026-05-12T20:00:00.000Z",
    "externalId": "1000001",
    "fullName": "Jamie Example",
    "firmName": "Example Solicitors LLP",
    "country": "GB",
    "jurisdiction": "England and Wales",
    "practiceAreas": ["Residential conveyancing"],
    "languages": ["en"],
    "email": null,
    "phone": null,
    "websiteUrl": null,
    "address": null,
    "disciplinaryStatus": "active",
    "verifiedByRegulator": true
  },
  {
    "sourceCountry": "GB",
    "sourceName": "Solicitors Regulation Authority (illustrative row 2/5)",
    "sourceUrl": "https://www.sra.org.uk/consumers/solicitor-check/",
    "sourceLicense": "restricted-personal-use-only",
    "sourceFetchedAt": "2026-05-12T20:00:00.000Z",
    "externalId": "1000002",
    "fullName": "Riley Example",
    "firmName": null,
    "country": "GB",
    "jurisdiction": "England and Wales",
    "practiceAreas": [],
    "languages": ["en"],
    "email": null,
    "phone": null,
    "websiteUrl": null,
    "address": null,
    "disciplinaryStatus": "unknown",
    "verifiedByRegulator": true
  },
  {
    "sourceCountry": "GB",
    "sourceName": "Solicitors Regulation Authority (illustrative row 3/5)",
    "sourceUrl": "https://www.sra.org.uk/consumers/solicitor-check/",
    "sourceLicense": "restricted-personal-use-only",
    "sourceFetchedAt": "2026-05-12T20:00:00.000Z",
    "externalId": "1000003",
    "fullName": "Taylor Example",
    "firmName": "Example Law Ltd",
    "country": "GB",
    "jurisdiction": "England and Wales",
    "practiceAreas": ["Employment"],
    "languages": ["en", "cy"],
    "email": null,
    "phone": null,
    "websiteUrl": null,
    "address": null,
    "disciplinaryStatus": "active",
    "verifiedByRegulator": true
  },
  {
    "sourceCountry": "GB",
    "sourceName": "Solicitors Regulation Authority (illustrative row 4/5)",
    "sourceUrl": "https://www.sra.org.uk/consumers/solicitor-check/",
    "sourceLicense": "restricted-personal-use-only",
    "sourceFetchedAt": "2026-05-12T20:00:00.000Z",
    "externalId": "1000004",
    "fullName": "Morgan Example",
    "firmName": "Example Partnership",
    "country": "GB",
    "jurisdiction": "England and Wales",
    "practiceAreas": ["Immigration"],
    "languages": ["en"],
    "email": null,
    "phone": null,
    "websiteUrl": null,
    "address": null,
    "disciplinaryStatus": "suspended",
    "verifiedByRegulator": true
  },
  {
    "sourceCountry": "GB",
    "sourceName": "Solicitors Regulation Authority (illustrative row 5/5)",
    "sourceUrl": "https://www.sra.org.uk/consumers/solicitor-check/",
    "sourceLicense": "restricted-personal-use-only",
    "sourceFetchedAt": "2026-05-12T20:00:00.000Z",
    "externalId": "1000005",
    "fullName": "Casey Example",
    "firmName": "Example & Co",
    "country": "GB",
    "jurisdiction": "England and Wales",
    "practiceAreas": ["Family law"],
    "languages": ["en"],
    "email": null,
    "phone": null,
    "websiteUrl": null,
    "address": null,
    "disciplinaryStatus": "retired",
    "verifiedByRegulator": true
  }
]
```
