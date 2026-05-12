import type { Country, LegalSystem, Region } from "@/data/types";
import { COMMONWEALTH_CODE_SET, EU_CODE_SET } from "@/data/legal-index-regions";
import { getSources } from "@/lib/jurisdictions";

/** Reference year for “freshness” heuristics — keep in sync with build date / user-facing copy. */
export const LEGAL_INDEX_REFERENCE_YEAR = 2026;

export const LEGAL_INDEX_VERSION = "1.0";

export type LegalIndexDimensionId =
  | "accessibility"
  | "plainLanguage"
  | "rightsProtection"
  | "judicialIndependence"
  | "citizenEmpowerment"
  | "constitutionalClarity"
  | "crossJurisdiction";

/**
 * Dimension weights for the overall score (sum = 1).
 * Documented on the index page — adjust only together with visible methodology text.
 */
export const LEGAL_INDEX_WEIGHTS: Record<LegalIndexDimensionId, number> = {
  accessibility: 0.16,
  plainLanguage: 0.14,
  rightsProtection: 0.18,
  judicialIndependence: 0.16,
  citizenEmpowerment: 0.1,
  constitutionalClarity: 0.14,
  crossJurisdiction: 0.12,
};

export const LEGAL_INDEX_DIMENSION_ORDER: readonly LegalIndexDimensionId[] = [
  "accessibility",
  "plainLanguage",
  "rightsProtection",
  "judicialIndependence",
  "citizenEmpowerment",
  "constitutionalClarity",
  "crossJurisdiction",
];

export type LegalIndexGrade = "A+" | "A" | "B+" | "B" | "C+" | "C" | "D" | "F";

export type LegalIndexEntry = {
  code: string;
  name: string;
  flag: string;
  region: Region;
  subregion: string;
  legalSystem: LegalSystem;
  languages: string[];
  grade: LegalIndexGrade;
  overall: number;
  dimensions: Record<LegalIndexDimensionId, number>;
  rationales: Record<LegalIndexDimensionId, string>;
};

export type LegalIndexFile = {
  version: string;
  referenceYear: number;
  generatedAt: string;
  weights: Record<LegalIndexDimensionId, number>;
  entries: LegalIndexEntry[];
};

function clampScore(n: number): number {
  if (Number.isNaN(n) || !Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n * 10) / 10));
}

/** Map 0–100 overall to a letter grade (opinionated cut points). */
export function gradeFromOverall(overall: number): LegalIndexGrade {
  const x = clampScore(overall);
  if (x >= 92) return "A+";
  if (x >= 86) return "A";
  if (x >= 79) return "B+";
  if (x >= 72) return "B";
  if (x >= 64) return "C+";
  if (x >= 56) return "C";
  if (x >= 48) return "D";
  return "F";
}

function hasLanguage(country: Country, needle: string): boolean {
  return country.languages.some((l) => l.toLowerCase().includes(needle.toLowerCase()));
}

/**
 * Accessibility (0–100)
 * Heuristic intent: proxy for how easy it is for an ordinary person to find readable materials and navigate the system
 * using only our dataset (languages + legal-system label).
 * - Bonus for widely used “library” languages (English, French, Spanish) that often have parallel legal materials online.
 * - Small bonus for Portuguese / Arabic as secondary access signals.
 * - Common-law and mixed systems score higher (case-law tradition and mixed regimes often correlate with more citizen-facing
 *   explainers in our corpus — this is a coarse proxy, not a claim about every jurisdiction).
 * - Penalty for religious-law / heavy customary / socialist labels where plural access is harder to infer from metadata alone.
 */
