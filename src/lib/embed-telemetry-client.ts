export type EmbedTelemetryEvent =
  | "embed_loaded"
  | "embed_question_asked"
  | "embed_audit_run"
  | "embed_answer_received"
  | "embed_link_clicked";

export type EmbedTelemetryOpts = {
  /** HMAC-signed tenant token from the server; sent as `Authorization` for authoritative attribution. */
  authToken?: string | null;
};

export function sendEmbedTelemetry(
  event: EmbedTelemetryEvent,
  properties?: Record<string, string | number | boolean | null | undefined>,
  opts?: EmbedTelemetryOpts
): void {
  if (typeof window === "undefined") return;
  const payload = {
    event,
    referrer: document.referrer || "",
    ...properties,
  };
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const tok = opts?.authToken?.trim();
  if (tok) headers.Authorization = `Bearer ${tok}`;
  void fetch("/api/embed/event", {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {
    /* non-fatal */
  });
}
