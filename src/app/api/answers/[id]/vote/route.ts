import { NextRequest, NextResponse } from "next/server";
import { checkAnswerVoteRateLimit } from "@/lib/answer-vote-rate-limit";
import { getCurrentUserId } from "@/lib/auth-config";
import { clientIp, hashIpForUsage } from "@/lib/request-ip";
import { voteAnswer } from "@/lib/saved-answers";

export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const userId = await getCurrentUserId();
  const ip = clientIp(request);
  const actorKey = userId ? `u:${userId}` : `ip:${hashIpForUsage(ip)}`;

  const rl = await checkAnswerVoteRateLimit(actorKey);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many votes — try again later." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const direction = body?.direction as string | undefined;
  if (direction !== "up" && direction !== "down") {
    return NextResponse.json({ error: 'direction must be "up" or "down"' }, { status: 400 });
  }

  const row = await voteAnswer(id, direction, actorKey);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    id: row.id,
    upvotes: row.upvotes,
    downvotes: row.downvotes,
  });
}
