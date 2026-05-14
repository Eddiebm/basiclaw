# Lawyer marketplace v2 (BasicLaw)

This document describes how verified listings, partner directory records, leads, and referral economics fit together. It is **not** legal advice.

## Data sources

- **Verified lawyers** — manually curated in `src/data/verified-lawyers.ts`. These listings ship with the repo and are intended for reviewers you have explicitly onboarded.
- **Partner lawyers** — approved partners stored via `src/lib/partner-storage.ts`. Persistence prefers Redis (`KV_REST_*`); otherwise a local JSON file under `tmp/basiclaw-partners.json` for development.

Logical key namespaces (for operators and future Redis resharding):

- `partners:applications` — partner intake records (pending/approved/rejected).
- `partners:byCountry:{code}` / `partners:byId:{id}` / `partners:byPlan` — reserved for a future normalized layout; today the backing store is a single versioned JSON blob `basiclaw:partners:v1`.
- `lawyer-leads:submitted` — consultation requests from `/api/lawyer-leads/[slug]`.
- `lawyer-leads:converted` — manual conversion log when a referred matter closes externally.

## Public safety

- **No pending applications** are exposed from any `GET` route. Only approved `PartnerLawyer` rows surface in `/lawyers`, `/api/public/lawyer-matches`, and audit/chat widgets.

## Partner intake

1. `/find-a-lawyer` and `/lawyers/become-a-partner` post to `POST /api/partner-applications`.
2. Applications are stored and optionally emailed to `LAWYER_LEADS_EMAIL` (or fallbacks per route) via **Resend** when `RESEND_API_KEY` + `RESEND_FROM_EMAIL` are set.

## Approval (manual v2.0)

Use the server helper:

```ts
import { approvePartnerApplication } from "@/lib/partner-storage";

await approvePartnerApplication("<application-id>", "featured");
```

This creates a `PartnerLawyer` with a unique slug and marks the application approved. Refine bio, headshot, languages, and fee fields directly in storage until an admin UI lands (v2.1).

## Consultation leads

`POST /api/lawyer-leads/[slug]` validates the slug against verified or partner listings, appends a lead record, emails operations (`LAWYER_LEADS_EMAIL`), and — when the listing has an `email` on file — forwards to the lawyer via Resend.

## Referral commission (`referralCommissionPct`)

When `referralCommissionPct > 0`, economics are **not** settled automatically (no webhooks from external counsel billing systems yet). For a closed matter attributed to a directory lead, append a conversion row:

```ts
import { appendConvertedLead } from "@/lib/partner-storage";

await appendConvertedLead({
  lawyerSlug: "example-slug",
  lawyerId: "…",
  kind: "partner",
  estimatedValueUsd: 1200,
  note: "Matter closed — invoice #12345 (external)",
});
```

Reconcile payouts offline against your own finance process.

## Analytics

- `lawyer_card_viewed`, `lawyer_contact_clicked` — directory cards.
- `lawyer_audit_referral_clicked` — audit widget deep links.
- `partner_application_submitted` — partner intake form.

## Environment variables

| Variable | Role |
|----------|------|
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | Outbound email for applications + consult leads |
| `LAWYER_LEADS_EMAIL` | Primary ops inbox for partner + consult notifications |
| `LAWYER_APPLICATIONS_EMAIL` | Optional override for **verified** reviewer applications (`/api/lawyer-applications`) |
| `PRESS_EMAIL` | Enables press form via `/api/press-contact` |

## Deferred / roadmap

- Star ratings & structured review ingestion.
- Automated conversion attribution from counsel billing or CRM webhooks.
- Admin UI for approvals, bio editing, and CSV export.
