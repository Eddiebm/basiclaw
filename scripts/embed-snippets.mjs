/**
 * Precomputes embedding vectors for constitution snippets and landmark cases.
 * Default: local Xenova MiniLM (no API spend). Optional: set USE_OPENROUTER_EMBEDDINGS=1
 * and OPENROUTER_API_KEY + OPENROUTER_EMBEDDING_MODEL for OpenRouter embeddings.
 *
 * Usage: node scripts/embed-snippets.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const SNIPPETS_DIR = path.join(root, "src/data/constitution-snippets");
const CASES_DIR = path.join(root, "src/data/landmark-cases");
const OUT_SNIPPETS = path.join(root, "src/data/constitution-snippets-embeddings.json");
const OUT_CASES = path.join(root, "src/data/landmark-cases-embeddings.json");

const USE_OPENROUTER = process.env.USE_OPENROUTER_EMBEDDINGS === "1";

async function embedOpenRouter(text) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY required when USE_OPENROUTER_EMBEDDINGS=1");
  const model = process.env.OPENROUTER_EMBEDDING_MODEL ?? "openai/text-embedding-3-small";
  const res = await fetch("https://openrouter.ai/api/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://basiclaw.app",
      "X-Title": "BasicLaw embed script",
    },
    body: JSON.stringify({ model, input: text }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`OpenRouter embeddings failed: ${res.status} ${t}`);
  }
  const data = await res.json();
  const emb = data?.data?.[0]?.embedding;
  if (!Array.isArray(emb)) throw new Error("No embedding in OpenRouter response");
  return { vec: emb, dim: emb.length, model, provider: "openrouter" };
}

async function embedXenova(text, pipelineFactory) {
  const out = await pipelineFactory(text, { pooling: "mean", normalize: true });
  const vec = Array.from(out.data);
  return { vec, dim: vec.length, model: "Xenova/all-MiniLM-L6-v2", provider: "xenova" };
}

async function main() {
  let pipelineFactory = null;

  if (!USE_OPENROUTER) {
    const { pipeline } = await import("@xenova/transformers");
    pipelineFactory = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }

  async function embedOne(text) {
    if (USE_OPENROUTER) {
      return embedOpenRouter(text);
    }
    return embedXenova(text, pipelineFactory);
  }

  const snippetOut = { __meta: null, entries: [] };
  const caseOut = { __meta: null, entries: [] };

  const snippetFiles = (await fs.readdir(SNIPPETS_DIR)).filter((f) => f.endsWith(".json"));
  for (const file of snippetFiles) {
    const code = file.replace(/\.json$/i, "").toLowerCase();
    const raw = await fs.readFile(path.join(SNIPPETS_DIR, file), "utf-8");
    const rows = JSON.parse(raw);
    if (!Array.isArray(rows)) continue;
    for (const row of rows) {
      if (!row?.id || !row?.title || !row?.excerpt) continue;
      const text = [row.title, row.excerpt, ...(row.keywords || [])].join("\n");
      const { vec, dim, model, provider } = await embedOne(text);
      if (!snippetOut.__meta) snippetOut.__meta = { dim, model, provider };
      if (snippetOut.__meta.dim !== dim || snippetOut.__meta.provider !== provider) {
        throw new Error(`Dimension/provider mismatch for snippet ${row.id}`);
      }
      snippetOut.entries.push({ key: `${code}:${row.id}`, vec });
    }
  }

  let caseFiles = [];
  try {
    caseFiles = (await fs.readdir(CASES_DIR)).filter((f) => f.endsWith(".json"));
  } catch {
    caseFiles = [];
  }
  for (const file of caseFiles) {
    const code = file.replace(/\.json$/i, "").toLowerCase();
    const raw = await fs.readFile(path.join(CASES_DIR, file), "utf-8");
    const rows = JSON.parse(raw);
    if (!Array.isArray(rows)) continue;
    for (const row of rows) {
      if (!row?.id || !row?.title || !row?.summary || !row?.principle) continue;
      const text = [row.title, String(row.year), row.summary, row.principle].join("\n");
      const { vec, dim, model, provider } = await embedOne(text);
      if (!caseOut.__meta) caseOut.__meta = { dim, model, provider };
      if (caseOut.__meta.dim !== dim || caseOut.__meta.provider !== provider) {
        throw new Error(`Dimension/provider mismatch for case ${row.id}`);
      }
      caseOut.entries.push({ key: `${code}:${row.id}`, vec });
    }
  }

  if (snippetOut.__meta && (!caseOut.__meta || caseOut.entries.length === 0)) {
    caseOut.__meta = { ...snippetOut.__meta };
  }
  if (caseOut.__meta && !snippetOut.__meta && snippetOut.entries.length === 0) {
    snippetOut.__meta = { ...caseOut.__meta };
  }

  function flatten(entries, meta) {
    const o = { __meta: meta };
    for (const { key, vec } of entries) o[key] = vec;
    return o;
  }

  if (!snippetOut.__meta) {
    console.warn("No snippet embeddings produced (missing snippet JSON files?)");
    await fs.writeFile(OUT_SNIPPETS, JSON.stringify({ __meta: null }), "utf-8");
  } else {
    await fs.writeFile(OUT_SNIPPETS, JSON.stringify(flatten(snippetOut.entries, snippetOut.__meta)), "utf-8");
  }

  const caseMeta = caseOut.__meta || snippetOut.__meta || { dim: 384, model: "Xenova/all-MiniLM-L6-v2", provider: "xenova" };
  await fs.writeFile(OUT_CASES, JSON.stringify(flatten(caseOut.entries, caseMeta)), "utf-8");

  console.log(
    `Wrote ${snippetOut.entries.length} snippet vectors and ${caseOut.entries.length} case vectors → ${OUT_SNIPPETS}, ${OUT_CASES}`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
