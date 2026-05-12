import { NextRequest, NextResponse } from "next/server";
import { embedQueryForRag } from "@/lib/query-embed";
import { getMeta, loadSnippetEmbeddingsFile } from "@/lib/rag-embeddings";
import { listPublicAnswersResolved, searchPublicAnswersSemantic } from "@/lib/saved-answers";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const q = sp.get("q")?.trim() ?? "";
  const country = sp.get("country")?.trim().toLowerCase() || undefined;
  const page = Math.max(1, Number.parseInt(sp.get("page") || "1", 10) || 1);

  const snippetEmbFile = await loadSnippetEmbeddingsFile();
  const embMeta = getMeta(snippetEmbFile) ?? { dim: 384, model: "Xenova/all-MiniLM-L6-v2", provider: "xenova" as const };

  if (q) {
    const queryEmbedding = await embedQueryForRag(q, embMeta);
    const hits = await searchPublicAnswersSemantic(queryEmbedding, country, 10);
    return NextResponse.json({
      page,
      results: hits.map((h) => ({
        id: h.record.id,
        question: h.record.question,
        snippet: h.snippet,
        score: h.score,
        jurisdiction: h.record.jurisdiction,
        upvotes: h.record.upvotes,
      })),
    });
  }

  const list = await listPublicAnswersResolved({
    jurisdiction: country,
    page,
    pageSize: 10,
    sort: "recent",
  });
  return NextResponse.json({
    page,
    results: list.map((r) => ({
      id: r.id,
      question: r.question,
      snippet: r.answer.slice(0, 220).replace(/\s+/g, " ").trim(),
      score: 0,
      jurisdiction: r.jurisdiction,
      upvotes: r.upvotes,
    })),
  });
}
