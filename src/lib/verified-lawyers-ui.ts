import type { VerifiedLawyer } from "@/data/verified-lawyers";
import { VERIFIED_LAWYERS } from "@/data/verified-lawyers";

export function findVerifierForConstitution(countryCode: string): VerifiedLawyer | null {
  const c = countryCode.toUpperCase();
  return (
    VERIFIED_LAWYERS.find(
      (l) => l.reviewedConstitutionForCountry && l.country.toUpperCase() === c
    ) ?? null
  );
}

export function findVerifierForCountryTopic(countryCode: string, topicSlug: string): VerifiedLawyer | null {
  const id = `${countryCode.toLowerCase()}:${topicSlug}`;
  return VERIFIED_LAWYERS.find((l) => l.reviewedTopicIds?.includes(id)) ?? null;
}

export function findVerifierForUsStateTopic(stateCode: string, topicSlug: string): VerifiedLawyer | null {
  const id = `us-state:${stateCode.toLowerCase()}:${topicSlug}`;
  return VERIFIED_LAWYERS.find((l) => l.reviewedTopicIds?.includes(id)) ?? null;
}

export function listVerifiedLawyersFiltered(jurisdictionQuery: string | undefined): VerifiedLawyer[] {
  const q = jurisdictionQuery?.trim().toLowerCase();
  if (!q) return [...VERIFIED_LAWYERS];
  return VERIFIED_LAWYERS.filter((l) => l.jurisdiction.toLowerCase().includes(q) || l.country.toLowerCase().includes(q));
}
