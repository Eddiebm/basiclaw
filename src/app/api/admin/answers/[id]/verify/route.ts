import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { isAdminUser } from "@/lib/admin-auth";
import { capturePosthogServer } from "@/lib/server-posthog";
import { verifyAnswer } from "@/lib/saved-answers";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, ctx: RouteParams) {
  if (!(await isAdminUser())) {
    return new NextResponse(null, { status: 404 });
  }
  const { id } = await ctx.params;
  let body: { lawyerId?: string; statement?: string };
  try {
    body = (await request.json()) as { lawyerId?: string; statement?: string };
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const lawyerId = typeof body.lawyerId === "string" ? body.lawyerId.trim() : "";
  if (!lawyerId) {
    return NextResponse.json({ error: "lawyerId_required" }, { status: 400 });
  }
  const statement = typeof body.statement === "string" ? body.statement : undefined;
  const row = await verifyAnswer(id, lawyerId, statement);
  if (!row) {
    return new NextResponse(null, { status: 404 });
  }
  const { userId } = await auth();
  await capturePosthogServer("admin_answer_verified", userId ?? "admin", {
    answer_id: id,
    lawyer_id: lawyerId,
    jurisdiction: row.jurisdiction,
  });
  return NextResponse.json({
    ok: true,
    answer: { id: row.id, verifiedBy: row.verifiedBy, verificationNote: row.verificationNote },
  });
}
