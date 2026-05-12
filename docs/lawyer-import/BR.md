# Brazil (BR) — lawyer import notes

## TOS status

**`unknown`** — the national OAB portal is reachable, but this pass did not capture a dedicated **website Terms of Use** body suitable for quoting automated data reuse permissions.

## Canonical public references

- **Conselho Federal da OAB (portal):** `https://www.oab.org.br/`
- **State-level “consulta” sites** (examples; verify before any automation):
  - `https://www.oabsp.org.br/` (São Paulo — illustrative)

## ToS fetch attempt

- **Homepage fetched (200):** `https://www.oab.org.br/`
- Footer/legal links did not surface an obvious HTML “termos de uso” page in the quick scan performed for scaffolding.
- **Verdict:** **`unknown`**.

## Rate-limit recommendation

Default **2 s**+; many consulta endpoints are **rate-sensitive** — expect to classify as **`rate-limited`** once official caps are captured.

## Fields available / unavailable

- Typical consulta fields: OAB number, name, subscription status; other marketing fields may be **out-of-scope**.

## Gotchas

- Federative structure: **state sections** may have **different** endpoints and ToS.

## Illustrative normalised records (synthetic)

```json
[
  {
    "sourceCountry": "BR",
    "sourceName": "Ordem dos Advogados do Brasil (illustrative row)",
    "sourceUrl": "https://www.oab.org.br/",
    "sourceLicense": "unknown",
    "sourceFetchedAt": "2026-05-12T20:00:00.000Z",
    "externalId": "BR-OAB-SP-000000",
    "fullName": "Maria Example",
    "firmName": "Example Advogados",
    "country": "BR",
    "jurisdiction": "São Paulo",
    "practiceAreas": ["Direito civil"],
    "languages": ["pt"],
    "email": null,
    "phone": null,
    "websiteUrl": null,
    "address": null,
    "disciplinaryStatus": "active",
    "verifiedByRegulator": false
  }
]
```
