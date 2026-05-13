# i18n human review queue

**Last updated:** 2026-05-12

This file lists `next-intl` message keys where machine translation or legal/SEO wording may need a native or subject-matter pass. Each line is: **key path** — English source intent — **locales to review** (non-exhaustive; add others if voice feels off).

## How to use

1. Open `src/messages/<locale>.json` and find the key (nested paths use `.`, e.g. `legalIndex.detailShareCardTitle`).
2. Prefer keeping the brand name **BasicLaw** untranslated unless the locale team explicitly wants a transliteration.
3. For Schema.org JSON-LD (`pressPage.jsonLdContactType`, `legalIndex.jsonLdProp*`), confirm whether the value should stay in English for data consumers or be localized for the page language.

## Queue

| Key path | English / notes | Review locales |
| -------- | ---------------- | -------------- |
| `legalIndex.jsonLdPropAccessibility` … `jsonLdPropCrossJurisdictionInterop` | Dimension labels embedded in Dataset JSON-LD | `ar`, `zh`, `hi` (legal term nuance) |
| `legalIndex.jsonLdTopTenListName` | Marketing-style dataset + leaderboard line | `ar`, `zh` |
| `legalIndex.detailShareCardTitle` | Share title pattern with grade and /100 | `ar`, `zh` |
| `legalIndex.detailDimensionScore` | “Score:” in educational ranking context | `ar`, `zh`, `hi` |
| `legalIndex.ogSubtitleEducational` | OG image subtitle | `ar`, `zh` |
| `pressPage.jsonLdContactType` | Schema.org `contactType` (often English in the wild) | All if you standardize on one convention |
| `pressPage.ogImageChatSubtitle` … `ogImageQuestionsSubtitle` | Short OG marketing lines | `ar`, `zh` |
| `pressPage.screenshotAlt*` | Long accessibility descriptions | `ar`, `zh` |
| `embedPage.auditTypes.*` | Audit preset labels in embed config | `ar`, `zh` |
| `comparePage.panelHeadline` | Name · year with middle dot; RTL layout | `ar` |
| `lawyersBecomePartner.*` (zh overlay) | Partner programme copy | `zh` (plus parity review if other locales add overlays) |

## Deferred / out of scope (this pass)

- **`/admin/answers`**: Internal tooling; left English-only by design.
- **Region / subregion / country names** on the-index detail header: still from data, not message bundles.
