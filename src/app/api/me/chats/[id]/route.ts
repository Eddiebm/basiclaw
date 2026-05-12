import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isClerkEnabled } from "@/lib/auth-config";
import { deleteChatForUser, getChatForUser, renameChatForUser, saveChatForUser } from "@/lib/storage";
import type { StoredChat } from "@/lib/storage";

export const runtime = "nodejs";

function titleFromMessages(messages: Array<{ role: string; content: string }>, fallback: string): string {
  const first = messages.find((m) => m.role === "user");
  if (!first?.content?.trim()) return fallback;
  const t = first.content.trim().replace(/\s+/g, " ");
  return t.length > 80 ? `${t.slice(0, 77)}…` : t;
}

export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!isClerkEnabled()) {
    return NextResponse.json({ error: "auth_disabled" }, { status: 503 });
  }
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const chat = await getChatForUser(userId, id);
  if (!chat) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ chat });
}

export async function PUT(request: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!isClerkEnabled()) {
    return NextResponse.json({ error: "auth_disabled" }, { status: 503 });
  }
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  let body: { messages?: Array<{ role: string; content: string }>; jurisdiction?: string; title?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const jurisdiction = (body.jurisdiction ?? "us").toLowerCase();
  const title = body.title?.trim() || titleFromMessages(messages, `Chat ${id.slice(0, 8)}`);
  const chat: StoredChat = {
    id,
    userId,
    sessionId: id,
    jurisdiction,
    title,
    messages,
    updatedAt: new Date().toISOString(),
  };
  await saveChatForUser(chat);
  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!isClerkEnabled()) {
    return NextResponse.json({ error: "auth_disabled" }, { status: 503 });
  }
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  let body: { title?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const title = body.title?.trim();
  if (!title) {
    return NextResponse.json({ error: "title_required" }, { status: 400 });
  }
  await renameChatForUser(userId, id, title);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!isClerkEnabled()) {
    return NextResponse.json({ error: "auth_disabled" }, { status: 503 });
  }
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  await deleteChatForUser(userId, id);
  return NextResponse.json({ ok: true });
}
