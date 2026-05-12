import fs from "node:fs/promises";
import path from "node:path";

import {
  getMeta,
  loadCaseEmbeddingsFile,
  parseCaseKey,
  rankKeysByEmbedding,
} from "@/lib/rag-embeddings";
import { embedQueryForRag } from "@/lib/query-embed";

const CASES_DIR = path.join(process.cwd(), "src/data/landmark-cases");

export interface LandmarkCase {
  id: string;
  title: string;
  year: number;
  summary: string;
  principle: string;
  sourceUrl: string;
}

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .split(/[^a-z0-9]+/u)
      .filter((w) => w.length > 2)
  );
}

export async function loadLandmarkCasesForCountry(iso2: string): Promise<LandmarkCase[]> {
  const code = iso2.toLowerCase();
  const filePath = path.join(CASES_DIR, `${code}.json`);
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((row): row is LandmarkCase => {
      if (!row || typeof row !== "object") return false;
      const o = row as Record<string, unknown>;
      return (
        typeof o.id === "string" &&
        typeof o.title === "string" &&
        typeof o.year === "number" &&
        typeof o.summary === "string" &&
        typeof o.principle === "string" &&
        typeof o.sourceUrl === "string"
      );
    });
  } catch {
    return [];
  }
}

export function rankLandmarkCasesKeyword(query: string, cases: LandmarkCase[], topK: number): LandmarkCase[] {
  if (cases.length === 0) return [];
  const q = tokenize(query);
  const scored = cases.map((c) => {
    const blob = `${c.title} ${c.summary} ${c.principle}`;
    const t = tokenize(blob);
    let score = 0;
    for (const w of q) {
      if (t.has(w)) score += 1;
    }
    return { c, score };
  });
  scored.sort((a, b) => b.score - a.score);
  const picked = scored.filter((x) => x.score > 0).slice(0, topK);
  if (picked.length > 0) return picked.map((x) => x.c);
  return scored.slice(0, topK).map((x) => x.c);
}

export async function getRankedLandmarkCasesByEmbedding(
  query: string,
  countryCode: string,
  cases: LandmarkCase[],
  k: number
): Promise<LandmarkCase[]> {
  if (cases.length === 0) return [];
  const file = await loadCaseEmbeddingsFile();
  const meta = getMeta(file);
  if (!file || !meta) {
    return rankLandmarkCasesKeyword(query, cases, k);
  }
  const qVec = await embedQueryForRag(query, meta);
  if (!qVec) {
    return rankLandmarkCasesKeyword(query, cases, k);
  }
  const rankedKeys = rankKeysByEmbedding(qVec, file, countryCode, k);
  const byId = new Map(cases.map((c) => [c.id, c]));
  const out: LandmarkCase[] = [];
  for (const { key } of rankedKeys) {
    const id = parseCaseKey(key, countryCode);
    if (!id) continue;
    const c = byId.get(id);
    if (c) out.push(c);
  }
  if (out.length > 0) return out;
  return rankLandmarkCasesKeyword(query, cases, k);
}

export function formatLandmarkCasesForPrompt(cases: LandmarkCase[]): string {
  if (cases.length === 0) return "";
  const lines = cases.map((c) => {
    return `- **${c.title}** (${c.year}) [case id: \`${c.id}\`]\n  Principle: ${c.principle}\n  Summary: ${c.summary}\n  Source: ${c.sourceUrl}`;
  });
  return [
    "### Landmark cases (educational summaries with authoritative links)",
    "These are widely cited decisions or summaries linked to neutral sources (often court or encyclopedia URLs). When you rely on a case, cite its **title** and **case id** in prose and include a markdown link using **only** the Source URL shown below.",
    ...lines,
  ].join("\n\n");
}
