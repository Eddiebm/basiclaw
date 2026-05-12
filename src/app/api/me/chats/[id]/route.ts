import { NextResponse } from "next/server";
import { isClerkEnabled } from "@/lib/auth-config";
import { deleteChatForUser, renameChatForUser, upsertChatMessages } from "@/lib/storage";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, ctx: Ctx) {
  if (!isClerkEnabled()) {
    return NextResponse.json({ ok: true });
  }
  const { id } = await ctx.params;
  await deleteChatForUser(null, id);
  return NextResponse.json({ error: "not_implemented" }, { status: 501 });
}

export async function PATCH(req: Request, ctx: Ctx) {
  if (!isClerkEnabled()) {
    return NextResponse.json({ ok: true });
  }
  const { id } = await ctx.params;
  const body = (await req.json()) as { title?: string };
  const title = typeof body.title === "string" ? body.title : "";
  await renameChatForUser(null, id, title);
  return NextResponse.json({ error: "not_implemented" }, { status: 501 });
}

export async function PUT(req: Request, ctx: Ctx) {
  if (!isClerkEnabled()) {
    return NextResponse.json({ ok: true });
  }
  const { id } = await ctx.params;
  const body = (await req.json()) as { jurisdiction: string; messages: { role: string; content: string }[] };
  await upsertChatMessages(null, id, body);
  return NextResponse.json({ error: "not_implemented" }, { status: 501 });
}
