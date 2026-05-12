import { auth, clerkClient } from "@clerk/nextjs/server";
import { isAuthEnabled } from "@/lib/auth-config";

export type BillingPlan = "free" | "pro" | "pro_plus";

function planFromMetadata(publicMetadata: Record<string, unknown> | undefined | null): BillingPlan {
  const raw = publicMetadata?.plan;
  if (raw === "pro_plus" || raw === "pro+") return "pro_plus";
  if (raw === "pro") return "pro";
  return "free";
}

export async function getUserPlanForUserId(userId: string | null | undefined): Promise<BillingPlan> {
  if (!userId) return "free";
  if (!isAuthEnabled()) return "free";
  try {
    const c = await clerkClient();
    const user = await c.users.getUser(userId);
    return planFromMetadata(user.publicMetadata as Record<string, unknown>);
  } catch {
    return "free";
  }
}

export async function getAuthPlan(): Promise<{ userId: string | null; plan: BillingPlan }> {
  if (!isAuthEnabled()) return { userId: null, plan: "free" };
  let userId: string | null = null;
  try {
    const a = await auth();
    userId = a.userId ?? null;
  } catch {
    userId = null;
  }
  if (!userId) return { userId: null, plan: "free" };
  const plan = await getUserPlanForUserId(userId);
  return { userId, plan };
}
