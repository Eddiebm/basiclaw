import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isClerkEnabled } from "@/lib/auth-config";
import { buildSharedAuditHref, createSharedAuditToken } from "@/lib/shared-audit-url";
import { listAuditsForUser } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isClerkEnabled()) {
    return NextResponse.json({ error: "auth_disabled" }, { status: 503 });
  }
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const url = new URL(request.url);
  const locale = url.searchParams.get("locale") || "en";
  const audits = await listAuditsForUser(userId);
  const auditsOut = audits.map((a) => ({
    id: a.id,
    title: a.title,
    auditType: a.auditType,
    jurisdiction: a.jurisdiction,
    updatedAt: a.updatedAt,
    shareHref: buildSharedAuditHref(locale, createSharedAuditToken(userId, a.id)),
  }));
  return NextResponse.json({ audits: auditsOut });
}
