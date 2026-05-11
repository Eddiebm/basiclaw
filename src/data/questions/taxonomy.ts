export const STAGES = [
  "child",
  "teen",
  "young-adult",
  "working-age",
  "family-formation",
  "midlife",
  "older-adult",
  "end-of-life",
] as const;

export type Stage = (typeof STAGES)[number];

export const DOMAINS = [
  "identity-status",
  "money-debt-tax",
  "housing",
  "work",
  "policing-courts",
  "family-children",
  "health-incapacity",
  "digital-life",
  "business-self-employed",
  "cross-border-immigration",
  "consumer-rights",
  "inheritance-estate",
] as const;

export type Domain = (typeof DOMAINS)[number];

export const ARCHETYPES = [
  {
    id: "can-without-consent",
    label: "Can X do Y without my consent?",
  },
  {
    id: "ignore-consequences",
    label: "What happens if I ignore Z?",
  },
  {
    id: "deadline",
    label: "What is the deadline for A?",
  },
  {
    id: "who-to-complain",
    label: "Who do I complain to about B?",
  },
  {
    id: "documents-needed",
    label: "What documents do I need for C?",
  },
  {
    id: "enforceable-where",
    label: "Is D enforceable in E?",
  },
  {
    id: "how-much-charge",
    label: "How much can they charge for F?",
  },
  {
    id: "can-refuse",
    label: "Can I refuse G?",
  },
  {
    id: "rights-when",
    label: "What are my rights when H happens?",
  },
  {
    id: "how-to-challenge",
    label: "How do I challenge I?",
  },
  {
    id: "what-counts-as",
    label: "What counts as J under the law?",
  },
  {
    id: "crime-vs-civil",
    label: "When does K become a crime vs civil matter?",
  },
] as const;

export type ArchetypeId = (typeof ARCHETYPES)[number]["id"];

export const JURISDICTION_DIMENSIONS = [
  "country",
  "subnational",
  "supranational",
  "parallel-system",
] as const;

export type JurisdictionDimension = (typeof JURISDICTION_DIMENSIONS)[number];

export const RISK_FLAGS = [
  "urgent-criminal",
  "immigration-removal",
  "domestic-violence",
  "child-welfare",
  "mental-health-hold",
  "none",
] as const;

export type RiskFlag = (typeof RISK_FLAGS)[number];

export const DISCLAIMER_TIERS = ["standard", "elevated"] as const;

export type DisclaimerTier = (typeof DISCLAIMER_TIERS)[number];

export function disclaimerTierForRisk(risk: RiskFlag): DisclaimerTier {
  return risk === "none" ? "standard" : "elevated";
}
