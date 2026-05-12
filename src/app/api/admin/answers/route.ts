import { NextRequest, NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin-auth";
import { listPublicAnswersAdmin } from "@/lib/saved-answers";

export async function GET(request: NextRequest) {
  if (!(await isAdminUser())) {
    return new NextResponse(null, { status: 404 });
  }
  const sp = request.nextUrl.searchParams;
  const jurisdiction = sp.get("jurisdiction")?.trim().toLowerCase() || undefined;
  const verifiedRaw = sp.get("verified");
  const verified =
    verifiedRaw === "yes" || verifiedRaw === "no" ? verifiedRaw : ("all" as const);
  const minNetVotes = Math.max(0, Number.parseInt(sp.get("minVotes") ?? "0", 10) || 0);
  const sort = sp.get("sort") === "votes" ? "votes" : "recent";
  const page = Math.max(1, Number.parseInt(sp.get("page") ?? "1", 10) || 1);
  const pageSize = Math.min(100, Math.max(1, Number.parseInt(sp.get("pageSize") ?? "30", 10) || 30));

  const rows = await listPublicAnswersAdmin({
    jurisdiction,
    verified,
    minNetVotes,
    page,
    pageSize,
    sort,
  });

  return NextResponse.json({
    answers: rows.map((a) => ({
      id: a.id,
      question: a.question,
      answer: a.answer.slice(0, 4000),
      jurisdiction: a.jurisdiction,
      locale: a.locale,
      isPublic: a.isPublic,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
      upvotes: a.upvotes,
      downvotes: a.downvotes,
      verifiedBy: a.verifiedBy ?? null,
      verificationNote: a.verificationNote ?? null,
      userId: a.userId ?? null,
    })),
  });
}