export function score_accessibility(country: Country): { score: number; rationale: string } {
  let s = 52;
  const bits: string[] = [];

  const accessLangs = ["english", "french", "spanish"] as const;
  const hits = accessLangs.filter((lang) => hasLanguage(country, lang));
  if (hits.length >= 2) {
    s += 18;
    bits.push(`several widely used legal-library languages (${hits.join(", ")})`);
  } else if (hits.length === 1) {
    s += 12;
    bits.push(`includes ${hits[0]}`);
  }

  if (hasLanguage(country, "portuguese") || hasLanguage(country, "arabic")) {
    s += 6;
    bits.push("Portuguese or Arabic (often broad legal material ecosystems)");
  }

  const ls = country.legalSystem;
  if (ls === "common-law") {
    s += 14;
    bits.push("common-law label (often more precedent-oriented explainers)");
  } else if (ls === "mixed") {
    s += 10;
    bits.push("mixed system");
  } else if (ls === "civil-law") {
    s += 6;
    bits.push("civil-law label");
  } else if (ls === "religious-law") {
    s -= 16;
    bits.push("religious-law label — we assume narrower plural access from metadata alone");
  } else if (ls === "islamic-law") {
    s -= 8;
    bits.push("islamic-law label");
  } else if (ls === "customary-law") {
    s -= 10;
    bits.push("customary-law label");
  } else if (ls === "socialist-law") {
    s -= 6;
    bits.push("socialist-law label");
  } else if (ls === "uncodified") {
    s -= 5;
    bits.push("uncodified constitution — single text harder to point to");
  }

  const rationale =
    bits.length > 0
      ? `Based on languages (${country.languages.join(", ")}) and legal system “${ls}”: ${bits.join("; ")}.`
      : `Based on languages and legal system “${ls}” in our dataset.`;

  return { score: clampScore(s), rationale };
}

/**
 * Plain-language constitution (0–100)
 * Heuristic: newer or recently amended texts tend to be shorter/clearer in modern constitutions; reward healthy `keyPrinciples`
 * count and a summary that is neither empty nor extremely long (very long summaries may indicate complexity).
 */
export function score_plain_language(country: Country): { score: number; rationale: string } {
  const { constitution: c } = country;
  let s = 48;
  const bits: string[] = [];

  const adopted = c.yearAdopted;
  if (adopted >= 2000) {
    s += 14;
    bits.push(`adopted in ${adopted} (recent charter)`);
  } else if (adopted >= 1990) {
    s += 10;
    bits.push(`adopted in ${adopted}`);
  } else if (adopted >= 1980) {
    s += 5;
    bits.push(`adopted in ${adopted}`);
  } else {
    bits.push(`older adoption year (${adopted})`);
  }

  const last = c.yearLatestAmendment ?? adopted;
  const yearsSinceAmend = LEGAL_INDEX_REFERENCE_YEAR - last;
  if (yearsSinceAmend <= 8) {
    s += 14;
    bits.push(`recent amendment (${last})`);
  } else if (yearsSinceAmend <= 15) {
    s += 8;
    bits.push(`amendment within ~15 years (${last})`);
  } else if (yearsSinceAmend >= 30) {
    s -= 12;
    bits.push("no recent amendment signal in dataset (30+ years)");
  }

  if (LEGAL_INDEX_REFERENCE_YEAR - adopted > 50 && yearsSinceAmend > 25) {
    s -= 10;
    bits.push("old charter without fresh amendment signal");
  }

  const kp = c.keyPrinciples.length;
  if (kp >= 5) {
    s += 12;
    bits.push(`${kp} key principles (rich outline)`);
  } else if (kp >= 4) {
    s += 8;
    bits.push(`${kp} key principles`);
  } else if (kp >= 3) {
    s += 4;
    bits.push(`${kp} key principles`);
  } else {
    s -= 6;
    bits.push("few key principles in dataset");
  }

  const len = c.summary.length;
  if (len >= 100 && len <= 720) {
    s += 10;
    bits.push("summary length looks readable in our corpus");
  } else if (len >= 50 && len < 100) {
    s += 4;
    bits.push("short summary");
  } else if (len < 40) {
    s -= 10;
    bits.push("very short summary in dataset");
  } else if (len > 950) {
    s -= 4;
    bits.push("long summary — may imply heavier reading");
  }

  return {
    score: clampScore(s),
    rationale: bits.join(" ") + " Scores our plain-language summary field, not the official text itself.",
  };
}

const RIGHTS_KEYWORDS = [
  "life",
  "liberty",
  "expression",
  "speech",
  "religion",
  "equality",
  "equal",
  "due process",
  "fair trial",
  "privacy",
  "assembly",
  "association",
  "human rights",
  "bill of rights",
  "dignity",
  "freedom",
  "discrimination",
  "cruel",
  "torture",
  "vote",
  "suffrage",
];

/**
 * Rights protection (0–100)
 * Heuristic: count rights-flavoured tokens in `keyPrinciples` + summary (dataset-only proxy for breadth of explicit rights talk).
 */
