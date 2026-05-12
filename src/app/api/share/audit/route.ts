import { NextResponse } from "next/server";
import { verifySharedAuditToken } from "@/lib/shared-audit-url";
import { getAuditForUser } from "@/lib/storage";

export const runtime = "nodejs";

/**
 * Public, token-gated read for a saved audit (HMAC link from dashboard).
 * Does not require a browser session — the token carries capability.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("t")?.trim();
  if (!token) {
    return NextResponse.json({ error: "missing_token" }, { status: 400 });
  }
  const parsed = verifySharedAuditToken(token);
  if (!parsed) {
    return NextResponse.json({ error: "invalid_token" }, { status: 400 });
  }
  const audit = await getAuditForUser(parsed.userId, parsed.auditId);
  if (!audit) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ report: audit.report });
}
