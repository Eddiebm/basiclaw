import type { EmbeddingsMeta } from "@/lib/rag-embeddings";

let xenovaPipe: ((text: string, opts: { pooling: string; normalize: boolean }) => Promise<{ data: Float32Array }>) | null =
  null;

/**
 * Embeds the user query for cosine retrieval against precomputed vectors.
 * Uses the same Xenova MiniLM model as `scripts/embed-snippets.mjs` when meta.provider is `xenova`.
 * If meta.provider is `openrouter` and OPENROUTER_API_KEY is set, uses OpenRouter embeddings instead.
 */
export async function embedQueryForRag(text: string, meta: EmbeddingsMeta | null): Promise<number[] | null> {
  const trimmed = text.trim();
  if (!trimmed || !meta) return null;

  if (meta.provider === "openrouter" && process.env.OPENROUTER_API_KEY) {
    const model = process.env.OPENROUTER_EMBEDDING_MODEL ?? "openai/text-embedding-3-small";
    try {
      const res = await fetch("https://openrouter.ai/api/v1/embeddings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://basiclaw.app",
          "X-Title": "BasicLaw",
        },
        body: JSON.stringify({ model, input: trimmed }),
      });
      if (!res.ok) return null;
      const data = (await res.json()) as { data?: Array<{ embedding: number[] }> };
      const emb = data.data?.[0]?.embedding;
      if (!emb || emb.length !== meta.dim) return null;
      return normalizeL2(emb);
    } catch {
      return null;
    }
  }

  try {
    const { pipeline } = await import("@xenova/transformers");
    if (!xenovaPipe) {
      const pipe = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
      xenovaPipe = pipe as (text: string, opts: { pooling: string; normalize: boolean }) => Promise<{ data: Float32Array }>;
    }
    const out = await xenovaPipe(trimmed, { pooling: "mean", normalize: true });
    const arr = Array.from(out.data);
    if (arr.length !== meta.dim) return null;
    return arr;
  } catch {
    return null;
  }
}

function normalizeL2(v: number[]): number[] {
  const n = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
  return v.map((x) => x / n);
}