export function score_rights_protection(country: Country): { score: number; rationale: string } {
  const blob = `${country.constitution.summary}\n${country.constitution.keyPrinciples.join("\n")}`.toLowerCase();
  let matches = 0;
  for (const kw of RIGHTS_KEYWORDS) {
    if (blob.includes(kw)) matches += 1;
  }
  const capped = Math.min(matches, 12);
  let s = 38 + capped * 5;
  if (country.constitution.keyPrinciples.some((p) => /rights/i.test(p))) {
    s += 8;
  }
  const rationale = `Matched ${matches} rights-related keyword categories in our summary/key principles (educational proxy, not a rights audit).`;
  return { score: clampScore(s), rationale };
}

/**
 * Judicial independence (0–100)
 * Heuristic: favour common/civil/mixed labels; penalise systems where independence is harder to infer;
 * reward explicit “independent judiciary / separation of powers” style phrases in principles.
 */
export function score_judicial_independence(country: Country): { score: number; rationale: string } {
  let s = 44;
  const bits: string[] = [];
  const ls = country.legalSystem;

  if (ls === "common-law" || ls === "civil-law") {
    s += 14;
    bits.push(`${ls} tradition (often structured around ordinary courts)`);
  } else if (ls === "mixed") {
    s += 13;
    bits.push("mixed system");
  } else if (ls === "socialist-law") {
    s -= 12;
    bits.push("socialist-law label");
  } else if (ls === "religious-law") {
    s -= 14;
    bits.push("religious-law label");
  } else if (ls === "islamic-law") {
    s -= 8;
    bits.push("islamic-law label");
  } else if (ls === "customary-law") {
    s -= 8;
    bits.push("customary-law label");
  } else if (ls === "uncodified") {
    s += 4;
    bits.push("uncodified — independence may rest on convention (neutral-small bonus)");
  }

  const principles = country.constitution.keyPrinciples.join(" ").toLowerCase();
  if (
    principles.includes("independent judiciary") ||
    principles.includes("judicial independence") ||
    principles.includes("separation of powers") ||
    principles.includes("constitutional court")
  ) {
    s += 14;
    bits.push("principles mention judicial independence or separation of powers");
  }

  if (country.region === "Europe") {
    s += 5;
    bits.push("Europe region (ECHR density proxy — very rough)");
  } else if (country.region === "Oceania") {
    s += 4;
    bits.push("Oceania region");
  } else if (country.region === "Americas") {
    s += 3;
    bits.push("Americas region");
  }

  return {
    score: clampScore(s),
    rationale:
      (bits.length ? bits.join("; ") + ". " : "") +
      "Uses legal-system label + keyword scan of key principles only.",
  };
}

const EMPOWERMENT_KEYWORDS = [
  "referendum",
  "initiative",
  "petition",
  "recall",
  "participation",
  "popular",
  "civic",
  "consultation",
];

/**
 * Citizen empowerment (0–100)
 * Heuristic: we rarely have explicit referendum rules in JSON — proxy with modern adoption year + participation keywords.
 */
export function score_citizen_empowerment(country: Country): { score: number; rationale: string } {
  let s = 40;
  const bits: string[] = [];
  const adopted = country.constitution.yearAdopted;
  if (adopted >= 2010) {
    s += 16;
    bits.push(`recent adoption (${adopted}) often correlates with participation clauses`);
  } else if (adopted >= 2000) {
    s += 10;
    bits.push(`adopted ${adopted}`);
  } else if (adopted >= 1990) {
    s += 5;
  }

  const blob = `${country.constitution.summary}\n${country.constitution.keyPrinciples.join("\n")}`.toLowerCase();
  let k = 0;
  for (const w of EMPOWERMENT_KEYWORDS) {
    if (blob.includes(w)) k += 1;
  }
  const add = Math.min(k * 7, 28);
  s += add;
  if (k > 0) bits.push(`found ${k} participation-style keywords in our text fields`);

  if (blob.includes("democra")) {
    s += 6;
    bits.push("democracy language present");
  }

  return {
    score: clampScore(s),
    rationale:
      (bits.join("; ") || "No strong participation keywords found.") +
      " This dimension is intentionally weakly informed — we do not parse full constitutions.",
  };
}

/**
 * Constitutional clarity (0–100)
 * Heuristic: amendment freshness, number of linked sources in our dataset, penalty for uncodified/scattered framing.
 */
