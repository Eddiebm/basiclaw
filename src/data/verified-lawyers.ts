export type VerifiedLawyer = {
  id: string;
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
  /** Stub for JSON-LD when ratings are introduced */
  aggregateRatingValue?: number;
  aggregateRatingCount?: number;
};

/**
 * Public directory seed. Replace or extend with real verified counsel as you onboard reviewers.
 */
export const VERIFIED_LAWYERS: VerifiedLawyer[] = [
  {
    id: "sample-verifier-us-1",
    name: "Jordan Alvarez",
    country: "US",
    jurisdiction: "California Bar",
    barNumber: "000000",
    practiceAreas: ["Civil rights", "Housing", "Employment"],
    reviewedConstitutionForCountry: true,
    reviewedTopicIds: ["us:rights", "us-state:ca:employment", "us:landlord"],
    statement: "Educational accuracy review of BasicLaw US constitution overview and selected topic guides.",
    verifiedAt: "2026-03-15T10:00:00.000Z",
  },
];
