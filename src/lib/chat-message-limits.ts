/**
 * Maximum UTF-16 length for a single user chat message (POST `/api/chat` `message` field).
 * Keeps prompts within model/provider limits and below typical platform request caps.
 */
export const CHAT_USER_MESSAGE_MAX_CHARS = 24_000;

/** Map server `code` / status to a user-visible explanation for chat send failures. */
export function describeChatSendFailure(status: number, body: Record<string, unknown> | null): string {
  const code = typeof body?.code === "string" ? body.code : "";
  const serverMessage = typeof body?.message === "string" ? body.message.trim() : "";
  const err = typeof body?.error === "string" ? body.error.trim() : "";

  if (code === "payload_too_large" || status === 413) {
    return "That message is too long for the assistant. Shorten it and try again.";
  }
  if (code === "rate_limited" || code === "quota_exceeded" || err === "quota_exceeded") {
    return serverMessage || "Usage limit reached. See pricing to upgrade.";
  }
  if (code === "embed_forbidden" || code === "embed_unauthorized") {
    return serverMessage || err || "This request is not allowed.";
  }
  if (code === "llm_failed") {
    return serverMessage || "The AI service failed to respond. Please try again in a moment.";
  }
  if (code === "validation_error" || code === "invalid_body") {
    return serverMessage || err || "The message could not be sent.";
  }
  if (code === "internal_error" || status >= 500) {
    return "Something went wrong on our side. Please try again shortly.";
  }
  if (serverMessage) return serverMessage;
  if (err) return err;
  if (status === 401 || status === 403) {
    return "You do not have permission to send this message.";
  }
  return `Could not send message (HTTP ${status}).`;
}
