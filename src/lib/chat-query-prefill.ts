/** Max length for chat URL seed params (`prefill`, `q`, `topic`). */
export const CHAT_QUERY_PREFILL_MAX_LEN = 4000;

/**
 * Normalise text from URL query params for chat prefill / auto-send.
 * Strips C0 control characters (keeps tab/newline), trims, and caps length.
 */
export function normalizeChatQueryPrefill(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  const stripped = raw.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
  const trimmed = stripped.trim();
  if (!trimmed) return null;
  return trimmed.length > CHAT_QUERY_PREFILL_MAX_LEN ? trimmed.slice(0, CHAT_QUERY_PREFILL_MAX_LEN) : trimmed;
}

/** First non-empty among `prefill`, `q`, and `topic` (in that order). */
export function readChatPrefillFromSearchParams(searchParams: URLSearchParams): string | null {
  const fromPrefill = normalizeChatQueryPrefill(searchParams.get("prefill"));
  if (fromPrefill) return fromPrefill;
  const fromQ = normalizeChatQueryPrefill(searchParams.get("q"));
  if (fromQ) return fromQ;
  return normalizeChatQueryPrefill(searchParams.get("topic"));
}
