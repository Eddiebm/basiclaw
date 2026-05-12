export type EmbedTelemetryEvent =
  | "embed_loaded"
  | "embed_question_asked"
  | "embed_audit_run"
  | "embed_answer_received"
  | "embed_link_clicked";

export function sendEmbedTelemetry(
  event: EmbedTelemetryEvent,
  properties?: Record<string, string | number | boolean | null | undefined>
): void {
  if (typeof window === "undefined") return;
  const payload = {
    event,
    referrer: document.referrer || "",
    ...properties,
  };
  void fetch("/api/embed/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {
    /* non-fatal */
  });
}
