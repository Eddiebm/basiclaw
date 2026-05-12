import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { isClerkEnabled } from "@/lib/auth-config";
import { stripPIIForPublish } from "@/lib/answer-pii";
import { embedQueryForRag } from "@/lib/query-embed";
import { getMeta, loadSnippetEmbeddingsFile } from "@/lib/rag-embeddings";
import { getAnswer, togglePublic } from "@/lib/saved-answers";

export async function POST(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!isClerkEnabled()) {
    return NextResponse.json({ error: "Auth not configured" }, { status: 401 });
  }
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const cur = await getAnswer(id);
  if (!cur || cur.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let embedding: number[] | null = null;
  if (!cur.isPublic) {
    const snippetEmbFile = await loadSnippetEmbeddingsFile();
    const embMeta = getMeta(snippetEmbFile) ?? { dim: 384, model: "Xenova/all-MiniLM-L6-v2", provider: "xenova" as const };
    const q = stripPIIForPublish(cur.question);
    embedding = await embedQueryForRag(q, embMeta);
  }

  const next = await togglePublic(id, userId, embedding);
  if (!next) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ id: next.id, isPublic: next.isPublic });
}
