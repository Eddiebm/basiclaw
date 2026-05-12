import { NextRequest, NextResponse } from "next/server";

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
  console.log(
    JSON.stringify({
      type: "embed_telemetry",
      event,
      referer: refererHeader,
      parentReferrer,
      ...rest,
    })
  );
  return NextResponse.json({ ok: true });
}
