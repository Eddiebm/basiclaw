import { NextResponse } from "next/server";
import { isClerkEnabled } from "@/lib/auth-config";
import { deleteAuditForUser } from "@/lib/storage";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, ctx: Ctx) {
  if (!isClerkEnabled()) {
    return NextResponse.json({ ok: true });
  }
  const { id } = await ctx.params;
  await deleteAuditForUser(null, id);
  return NextResponse.json({ error: "not_implemented" }, { status: 501 });
}
