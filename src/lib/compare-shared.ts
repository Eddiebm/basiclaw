import type { ConstitutionSource, LegalSystem } from "@/data/types";

export const COMPARE_TOPICS = [
  "rights",
  "government-structure",
  "judiciary",
  "amendment-process",
  "religious-freedom",
  "free-expression",
] as const;
export type CompareTopic = (typeof COMPARE_TOPICS)[number];

export function isCompareTopic(value: string | undefined): value is CompareTopic {
  return !!value && (COMPARE_TOPICS as readonly string[]).includes(value);
}

export interface CompareSidePayload {
  code: string;
  flag: string;
  name: string;
  constitutionTitle: string;
  yearAdopted: number;
  legalSystem: LegalSystem;
  legalSystemLabel: string;
  sectionHeading: string;
  sectionBody: string;
  keyPrinciples: string[];
  sources: ConstitutionSource[];
  lastVerified: string;
}

export interface CompareNarrativeFacts {
  topicLabel: string;
  aName: string;
  bName: string;
  aSystem: LegalSystem;
  bSystem: LegalSystem;
  aSystemLabel: string;
  bSystemLabel: string;
  aTopicPrinciples: number;
  bTopicPrinciples: number;
  aVerified: string;
  bVerified: string;
}

export function legalSystemsMatch(a: LegalSystem, b: LegalSystem): boolean {
  return a === b;
}
