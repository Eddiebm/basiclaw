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


const MAX_TOPIC_VERIFIERS = 3;

function compareVerifiersForTopic(a: VerifiedLawyer, b: VerifiedLawyer): number {
  const ta = new Date(a.verifiedAt).getTime();
  const tb = new Date(b.verifiedAt).getTime();
  if (tb !== ta) return tb - ta;
  return a.name.localeCompare(b.name);
}

export function listVerifiersForCountryTopic(countryCode: string, topicSlug: string): VerifiedLawyer[] {
  const id = `${countryCode.toLowerCase()}:${topicSlug}`;
  return VERIFIED_LAWYERS.filter((l) => l.reviewedTopicIds?.includes(id))
    .slice()
    .sort(compareVerifiersForTopic)
    .slice(0, MAX_TOPIC_VERIFIERS);
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
