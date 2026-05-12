import fs from "node:fs/promises";
import path from "node:path";

import type { Country } from "@/data/types";
import { embedQueryForRag } from "@/lib/query-embed";
import {
  getMeta,
  loadSnippetEmbeddingsFile,
  parseSnippetKey,
  rankKeysByEmbedding,
} from "@/lib/rag-embeddings";

export interface ConstitutionSnippet {
  id: string;
  title: string;
  excerpt: string;
  articleRef?: string;
  /** Lowercase tokens for retrieval; title words are also used if omitted */
  keywords?: string[];
}

const SNIPPETS_DIR = path.join(process.cwd(), "src/data/constitution-snippets");

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .split(/[^a-z0-9]+/u)
      .filter((w) => w.length > 2)
  );
}

export async function loadSnippetsForCountry(iso2: string): Promise<ConstitutionSnippet[]> {
  const code = iso2.toLowerCase();
  const filePath = path.join(SNIPPETS_DIR, `${code}.json`);
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((row): row is ConstitutionSnippet => {
      if (!row || typeof row !== "object") return false;
      const o = row as Record<string, unknown>;
      return typeof o.id === "string" && typeof o.title === "string" && typeof o.excerpt === "string";
    });
  } catch {
    return [];
  }
}

function snippetTokens(snippet: ConstitutionSnippet): Set<string> {
  const parts = [snippet.title, ...(snippet.keywords ?? []), snippet.articleRef ?? ""].join(" ");
  return tokenize(parts);
}

export function rankSnippetsForMessage(
  message: string,
  country: Country,
  snippets: ConstitutionSnippet[],
  topK: number
): ConstitutionSnippet[] {
  if (snippets.length === 0) return [];
  const msgTokens = tokenize(message);
  for (const p of country.constitution.keyPrinciples) {
    for (const w of tokenize(p)) {
      msgTokens.add(w);
    }
  }
  for (const w of tokenize(country.constitution.summary)) {
    msgTokens.add(w);
  }

  const scored = snippets.map((s) => {
    const st = snippetTokens(s);
    let score = 0;
    for (const t of msgTokens) {
      if (st.has(t)) score += 2;
    }
    const excerptTokens = tokenize(s.excerpt);
    for (const t of msgTokens) {
      if (excerptTokens.has(t)) score += 1;
    }
    if (s.articleRef) {
      for (const t of msgTokens) {
        if (s.articleRef.toLowerCase().includes(t)) score += 1;
      }
    }
    return { s, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const picked = scored.filter((x) => x.score > 0).slice(0, topK);
  if (picked.length > 0) return picked.map((x) => x.s);
  return scored.slice(0, topK).map((x) => x.s);
}

/** Rank snippets for the constitution comparison tool (no full Country context). Keyword fallback. */
export function rankSnippetsForTopicQuery(
  query: string,
  snippets: ConstitutionSnippet[],
  topK: number
): ConstitutionSnippet[] {
  if (snippets.length === 0) return [];
  const msgTokens = tokenize(query);
  const scored = snippets.map((s) => {
    const st = snippetTokens(s);
    let score = 0;
    for (const t of msgTokens) {
      if (st.has(t)) score += 2;
    }
    const excerptTokens = tokenize(s.excerpt);
    for (const t of msgTokens) {
      if (excerptTokens.has(t)) score += 1;
    }
    return { s, score };
  });
  scored.sort((a, b) => b.score - a.score);
  const picked = scored.filter((x) => x.score > 0).slice(0, topK);
  if (picked.length > 0) return picked.map((x) => x.s);
  return scored.slice(0, topK).map((x) => x.s);
}

/**
 * Embedding retrieval over `src/data/constitution-snippets-embeddings.json` (precomputed).
 * Falls back to `rankSnippetsForTopicQuery` when the embeddings file is missing or query embedding fails.
 */
export async function getRankedSnippetsByEmbedding(
  query: string,
  countryCode: string,
  snippets: ConstitutionSnippet[],
  k: number
): Promise<ConstitutionSnippet[]> {
  if (snippets.length === 0) return [];
  const file = await loadSnippetEmbeddingsFile();
  const meta = getMeta(file);
  if (!file || !meta) {
    return rankSnippetsForTopicQuery(query, snippets, k);
  }
  const qVec = await embedQueryForRag(query, meta);
  if (!qVec) {
    return rankSnippetsForTopicQuery(query, snippets, k);
  }
  const rankedKeys = rankKeysByEmbedding(qVec, file, countryCode, k);
  const byId = new Map(snippets.map((s) => [s.id, s]));
  const out: ConstitutionSnippet[] = [];
  for (const { key } of rankedKeys) {
    const id = parseSnippetKey(key, countryCode);
    if (!id) continue;
    const s = byId.get(id);
    if (s) out.push(s);
  }
  if (out.length > 0) return out;
  return rankSnippetsForTopicQuery(query, snippets, k);
}

export function formatSnippetsForPrompt(snippets: ConstitutionSnippet[]): string {
  if (snippets.length === 0) return "";
  const lines = snippets.map((s) => {
    const ref = s.articleRef ? ` (${s.articleRef})` : "";
    return `- **${s.title}** [snippet id: \`${s.id}\`]${ref}\n  ${s.excerpt}`;
  });
  return [
    "### Educational constitution snippets (internal reference only)",
    "These are short BasicLaw-authored summaries for orientation. They are **not** verbatim statutory text unless explicitly marked as such.",
    ...lines,
    "When you lean on a snippet in your answer, mention its **title** and **snippet id** in prose (no URL for snippets). For web links, use only authorized source URLs from the BasicLaw reference section.",
  ].join("\n\n");
}
