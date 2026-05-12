import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isClerkEnabled } from "@/lib/auth-config";
import { getUserPlanForUserId } from "@/lib/entitlements";
import { limitsForPlan } from "@/lib/limits";
import { clientIp, hashIpForUsage } from "@/lib/request-ip";
import { getUsage } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isClerkEnabled()) {
    return NextResponse.json({ error: "auth_disabled" }, { status: 503 });
  }
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const ipHash = hashIpForUsage(clientIp(request));
  const [plan, usage] = await Promise.all([getUserPlanForUserId(userId), getUsage(userId, ipHash)]);
  const L = limitsForPlan(plan);
  return NextResponse.json({
    plan,
    usage,
    limits: {
      chatsPerDay: L.chatsPerDay,
      auditsPerMonth: L.auditsPerMonth,
      demandLettersPerDay: L.demandLettersPerDay,
    },
  });
}
