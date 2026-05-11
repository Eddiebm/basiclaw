import type { Domain } from "@/data/questions/taxonomy";

export const DOMAIN_LABEL: Record<Domain, string> = {
  "identity-status": "Identity & status",
  "money-debt-tax": "Money, debt & tax",
  housing: "Housing",
  work: "Work",
  "policing-courts": "Policing & courts",
  "family-children": "Family & children",
  "health-incapacity": "Health & incapacity",
  "digital-life": "Digital life",
  "business-self-employed": "Business & self‑employed",
  "cross-border-immigration": "Cross‑border & immigration",
  "consumer-rights": "Consumer rights",
  "inheritance-estate": "Inheritance & estate",
};

export const STAGE_LABEL: Record<string, string> = {
  child: "Child",
  teen: "Teen",
  "young-adult": "Young adult",
  "working-age": "Working age",
  "family-formation": "Family formation",
  midlife: "Midlife",
  "older-adult": "Older adult",
  "end-of-life": "End of life",
};

export const RISK_LABEL: Record<string, string> = {
  "urgent-criminal": "Urgent / criminal",
  "immigration-removal": "Immigration / removal",
  "domestic-violence": "Domestic violence",
  "child-welfare": "Child welfare",
  "mental-health-hold": "Mental health hold",
  none: "General",
};
