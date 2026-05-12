import { NextRequest, NextResponse } from "next/server";
import type { Country } from "@/data/types";
import { getCountry, getSources } from "@/lib/jurisdictions";
import { LEGAL_SYSTEM_LABELS } from "@/data/types";
import { formatSnippetsForPrompt, getRankedSnippetsByEmbedding, loadSnippetsForCountry } from "@/lib/constitution-snippets";
import { formatLandmarkCasesForPrompt, getRankedLandmarkCasesByEmbedding, loadLandmarkCasesForCountry } from "@/lib/landmark-cases";
import { getCurrentUserId } from "@/lib/auth-config";
import { getUserPlanForUserId } from "@/lib/entitlements";
import { quotaJsonBody, checkChatQuota } from "@/lib/quota-check";
import { clientIp, hashIpForUsage } from "@/lib/request-ip";
import { getUsage, incrementUsage } from "@/lib/storage";

const SNIPPET_TOP_K = 4;
const CASE_TOP_K = 3;

function ragQueryText(message: string, country: Country): string {
  return [
    message,
    country.name,
    country.constitution.title,
    ...country.constitution.keyPrinciples,
    country.constitution.summary.slice(0, 800),
  ].join("\n");
}

function isConstitutionRelatedQuestion(text: string): boolean {
  const s = text.toLowerCase();
  return /\b(constitution|constitutional|charter|amendment|bill of rights|fundamental rights|article\b|clause|civic|referendum|referenda)\b/.test(
    s
  );
}

function buildReferenceAppendix(country: Country): string {
  const sources = getSources(country);
  const urlLines = sources.map((src) => `- ${src.label}: ${src.url}`).join("\n");
  return [
    "--- BasicLaw reference (ground answers here; cite using markdown links only to URLs below) ---",
    `Country: ${country.name}`,
    `Constitution summary: ${country.constitution.summary}`,
    `Key principles: ${country.constitution.keyPrinciples.join("; ")}`,
    "Authorized source URLs:",
    urlLines || "(none on file — do not invent URLs)",
    "---",
    "Citation rule: Use markdown links [short label](full URL) **only** for URLs listed above (country sources).",
    "For constitution snippets below (no URL), cite by **snippet title** and **snippet id** in plain text — do not invent links for snippets.",
  ].join("\n");
}

function constitutionContextBlock(country: Country): string {
  const sources = getSources(country);
  const urlLines =
    sources.length > 0
      ? sources.map((src) => `- [${src.label}](${src.url})`).join("\n")
      : "_No URLs on file — explain without external links._";
  return [
    "### Context from BasicLaw database",
    `**Country**: ${country.name}`,
    `**Summary**: ${country.constitution.summary}`,
    `**Key principles**: ${country.constitution.keyPrinciples.join("; ")}`,
    "**Sources**:",
    urlLines,
  ].join("\n\n");
}

function buildSystemPrompt(country: Country, ragBlock: string): { name: string; legalSystem: string; description: string; prompt: string } {
  const { constitution, languages, name, legalSystem } = country;
  const legalSystemLabel = LEGAL_SYSTEM_LABELS[legalSystem];
  const principles = constitution.keyPrinciples.join(", ");

  const ragSection = ragBlock ? `\n\n${ragBlock}` : "";

  return {
    name,
    legalSystem: legalSystemLabel,
    description: constitution.summary,
    prompt: `You are a legal information assistant specialising in ${name} (${legalSystemLabel}). The relevant constitutional framework is "${constitution.title}" (adopted ${constitution.yearAdopted}${constitution.yearLatestAmendment ? `, latest amendment ${constitution.yearLatestAmendment}` : ""}). Key constitutional principles you should be aware of: ${principles}. Official languages: ${languages.join(", ")}.
${ragSection}

When answering:
- Use plain language a non-lawyer can understand. Avoid Latin and untranslated jargon.
- Be specific to ${name} where the question is jurisdiction-sensitive. If the question involves another jurisdiction, say so and answer for ${name} unless the user asks otherwise.
- Where relevant, cite the article or section of the constitution or a named statute. Do not invent citations.
- **Links:** Use markdown [short label](URL) for (a) URLs in the authorized country source list in the BasicLaw reference section, and (b) **landmark case Source URLs** listed in the landmark cases section below. Do not fabricate any other URLs.
- **Constitution snippets:** If you use an educational snippet, name its **title** and **snippet id** in prose (no URL). Never present snippet text as verbatim statute unless the snippet itself says it is quoted public-domain text.
- **Landmark cases:** When helpful, name the case **title** and **case id** and include a markdown link using the exact Source URL provided for that case.
- For any topic where rules vary by sub-region (state, province, region), say so and recommend checking local rules.
- Always end with a brief disclaimer: this is educational legal information, not legal advice, and the reader should consult a licensed lawyer in ${name} for their specific situation.
- Refuse to draft documents intended for filing in court or to represent the reader. You may explain what such documents typically contain.`,
  };
}

