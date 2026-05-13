import { generateText } from "ai";
import { createGateway, type GatewayModelId } from "@ai-sdk/gateway";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

/** OpenRouter-style ids often use `:free`; strip suffixes not accepted by AI Gateway. */
function normalizeForGateway(model: string): string {
  return model.replace(/:free$/i, "").replace(/:paid$/i, "").trim() || "openai/gpt-oss-20b";
}

async function openRouterChat(params: {
  messages: ChatMessage[];
  model: string;
  maxTokens: number;
  temperature: number;
  apiKey: string;
  httpReferer?: string;
  xTitle?: string;
}): Promise<string> {
  const referer = params.httpReferer ?? (process.env.NEXT_PUBLIC_SITE_URL || "https://basiclaw.app");
  const title = params.xTitle ?? "BasicLaw - Legal Information Assistant";
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": referer,
      "X-Title": title,
    },
    body: JSON.stringify({
      model: params.model,
      messages: params.messages,
      max_tokens: params.maxTokens,
      temperature: params.temperature,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`openrouter_http_${res.status}:${err.slice(0, 200)}`);
  }
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string }; text?: string }>;
  };
  return (
    data.choices?.[0]?.message?.content ||
    data.choices?.[0]?.text ||
    "I apologise, but I couldn't generate a response. Please try again."
  );
}

/**
 * Prefer Vercel AI Gateway when `AI_GATEWAY_API_KEY` is set; otherwise fall back to direct OpenRouter.
 */
export async function generateChatCompletionText(opts: {
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
  /** Overrides OPENROUTER_MODEL / audit-specific env */
  model?: string;
  /**
   * When AI Gateway is inactive, used for direct OpenRouter auth instead of OPENROUTER_API_KEY
   * (e.g. BUILD_LLM_KEY at build time). Ignored when AI_GATEWAY_API_KEY is set.
   */
  openRouterApiKey?: string;
  /** Optional OpenRouter HTTP-Referer header (direct OpenRouter path only). */
  openRouterHttpReferer?: string;
  /** Optional OpenRouter X-Title header (direct OpenRouter path only). */
  openRouterTitle?: string;
}): Promise<{ text: string; provider: "ai_gateway" | "openrouter" }> {
  const maxTokens = opts.maxTokens ?? 1500;
  const temperature = opts.temperature ?? 0.5;
  const model =
    opts.model ?? process.env.OPENROUTER_MODEL ?? process.env.OPENROUTER_AUDIT_MODEL ?? "openai/gpt-oss-20b:free";

  const gatewayKey = process.env.AI_GATEWAY_API_KEY?.trim();
  if (gatewayKey) {
    const gateway = createGateway({ apiKey: gatewayKey });
    const gatewayModel = normalizeForGateway(model) as GatewayModelId;
    const { text } = await generateText({
      model: gateway(gatewayModel),
      messages: opts.messages,
      maxOutputTokens: maxTokens,
      temperature,
    });
    return { text, provider: "ai_gateway" };
  }

  const orKey = opts.openRouterApiKey?.trim() || process.env.OPENROUTER_API_KEY?.trim();
  if (!orKey) {
    throw new Error("missing_llm_key");
  }
  const text = await openRouterChat({
    messages: opts.messages,
    model,
    maxTokens,
    temperature,
    apiKey: orKey,
    httpReferer: opts.openRouterHttpReferer,
    xTitle: opts.openRouterTitle,
  });
  return { text, provider: "openrouter" };
}
