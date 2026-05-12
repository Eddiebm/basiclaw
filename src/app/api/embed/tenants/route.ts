import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin-auth";
import { createEmbedTenant, listEmbedTenantsPublic } from "@/lib/embed-tenants";
import { issueEmbedEventToken } from "@/lib/embed-event-token";

export const runtime = "nodejs";

export async function GET() {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: "forbidden" }, { status: 404 });
  }
  const tenants = await listEmbedTenantsPublic();
  return NextResponse.json({ tenants });
}

export async function POST(request: Request) {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: "forbidden" }, { status: 404 });
  }
  let body: { label?: string; allowedOrigins?: unknown; plan?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const label = typeof body.label === "string" ? body.label : "Embed tenant";
  const plan = body.plan === "pro" ? "pro" : "free";
  const allowedOrigins = Array.isArray(body.allowedOrigins)
    ? body.allowedOrigins.filter((o): o is string => typeof o === "string")
    : [];

  const { tenant, apiKey } = await createEmbedTenant({ label, allowedOrigins, plan });
  const { apiKeyHash, ...tenantOut } = tenant;
  void apiKeyHash;
  const embedEventToken = issueEmbedEventToken(tenant.id);
  return NextResponse.json({
    tenant: tenantOut,
    apiKey,
    embedEventToken,
  });
}
