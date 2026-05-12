import type { ConstitutionSnippet } from "@/lib/constitution-snippets";
import { getRankedSnippetsByEmbedding } from "@/lib/constitution-snippets";
import type { Country } from "@/data/types";
import { LEGAL_SYSTEM_LABELS } from "@/data/types";
import { getLastVerified, getSources } from "@/lib/jurisdictions";
import type { CompareNarrativeFacts, CompareSidePayload, CompareTopic } from "@/lib/compare-shared";

export type { CompareNarrativeFacts, CompareSidePayload, CompareTopic } from "@/lib/compare-shared";
export { COMPARE_TOPICS, isCompareTopic, legalSystemsMatch } from "@/lib/compare-shared";

const TOPIC_SNIPPET_QUERY: Record<CompareTopic, string> = {
  rights:
    "rights freedoms equality human dignity citizen privacy speech religion life liberty fundamental bill charter equality before law",
  "government-structure":
    "parliament congress president prime minister assembly chamber senate house executive legislature federal republic monarchy separation powers government",
  judiciary:
    "court judges judicial justice tribunal constitutional supreme appeal magistrate review independence",
  "amendment-process":
    "amend referendum revision constituent supermajority plebiscite change reform constitution article",
  "religious-freedom":
    "religion religious worship conscience belief secular church mosque temple establishment free exercise apostasy blasphemy",
  "free-expression":
    "expression speech press media censorship protest assembly petition opinion defamation libel whistleblower internet",
};

function pickPrinciples(country: Country, re: RegExp): string[] {
  return country.constitution.keyPrinciples.filter((p) => re.test(p));
}

function topicPrincipleRegex(topic: CompareTopic): RegExp {
  switch (topic) {
    case "rights":
      return /\b(right|rights|freedom|freedoms|equality|equal|human|dignity|citizen|privacy|speech|religion|life|liberty)\b/i;
    case "government-structure":
      return /\b(parliament|congress|president|prime|minister|assembly|chamber|senate|house|executive|legislature|federal|devolution|monarchy|republic|separation)\b/i;
    case "judiciary":
      return /\b(court|judges|judicial|justice|tribunal|constitutional|supreme|appeal|magistrate)\b/i;
    case "amendment-process":
      return /\b(amend|referendum|referenda|revision|constituent|two-thirds|supermajority|plebiscite)\b/i;
    case "religious-freedom":
      return /\b(religion|religious|worship|conscience|belief|secular|church|mosque|temple|faith|sharia|islam|christian)\b/i;
    case "free-expression":
      return /\b(speech|expression|press|media|censor|protest|assembly|petition|opinion|defamation|libel|internet)\b/i;
  }
}

async function pickBestSnippet(
  topic: CompareTopic,
  countryCode: string,
  snippets: ConstitutionSnippet[]
): Promise<ConstitutionSnippet | null> {
  const ranked = await getRankedSnippetsByEmbedding(TOPIC_SNIPPET_QUERY[topic], countryCode, snippets, 3);
  if (ranked.length === 0) return null;
  return ranked[0] ?? null;
}

export async function buildCompareSide(
  country: Country,
  topic: CompareTopic,
  snippets: ConstitutionSnippet[]
): Promise<CompareSidePayload> {
  const c = country.constitution;
  const re = topicPrincipleRegex(topic);
  const matched = pickPrinciples(country, re).slice(0, 8);
  const principles = matched.length > 0 ? matched : c.keyPrinciples.slice(0, 6);

  const snippet = await pickBestSnippet(topic, country.code, snippets);
  let sectionHeading: string;
  let sectionBody: string;

  switch (topic) {
    case "rights":
      sectionHeading = snippet?.title ?? "Constitutional rights overview";
      sectionBody = snippet?.excerpt ?? c.summary;
      break;
    case "government-structure":
      sectionHeading = snippet?.title ?? "Government and state structure";
      sectionBody =
        snippet?.excerpt ??
        `${c.title} (${c.yearAdopted}) frames how power is organised in ${country.name}. ${c.summary.slice(0, 280)}${c.summary.length > 280 ? "…" : ""}`;
      break;
    case "judiciary":
      sectionHeading = snippet?.title ?? "Courts and constitutional review";
      sectionBody =
        snippet?.excerpt ??
        `How ${country.name} structures courts and constitutional review is usually spelled out alongside separation-of-powers rules in ${c.title}. ${c.summary.slice(0, 200)}${c.summary.length > 200 ? "…" : ""}`;
      break;
    case "amendment-process":
      sectionHeading = snippet?.title ?? "Formal change and amendments";
      sectionBody =
        snippet?.excerpt ??
        `Adopted ${c.yearAdopted}${c.yearLatestAmendment && c.yearLatestAmendment !== c.yearAdopted ? `; last amendment noted ${c.yearLatestAmendment}` : ""}. ${c.summary.slice(0, 260)}${c.summary.length > 260 ? "…" : ""}`;
      break;
    case "religious-freedom":
      sectionHeading = snippet?.title ?? "Religion, conscience, and the secular frame";
      sectionBody =
        snippet?.excerpt ??
        `${country.name}'s charter typically addresses religion, secular governance, or parallel personal-status systems. ${c.summary.slice(0, 260)}${c.summary.length > 260 ? "…" : ""}`;
      break;
    case "free-expression":
      sectionHeading = snippet?.title ?? "Expression, media, and assembly";
      sectionBody =
        snippet?.excerpt ??
        `Speech, press, and assembly protections vary with each text's wording and court practice in ${country.name}. ${c.summary.slice(0, 260)}${c.summary.length > 260 ? "…" : ""}`;
      break;
  }

  return {
    code: country.code,
    flag: country.flag,
    name: country.name,
    constitutionTitle: c.title,
    yearAdopted: c.yearAdopted,
    legalSystem: country.legalSystem,
    legalSystemLabel: LEGAL_SYSTEM_LABELS[country.legalSystem],
    sectionHeading,
    sectionBody,
    keyPrinciples: principles,
    sources: getSources(country),
    lastVerified: getLastVerified(country),
  };
}

export function buildCompareNarrativeFacts(
  countryA: Country,
  countryB: Country,
  topic: CompareTopic,
  topicLabel: string
): CompareNarrativeFacts {
  const re = topicPrincipleRegex(topic);
  return {
    topicLabel,
    aName: countryA.name,
    bName: countryB.name,
    aSystem: countryA.legalSystem,
    bSystem: countryB.legalSystem,
    aSystemLabel: LEGAL_SYSTEM_LABELS[countryA.legalSystem],
    bSystemLabel: LEGAL_SYSTEM_LABELS[countryB.legalSystem],
    aTopicPrinciples: pickPrinciples(countryA, re).length,
    bTopicPrinciples: pickPrinciples(countryB, re).length,
    aVerified: getLastVerified(countryA),
    bVerified: getLastVerified(countryB),
  };
}
