import { NextResponse } from "next/server";
import { isClerkEnabled } from "@/lib/auth-config";
import { getDashboardUsageBundle } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET() {
  if (!isClerkEnabled()) {
    const snap = await getDashboardUsageBundle(null);
    return NextResponse.json(snap);
  }
  return NextResponse.json({ error: "not_implemented" }, { status: 501 });
}
