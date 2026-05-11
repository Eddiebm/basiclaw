import type { UsState, UsStateTopicSlug } from "@/data/us-states";

/**
 * Optional build-time enrichment. Runs only when BUILD_LLM_KEY is set (never uses chat keys).
 * Returns null on failure or when the key is missing.
 */
export async function fetchBuildTimeStateTopicSummary(
  state: UsState,
  topic: UsStateTopicSlug
): Promise<string | null> {
  const apiKey = process.env.BUILD_LLM_KEY;
  if (!apiKey) return null;

  const model =
    process.env.BUILD_LLM_MODEL || process.env.OPENROUTER_MODEL || "openai/gpt-oss-20b:free";
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://basiclaw.app";

  const system =
    "You write short, plain-language legal literacy copy for non-lawyers. Output 2–4 sentences only. No markdown. Educational, not legal advice.";

  const user = `US state: ${state.name} (${state.code}), capital ${state.capital}.
Topic: ${topic}.
${state.notes ? `Known local notes (may be incomplete): ${state.notes}` : ""}
Write a concise state-specific summary card explaining how this topic often shows up differently in ${state.name} than nationally, and remind readers local codes and courts vary.`;

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": site,
        "X-Title": "BasicLaw build-time state summary",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        max_tokens: 220,
        temperature: 0.35,
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const text = data.choices?.[0]?.message?.content?.trim();
    return text && text.length > 40 ? text : null;
  } catch {
    return null;
  }
}
