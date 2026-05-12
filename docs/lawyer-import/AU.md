# Australia (AU) — lawyer import notes (NSW Law Society register focus)

## TOS status

**`restricted-personal-use-only`** for automated harvesting / storage of site content into a separate product cache.

## Canonical public directory

- **NSW Register of Solicitors:** `https://www.lawsociety.com.au/register-of-solicitors`

## ToS source reviewed

- **Terms URL (fetched successfully):** `https://www.lawsociety.com.au/terms-use`

### Relevant clauses (quoted)

**Intellectual property — limitations on use**

> “Users of the Law Society website are granted a non-exclusive, non-assignable and non-transferable licence to use the Law Society website only in accordance with these Terms of Use. Nothing in these Terms of Use or the Law Society website will give users ownership of the content. **Users may not sell, modify, copy, distribute, transmit, display, perform, reproduce, republish, licence, frame, upload, transmit, post, communicate or use the content** except as: … permitted under the Copyright Act … or authorised in writing by the Law Society.”

**Prohibitions — automated harvesting / storage**

> “Users of the Law Society website must not: … **undertake data harvesting of personal information from the Law Society website**, … **reproduce, incorporate or store any information from the Law Society website, unless the prior written consent of the Law Society has been obtained.**”

## Rate-limit recommendation

If written permission is obtained: still use **≥ 2 s** throttles and cache aggressively; follow any contractual caps.

## Fields available / unavailable

- Register pages may expose: practising certificate details, firm, locations.
- Personal email/phone may be **absent** or restricted.

## Gotchas

- Other states (Victoria `https://www.liv.asn.au/`, etc.) will need **separate** ToS reviews.

## Illustrative normalised records (synthetic)

```json
[
  {
    "sourceCountry": "AU",
    "sourceName": "Law Society of New South Wales (illustrative row)",
    "sourceUrl": "https://www.lawsociety.com.au/register-of-solicitors",
    "sourceLicense": "restricted-personal-use-only",
    "sourceFetchedAt": "2026-05-12T20:00:00.000Z",
    "externalId": "NSW-000001",
    "fullName": "Sam Example",
    "firmName": "Example & Co",
    "country": "AU",
    "jurisdiction": "New South Wales",
    "practiceAreas": ["Property law"],
    "languages": ["en"],
    "email": null,
    "phone": null,
    "websiteUrl": null,
    "address": null,
    "disciplinaryStatus": "active",
    "verifiedByRegulator": true
  }
]
```
