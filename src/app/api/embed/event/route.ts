import { NextRequest, NextResponse } from "next/server";
import { verifyEmbedEventToken } from "@/lib/embed-event-token";

const ALLOWED = new Set([
  "embed_loaded",
  "embed_question_asked",
  "embed_audit_run",
  "embed_answer_received",
  "embed_link_clicked",
]);

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const event = typeof body.event === "string" ? body.event : "";
  if (!ALLOWED.has(event)) {
    return NextResponse.json({ error: "invalid_event" }, { status: 400 });
  }
  const refererHeader = request.headers.get("referer") ?? "";
  const parentReferrer = typeof body.referrer === "string" ? body.referrer : "";
  const rest = { ...body };
  delete rest.event;
  delete rest.referrer;

  const auth = request.headers.get("authorization");
  const bearer = auth?.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
  const signedTenantId = bearer ? verifyEmbedEventToken(bearer) : null;

  console.log(
    JSON.stringify({
      type: "embed_telemetry",
      event,
      referer: refererHeader,
      parentReferrer,
      signedTenantId,
      ...rest,
    })
  );
  return NextResponse.json({ ok: true });
}
