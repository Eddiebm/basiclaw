/**
 * Rebuilds `answers:embeddings:public` (Redis) or `embeddingsPublic` in tmp/basiclaw-answers.json (file fallback).
 * Uses the same Xenova MiniLM model as RAG / semantic cache.
 *
 * Usage: npm run embed:answers
 */
import { pipeline } from "@xenova/transformers";
import { rebuildPublicEmbeddingsIndex } from "../src/lib/saved-answers";

async function main() {
  const pipe = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  const { count } = await rebuildPublicEmbeddingsIndex(async (text: string) => {
    const out = await pipe(text, { pooling: "mean", normalize: true });
    return Array.from(out.data) as number[];
  });
  console.log(`embed:answers — indexed ${count} public question(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
