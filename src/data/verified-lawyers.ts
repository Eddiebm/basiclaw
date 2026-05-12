export type LawyerFeeStructure = "free" | "sliding-scale" | "paid" | "contingency";

export type LawyerPartnerTier = "directory" | "featured" | "premium";

export type NotableReview = { quote: string; attribution: string };

/**
 * Manually curated verified counsel for the public directory.
 * Self-registered partners use `PartnerLawyer` in storage (`src/lib/partner-storage.ts`).
 */
export type VerifiedLawyer = {
  id: string;
  /** URL-safe unique slug for `/lawyers/[slug]` */
  slug: string;
  name: string;
  country: string;
  jurisdiction: string;
  barNumber?: string;
  practiceAreas: string[];
  reviewedConstitutionForCountry?: boolean;
  /** e.g. `us:rights`, `gh:landlord`, `us-state:ca:employment` */
  reviewedTopicIds?: string[];
  badgeUrl?: string;
  statement?: string;
  verifiedAt: string;
  firmName?: string;
  headshotUrl?: string;
  websiteUrl?: string;
  phone?: string;
  email?: string;
  languages: string[];
  feeStructure?: LawyerFeeStructure;
  acceptsRemoteClients?: boolean;
  notableReviews?: NotableReview[];
  /** When > 0, referral economics may apply after manual conversion logging */
  referralCommissionPct?: number;
  partnerTier?: LawyerPartnerTier;
  /** Stub for JSON-LD when ratings are introduced */
  aggregateRatingValue?: number;
  aggregateRatingCount?: number;
};

/**
 * Public directory seed. Replace or extend with real verified counsel as you onboard reviewers.
 */
export const VERIFIED_LAWYERS: VerifiedLawyer[] = [
  {
    id: "verified-us-jordan-alvarez",
    slug: "jordan-alvarez-california",
    name: "Jordan Alvarez",
    firmName: "Alvarez Civil Review PLLC (sample)",
    country: "US",
    jurisdiction: "California Bar",
    barNumber: "000000",
    practiceAreas: ["Civil rights", "Housing", "Employment"],
    reviewedConstitutionForCountry: true,
    reviewedTopicIds: ["us:rights", "us-state:ca:employment", "us:landlord"],
    statement:
      "Educational accuracy review of BasicLaw US constitution overview and selected topic guides. Sample listing for demonstration.",
    verifiedAt: "2026-03-15T10:00:00.000Z",
    languages: ["English", "Spanish"],
    feeStructure: "sliding-scale",
    acceptsRemoteClients: true,
    headshotUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=JordanAlvarez",
    websiteUrl: "https://example.com",
    notableReviews: [
      {
        quote: "Clear, practical guidance on tenant protections.",
        attribution: "Community legal workshop participant (sample)",
      },
    ],
    referralCommissionPct: 0,
    partnerTier: "featured",
  },
  {
    id: "verified-gb-amira-hassan",
    slug: "amira-hassan-london",
    name: "Amira Hassan",
    firmName: "Hassan & Co. (sample)",
    country: "GB",
    jurisdiction: "Solicitor of England and Wales",
    practiceAreas: ["Employment", "Housing", "Immigration"],
    reviewedConstitutionForCountry: true,
    reviewedTopicIds: ["gb:rights"],
    statement: "Sample reviewer for UK constitutional overview pages on BasicLaw.",
    verifiedAt: "2026-04-01T12:00:00.000Z",
    languages: ["English", "Arabic"],
    feeStructure: "paid",
    acceptsRemoteClients: true,
    headshotUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=AmiraHassan",
    websiteUrl: "https://example.com",
    referralCommissionPct: 5,
    partnerTier: "premium",
  },
  {
    id: "verified-gh-kwame-boateng",
    slug: "kwame-boateng-accra",
    name: "Kwame Boateng",
    firmName: "Boateng Legal Consult (sample)",
    country: "GH",
    jurisdiction: "Ghana Bar Association",
    practiceAreas: ["Land law", "Employment", "Civil litigation"],
    reviewedConstitutionForCountry: true,
    reviewedTopicIds: ["gh:rights", "gh:landlord"],
    statement: "Sample listing for Ghana constitution and housing topic alignment.",
    verifiedAt: "2026-04-10T09:30:00.000Z",
    languages: ["English", "Twi"],
    feeStructure: "contingency",
    acceptsRemoteClients: false,
    headshotUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=KwameBoateng",
    referralCommissionPct: 0,
    partnerTier: "directory",
  },
  {
    id: "verified-ng-chioma-okeke",
    slug: "chioma-okeke-lagos",
    name: "Chioma Okeke",
    firmName: "Okeke & Partners (sample)",
    country: "NG",
    jurisdiction: "Nigerian Bar Association",
    practiceAreas: ["Commercial contracts", "Employment", "Data protection"],
    reviewedConstitutionForCountry: true,
    reviewedTopicIds: ["ng:rights"],
    statement: "Sample reviewer aligned with Nigeria constitutional overview content.",
    verifiedAt: "2026-04-18T14:00:00.000Z",
    languages: ["English", "Igbo"],
    feeStructure: "paid",
    acceptsRemoteClients: true,
    headshotUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=ChiomaOkeke",
    notableReviews: [
      {
        quote: "Structured explanations that help founders understand their duties.",
        attribution: "Tech hub office hours (sample)",
      },
    ],
    referralCommissionPct: 10,
    partnerTier: "featured",
  },
  {
    id: "verified-in-priya-menon",
    slug: "priya-menon-delhi",
    name: "Priya Menon",
    firmName: "Menon Chambers (sample)",
    country: "IN",
    jurisdiction: "Bar Council of Delhi",
    practiceAreas: ["Constitutional law", "Fundamental rights", "Public interest"],
    reviewedConstitutionForCountry: true,
    reviewedTopicIds: ["in:rights"],
    statement: "Sample alignment with India constitutional summaries on BasicLaw.",
    verifiedAt: "2026-05-01T11:15:00.000Z",
    languages: ["English", "Hindi"],
    feeStructure: "sliding-scale",
    acceptsRemoteClients: true,
    headshotUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=PriyaMenon",
    referralCommissionPct: 0,
    partnerTier: "directory",
  },
];

export function getVerifiedLawyerBySlug(slug: string): VerifiedLawyer | undefined {
  const s = slug.trim().toLowerCase();
  return VERIFIED_LAWYERS.find((l) => l.slug.toLowerCase() === s);
}
