import fs from "node:fs/promises";
import path from "node:path";

export type EmbeddingsMeta = {
  dim: number;
  model: string;
  provider: "xenova" | "openrouter";
};

export type EmbeddingsFile = { __meta?: EmbeddingsMeta } & Record<string, number[]>;

const SNIPPET_EMB_PATH = path.join(process.cwd(), "src/data/constitution-snippets-embeddings.json");
const CASE_EMB_PATH = path.join(process.cwd(), "src/data/landmark-cases-embeddings.json");

let snippetFileCache: EmbeddingsFile | null | undefined;
let caseFileCache: EmbeddingsFile | null | undefined;

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) dot += a[i] * b[i];
  return dot;
}

export async function loadSnippetEmbeddingsFile(): Promise<EmbeddingsFile | null> {
  if (snippetFileCache !== undefined) return snippetFileCache;
  try {
    const raw = await fs.readFile(SNIPPET_EMB_PATH, "utf-8");
    const parsed = JSON.parse(raw) as EmbeddingsFile;
    snippetFileCache = parsed;
    return parsed;
  } catch {
    snippetFileCache = null;
    return null;
  }
}

export async function loadCaseEmbeddingsFile(): Promise<EmbeddingsFile | null> {
  if (caseFileCache !== undefined) return caseFileCache;
  try {
    const raw = await fs.readFile(CASE_EMB_PATH, "utf-8");
    const parsed = JSON.parse(raw) as EmbeddingsFile;
    caseFileCache = parsed;
    return parsed;
  } catch {
    caseFileCache = null;
    return null;
  }
}

export function getMeta(file: EmbeddingsFile | null): EmbeddingsMeta | null {
  if (!file?.__meta?.dim || !file.__meta.model) return null;
  return file.__meta;
}

/** Keys like `us:snippet-id` for the given country (lowercase ISO2). */
export function filterEmbeddingKeysForCountry(file: EmbeddingsFile, countryCode: string): string[] {
  const p = `${countryCode.toLowerCase()}:`;
  return Object.keys(file).filter((k) => k !== "__meta" && k.startsWith(p));
}

export function parseSnippetKey(key: string, countryCode: string): string | null {
  const p = `${countryCode.toLowerCase()}:`;
  if (!key.startsWith(p)) return null;
  return key.slice(p.length);
}

export function parseCaseKey(key: string, countryCode: string): string | null {
  const p = `${countryCode.toLowerCase()}:`;
  if (!key.startsWith(p)) return null;
  return key.slice(p.length);
}

export function rankKeysByEmbedding(
  queryVec: number[],
  file: EmbeddingsFile,
  countryCode: string,
  topK: number
): { key: string; score: number }[] {
  const keys = filterEmbeddingKeysForCountry(file, countryCode);
  const scored: { key: string; score: number }[] = [];
  for (const key of keys) {
    const vec = file[key];
    if (!Array.isArray(vec) || vec.length !== queryVec.length) continue;
    scored.push({ key, score: cosineSimilarity(queryVec, vec) });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}
