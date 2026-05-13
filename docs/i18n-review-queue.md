# i18n human review queue

**Last updated:** 2026-05-12 (burn-down pass)

## Pass summary (this worker)

| Metric | Value |
| ------ | ----- |
| **Flagged before** (approx. locale-specific review slots in the prior table) | **~42** (11 grouped rows × multiple locales; see archived note below) |
| **Resolved — auto (A)** | **6** — `pressPage.jsonLdContactType` aligned to English `public relations` in `ar`, `zh`, `hi`, `es`, `pt` (`fr` already matched) for predictable Schema.org consumers |
| **Resolved — best-effort (B)** | **4** — `ar` Legal Literacy JSON-LD labels (`jsonLdPropAccessibility`, `jsonLdPropCrossJurisdictionInterop`); `hi` press-kit logo download strings (removed stray English “parchment”) |
| **Remaining — human (C)** | **~22** slots (see priority buckets; mostly **ar** + **zh** polish, one RTL layout item) |

### By locale (remaining)

| Locale | Approx. remaining slots |
| ------ | -----------------------: |
| `ar` | 12 |
| `zh` | 9 |
| `hi` | 3 |
| `es`, `fr`, `pt` | 0 (no open items after this pass) |

### By surface (remaining, high → low traffic)

| Surface | Notes |
| ------- | ----- |
| **Legal Literacy Index** (detail + OG + JSON-LD row labels) | Marketing and educational-disclaimer tone; dimension names in structured data |
| **Press kit** (OG image lines + long `screenshotAlt*`) | Short marketing lines + accessibility copy length |
| **Embed developer page** (`embedPage.auditTypes.*`) | Legal-adjacent preset names |
| **Compare constitutions** (`comparePage.panelHeadline`) | RTL / punctuation with dynamic country data |
| **Lawyers — become partner** (`lawyersBecomePartner.*`, `zh` overlay) | Programme copy parity vs other locales |

### Best-effort edits — native sign-off

<!-- REVIEW: ar — needs native speaker — `legalIndex.jsonLdPropAccessibility` now "سهولة الوصول" (was "إتاحة الوصول"); confirm nuance vs disability-a11y ambiguity. -->
<!-- REVIEW: ar — needs native speaker — `legalIndex.jsonLdPropCrossJurisdictionInterop` now "التوافق بين الولايات القضائية"; prior MT read like "binary operation". -->

---

## How to use

1. Open `src/messages/<locale>.json` and find the key (nested paths use `.`, e.g. `legalIndex.detailShareCardTitle`).
2. Prefer keeping the brand name **BasicLaw** untranslated unless the locale team explicitly wants a transliteration.
3. Supported UI locales are defined in `src/i18n/routing.ts`: `en`, `es`, `fr`, `ar`, `pt`, `hi`, `zh`. Non-English files are **partial overlays** merged on top of `en.json` (`src/i18n/request.ts`).

---

## Queue (by priority)

### P1 — Layout / RTL (fix may need code + copy)

| Key path | English / notes | Review locales |
| -------- | ---------------- | -------------- |
| `comparePage.panelHeadline` | `{name} · {year}` — middle dot + LTR placeholders inside RTL chrome | `ar` |

### P2 — High-visibility marketing & OG

| Key path | English / notes | Review locales |
| -------- | ---------------- | -------------- |
| `legalIndex.ogSubtitleEducational` | OG / sharing subtitle | `ar`, `zh` |
| `legalIndex.detailShareCardTitle` | Share title with grade and `/100` | `ar`, `zh` |
| `legalIndex.jsonLdTopTenListName` | Dataset / leaderboard line | `ar`, `zh` |
| `legalIndex.detailDimensionScore` | “Score:” pattern in ranking context | `ar`, `zh`, `hi` |
| `pressPage.ogImageChatSubtitle` | Short OG line | `ar`, `zh` |
| `pressPage.ogImageAuditSubtitle` | Short OG line | `ar`, `zh` |
| `pressPage.ogImageConstitutionSubtitle` | Short OG line | `ar`, `zh` |
| `pressPage.ogImageQuestionsSubtitle` | Short OG line | `ar`, `zh` |

### P3 — Accessibility strings & legal-adjacent labels

| Key path | English / notes | Review locales |
| -------- | ---------------- | -------------- |
| `pressPage.screenshotAltChat` | Long alt text | `ar`, `zh` |
| `pressPage.screenshotAltAudit` | Long alt text | `ar`, `zh` |
| `pressPage.screenshotAltConstitution` | Long alt text | `ar`, `zh` |
| `pressPage.screenshotAltQuestions` | Long alt text | `ar`, `zh` |
| `legalIndex.jsonLdPropAccessibility` … `jsonLdPropCrossJurisdictionInterop` | Dimension labels in Dataset JSON-LD | `ar`, `zh`, `hi` |
| `embedPage.auditTypes.*` | Audit preset labels | `ar`, `zh` |
| `lawyersBecomePartner.*` | Partner programme overlay | `zh` (other locales use EN fallback until overlays land) |

---

## Deferred / out of scope

- **`/admin/answers`**: Internal tooling; English-only by design.
- **Region / subregion / country names** on the-index detail header: from data, not message bundles.
- **`embedPage` hero / config copy** still English in `ar`/`zh`/`hi` overlays: not on the prior queue; track separately if you want full locale coverage for the developer page.

---

## Archived — prior queue table (2026-05-12 pre-pass)

The former single flat table listed: Legal Literacy JSON-LD props; OG strings; press `jsonLdContactType`; embed audit types; compare panel headline; lawyers partner `zh` overlay. Items addressed in this pass were removed above; `jsonLdContactType` convention is now **English everywhere**.

### Tooling recommendation

For the **~22** remaining slots, a **translation TMS** (Lokalise, Crowdin, or Smartling) beats a one-off freelancer: you get glossary locks (**BasicLaw**, `Legal Literacy Index`, `/100` placeholders), QA for ICU placeholders, and reviewer workflows per locale. Add a **part-time native reviewer** only if you need legal-tone sign-off in **ar** or **zh** after TMS first pass.
