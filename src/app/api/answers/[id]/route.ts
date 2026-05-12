import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { isClerkEnabled } from "@/lib/auth-config";
import { deleteAnswer } from "@/lib/saved-answers";

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!isClerkEnabled()) {
    return NextResponse.json({ error: "Auth not configured" }, { status: 401 });
  }
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const ok = await deleteAnswer(id, userId);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