export async function POST(request: NextRequest) {
  try {
    const locale = request.headers.get("x-basiclaw-locale")?.trim() ?? null;
    const body = await request.json();
    const { message, jurisdiction = "us", sessionId } = body as {
      message: string;
      jurisdiction?: string;
      sessionId?: string;
    };

    void sessionId;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const userId = await getCurrentUserId();
    const ipHash = hashIpForUsage(clientIp(request));
    const plan = await getUserPlanForUserId(userId);
    const usage = await getUsage(userId, ipHash);
    const cq = checkChatQuota(plan, usage);
    if (!cq.ok) {
      return NextResponse.json(quotaJsonBody(cq.message, locale), { status: 429 });
    }

    const country = getCountry((jurisdiction || "us").toLowerCase()) ?? getCountry("us")!;
    const snippets = await loadSnippetsForCountry(country.code);
    const cases = await loadLandmarkCasesForCountry(country.code);
    const q = ragQueryText(message, country);
    const [rankedSnippets, rankedCases] = await Promise.all([
      getRankedSnippetsByEmbedding(q, country.code, snippets, SNIPPET_TOP_K),
      getRankedLandmarkCasesByEmbedding(q, country.code, cases, CASE_TOP_K),
    ]);
    const ragBlock = [formatSnippetsForPrompt(rankedSnippets), formatLandmarkCasesForPrompt(rankedCases)].filter(Boolean).join("\n\n");

    const jurisdictionInfo = buildSystemPrompt(country, ragBlock);

    const citationsPayload: Array<{
      id: string;
      title: string;
      source: string;
      snippet: string;
      url?: string;
      kind: "snippet" | "case";
    }> = [
      ...rankedSnippets.map((s) => ({
        id: `snippet:${s.id}`,
        title: s.title,
        source: "BasicLaw snippet",
        snippet: s.excerpt.slice(0, 280),
        kind: "snippet" as const,
      })),
      ...rankedCases.map((c) => ({
        id: `case:${c.id}`,
        title: c.title,
        source: c.sourceUrl,
        url: c.sourceUrl,
        snippet: `${c.principle} — ${c.summary}`.slice(0, 320),
        kind: "case" as const,
      })),
    ];
    const appendix = buildReferenceAppendix(country);

    let userContent = message;
    if (isConstitutionRelatedQuestion(message)) {
      userContent = `${constitutionContextBlock(country)}\n\n---\n\n**User question**\n${message}`;
    }

    const messages = [
      {
        role: "system",
        content: `${jurisdictionInfo.prompt}\n\n${appendix}`,
      },
      { role: "user", content: userContent },
    ];

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      await incrementUsage("chat", userId, ipHash).catch(() => {
        /* non-fatal */
      });
      return NextResponse.json({
        response: `I understand you're asking about ${jurisdictionInfo.name} law. However, the AI service is not configured properly. Please ensure the OPENROUTER_API_KEY environment variable is set.\n\nFor educational purposes regarding ${jurisdictionInfo.name} (${jurisdictionInfo.legalSystem}): ${jurisdictionInfo.description}`,
        citations: citationsPayload,
      });
    }

    const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://basiclaw.app",
        "X-Title": "BasicLaw - Legal Information Assistant",
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || "openai/gpt-oss-20b:free",
        messages,
        max_tokens: 1500,
        temperature: 0.5,
      }),
    });

    if (!openRouterResponse.ok) {
      const errorData = await openRouterResponse.text();
      console.error("OpenRouter API error:", errorData);
      return NextResponse.json({ error: "Failed to get response from AI service" }, { status: 500 });
    }

    const data = await openRouterResponse.json();
    const assistantResponse =
      data.choices?.[0]?.message?.content ||
      data.choices?.[0]?.text ||
      "I apologise, but I couldn't generate a response. Please try again.";

    await incrementUsage("chat", userId, ipHash).catch(() => {
      /* non-fatal */
    });

    return NextResponse.json({
      response: assistantResponse,
      citations: citationsPayload,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
