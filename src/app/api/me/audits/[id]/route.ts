import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isClerkEnabled } from "@/lib/auth-config";
import { deleteAuditForUser } from "@/lib/storage";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, ctx: Ctx) {
  if (!isClerkEnabled()) {
    return NextResponse.json({ error: "auth_disabled" }, { status: 503 });
  }
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  await deleteAuditForUser(userId, id);
  return NextResponse.json({ ok: true });
}
