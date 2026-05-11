import type { Country } from "@/data/types";

export const COMPARE_TOPICS = ["rights", "government-structure", "judiciary", "amendment-process"] as const;
export type CompareTopic = (typeof COMPARE_TOPICS)[number];

export function isCompareTopic(value: string | undefined): value is CompareTopic {
  return !!value && (COMPARE_TOPICS as readonly string[]).includes(value);
}

function pickPrinciples(country: Country, re: RegExp): string[] {
  return country.constitution.keyPrinciples.filter((p) => re.test(p));
}

export interface ComparePanel {
  headline: string;
  excerpt: string;
  bullets: string[];
}

export function getComparePanel(country: Country, topic: CompareTopic): ComparePanel {
  const c = country.constitution;
  const summary = c.summary;

  switch (topic) {
    case "rights": {
      const matched = pickPrinciples(
        country,
        /\b(right|rights|freedom|freedoms|equality|equal|human|dignity|citizen|privacy|speech|religion|life|liberty)\b/i
      ).slice(0, 8);
      const bullets = matched.length > 0 ? matched : c.keyPrinciples.slice(0, 6);
      return {
        headline: "Rights & freedoms",
        excerpt: summary,
        bullets: bullets.length > 0 ? bullets : [summary.slice(0, 220) + (summary.length > 220 ? "…" : "")],
      };
    }
    case "government-structure": {
      const bullets = pickPrinciples(
        country,
        /\b(parliament|congress|president|prime|minister|assembly|chamber|senate|house|executive|legislature|federal|devolution|monarchy|republic|separation)\b/i
      ).slice(0, 8);
      return {
        headline: "Government structure",
        excerpt: `${c.title} (${c.yearAdopted}) frames how power is organised in ${country.name}.`,
        bullets: bullets.length > 0 ? bullets : c.keyPrinciples.slice(0, 5),
      };
    }
    case "judiciary": {
      const bullets = pickPrinciples(
        country,
        /\b(court|judges|judicial|justice|tribunal|constitutional|supreme|appeal|magistrate)\b/i
      ).slice(0, 8);
      return {
        headline: "Judiciary & review",
        excerpt: `How ${country.name} structures courts and constitutional review is usually spelled out alongside separation-of-powers rules in ${c.title}.`,
        bullets: bullets.length > 0 ? bullets : c.keyPrinciples.slice(0, 5),
      };
    }
    case "amendment-process": {
      const bullets = [
        `Adopted: ${c.yearAdopted}${c.yearLatestAmendment && c.yearLatestAmendment !== c.yearAdopted ? ` · Last amendment noted: ${c.yearLatestAmendment}` : ""}`,
        ...pickPrinciples(country, /\b(amend|referendum|referenda|revision|constituent|two-thirds|supermajority|plebiscite)\b/i).slice(0, 6),
      ].filter(Boolean);
      return {
        headline: "Amendment & change",
        excerpt: `Constitutions are living documents. ${country.name}'s text describes how formal change happens — and politics fills in the rest.`,
        bullets: bullets.length > 1 ? bullets : c.keyPrinciples.slice(0, 5),
      };
    }
  }
}
