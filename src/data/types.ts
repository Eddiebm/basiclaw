export type LegalSystem =
  | "common-law"
  | "civil-law"
  | "islamic-law"
  | "customary-law"
  | "religious-law"
  | "mixed"
  | "socialist-law"
  | "uncodified";

export type Region =
  | "Africa"
  | "Americas"
  | "Asia"
  | "Europe"
  | "Oceania"
  | "Antarctica";

export type Subregion =
  | "Northern Africa"
  | "Sub-Saharan Africa"
  | "Western Africa"
  | "Eastern Africa"
  | "Middle Africa"
  | "Southern Africa"
  | "Northern America"
  | "Central America"
  | "Caribbean"
  | "South America"
  | "Central Asia"
  | "Eastern Asia"
  | "Southern Asia"
  | "South-Eastern Asia"
  | "Western Asia"
  | "Eastern Europe"
  | "Northern Europe"
  | "Southern Europe"
  | "Western Europe"
  | "Australia and New Zealand"
  | "Melanesia"
  | "Micronesia"
  | "Polynesia";

export type CountryStatus = "active" | "preview" | "planned";

export interface ConstitutionSource {
  label: string;
  url: string;
}

export interface Constitution {
  title: string;
  yearAdopted: number;
  yearLatestAmendment?: number;
  summary: string;
  keyPrinciples: string[];
  officialUrl?: string;
  fullTextUrl?: string;
  sources?: ConstitutionSource[];
  lastVerified?: string;
}

export interface Country {
  code: string;
  alpha3: string;
  name: string;
  officialName?: string;
  flag: string;
  region: Region;
  subregion: Subregion;
  capital: string;
  languages: string[];
  legalSystem: LegalSystem;
  constitution: Constitution;
  status: CountryStatus;
  popular?: boolean;
}

export const LEGAL_SYSTEM_LABELS: Record<LegalSystem, string> = {
  "common-law": "Common Law",
  "civil-law": "Civil Law",
  "islamic-law": "Islamic Law",
  "customary-law": "Customary Law",
  "religious-law": "Religious Law",
  "mixed": "Mixed System",
  "socialist-law": "Socialist Law",
  "uncodified": "Uncodified Constitution",
};

export const LEGAL_SYSTEM_DESCRIPTIONS: Record<LegalSystem, string> = {
  "common-law":
    "Built on judge-made precedent. Courts interpret prior decisions to apply law to new facts.",
  "civil-law":
    "Built on comprehensive written codes. Judges apply the code rather than create binding precedent.",
  "islamic-law":
    "Rooted in Sharia and the Quran. Often coexists with civil or common law in mixed systems.",
  "customary-law":
    "Drawn from local traditions and community-recognised norms, often unwritten.",
  "religious-law":
    "Rooted in religious texts and authority \u2014 e.g. Halakha, Canon law.",
  "mixed":
    "Combines two or more legal traditions \u2014 e.g. common law plus customary, or civil plus Islamic.",
  "socialist-law":
    "Civil-law tradition adapted under socialist political theory.",
  "uncodified":
    "No single written constitution \u2014 derived from statutes, conventions, and case law.",
};
