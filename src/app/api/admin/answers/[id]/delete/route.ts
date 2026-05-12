import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { isAdminUser } from "@/lib/admin-auth";
import { capturePosthogServer } from "@/lib/server-posthog";
import { adminDeleteAnswer } from "@/lib/saved-answers";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_request: Request, ctx: RouteParams) {
  if (!(await isAdminUser())) {
    return new NextResponse(null, { status: 404 });
  }
  const { id } = await ctx.params;
  const ok = await adminDeleteAnswer(id);
  if (!ok) {
    return new NextResponse(null, { status: 404 });
  }
  const { userId } = await auth();
  await capturePosthogServer("admin_answer_deleted", userId ?? "admin", { answer_id: id });
  return NextResponse.json({ ok: true });
}
