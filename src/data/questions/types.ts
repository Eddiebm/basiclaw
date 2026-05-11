import type { ArchetypeId, DisclaimerTier, Domain, RiskFlag, Stage } from "./taxonomy";

export interface CitizenQuestion {
  id: string;
  stage: Stage;
  domain: Domain;
  archetype: ArchetypeId;
  question: string;
  /** Minimum jurisdiction dimension needed for a useful answer. */
  minJurisdiction: "country";
  /** True when subnational law commonly differs inside a country. */
  subnationalRelevance: boolean;
  risk: RiskFlag;
  disclaimerTier: DisclaimerTier;
  related: string[];
}