export function score_constitutional_clarity(country: Country): { score: number; rationale: string } {
  let s = 46;
  const bits: string[] = [];
  const c = country.constitution;
  const last = c.yearLatestAmendment ?? c.yearAdopted;
  const stale = LEGAL_INDEX_REFERENCE_YEAR - last;

  if (stale <= 6) {
    s += 14;
    bits.push(`very recent amendment signal (${last})`);
  } else if (stale <= 14) {
    s += 9;
    bits.push(`recent amendment (${last})`);
  } else if (stale >= 32) {
    s -= 12;
    bits.push("stale amendment signal in dataset");
  }

  const nSources = getSources(country).length;
  if (nSources >= 2) {
    s += 12;
    bits.push(`${nSources} linked sources in BasicLaw`);
  } else if (nSources === 1) {
    s += 5;
    bits.push("one linked source");
  } else {
    s -= 6;
    bits.push("no sources listed");
  }

  if (c.officialUrl) {
    s += 4;
    bits.push("official URL present");
  }

  if (country.legalSystem === "uncodified") {
    s -= 10;
    bits.push("uncodified — clarity proxy penalised");
  }

  return {
    score: clampScore(s),
    rationale: bits.join("; ") + " Measures traceability in our product data, not statutory drafting quality.",
  };
}

/**
 * Cross-jurisdiction interoperability (0–100)
 * Heuristic: EU / Commonwealth membership lists + mild region baseline (treaty / bloc density proxy).
 */
export function score_cross_jurisdiction(country: Country): { score: number; rationale: string } {
  let s = 36;
  const bits: string[] = [];
  const code = country.code.toUpperCase();

  if (EU_CODE_SET.has(code)) {
    s += 24;
    bits.push("EU member (regional law ecosystem proxy)");
  } else if (country.region === "Europe") {
    s += 10;
    bits.push("European non-EU (Council of Europe / bilateral density proxy)");
  }

  if (COMMONWEALTH_CODE_SET.has(code)) {
    s += 16;
    bits.push("Commonwealth member (shared legal-profession networks proxy)");
  }

  if (country.region === "Americas") s += 5;
  if (country.region === "Oceania") s += 6;
  if (country.region === "Africa") s += 4;
  if (country.region === "Asia") s += 5;

  return {
    score: clampScore(s),
    rationale:
      bits.join("; ") +
      (bits.length ? ". " : "") +
      "Educational proxy from membership lists — not an inventory of treaty commitments.",
  };
}

function weightedOverall(dimensions: Record<LegalIndexDimensionId, number>): number {
  let sum = 0;
  for (const id of LEGAL_INDEX_DIMENSION_ORDER) {
    sum += dimensions[id] * LEGAL_INDEX_WEIGHTS[id];
  }
  return clampScore(sum);
}

/** Compute one index row from a `Country` (deterministic, no I/O). */
export function computeLegalIndexEntry(country: Country): LegalIndexEntry {
  const a = score_accessibility(country);
  const p = score_plain_language(country);
  const r = score_rights_protection(country);
  const j = score_judicial_independence(country);
  const e = score_citizen_empowerment(country);
  const c = score_constitutional_clarity(country);
  const x = score_cross_jurisdiction(country);

  const dimensions: Record<LegalIndexDimensionId, number> = {
    accessibility: a.score,
    plainLanguage: p.score,
    rightsProtection: r.score,
    judicialIndependence: j.score,
    citizenEmpowerment: e.score,
    constitutionalClarity: c.score,
    crossJurisdiction: x.score,
  };

  const rationales: Record<LegalIndexDimensionId, string> = {
    accessibility: a.rationale,
    plainLanguage: p.rationale,
    rightsProtection: r.rationale,
    judicialIndependence: j.rationale,
    citizenEmpowerment: e.rationale,
    constitutionalClarity: c.rationale,
    crossJurisdiction: x.rationale,
  };

  const overall = weightedOverall(dimensions);

  return {
    code: country.code,
    name: country.name,
    flag: country.flag,
    region: country.region,
    subregion: country.subregion,
    legalSystem: country.legalSystem,
    languages: country.languages,
    grade: gradeFromOverall(overall),
    overall,
    dimensions,
    rationales,
  };
}

/** Build the full serialisable payload for `legal-index.generated.json`. */
export function buildLegalIndexFile(countries: Country[]): LegalIndexFile {
  const entries = countries.map(computeLegalIndexEntry).sort((a, b) => b.overall - a.overall);
  return {
    version: LEGAL_INDEX_VERSION,
    referenceYear: LEGAL_INDEX_REFERENCE_YEAR,
    generatedAt: new Date().toISOString(),
    weights: { ...LEGAL_INDEX_WEIGHTS },
    entries,
  };
}
