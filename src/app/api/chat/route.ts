import { NextRequest, NextResponse } from "next/server";
import type { Country } from "@/data/types";
import { getCountry, getSources } from "@/lib/jurisdictions";
import { LEGAL_SYSTEM_LABELS } from "@/data/types";
import { formatSnippetsForPrompt, getRankedSnippetsByEmbedding, loadSnippetsForCountry } from "@/lib/constitution-snippets";
import { formatLandmarkCasesForPrompt, getRankedLandmarkCasesByEmbedding, loadLandmarkCasesForCountry } from "@/lib/landmark-cases";
import { getCurrentUserId } from "@/lib/auth-config";
import { getUserPlanForUserId } from "@/lib/entitlements";
import { limitsForPlan, limitsForEmbedTenantPlan } from "@/lib/limits";
import { checkChatQuotaAgainstLimits, quotaJsonBody } from "@/lib/quota-check";
import { embedQueryForRag } from "@/lib/query-embed";
import { getMeta, loadSnippetEmbeddingsFile } from "@/lib/rag-embeddings";
import { clientIp, hashIpForUsage } from "@/lib/request-ip";
import { findSimilarPublicAnswers, saveChatExchangeAsAnswer, type SavedCitation } from "@/lib/saved-answers";
import { getUsage, incrementUsage } from "@/lib/storage";
import { generateChatCompletionText } from "@/lib/llm-chat-completion";
import { usageSubjectForEmbed } from "@/lib/embed-usage-subject";
import { resolveEmbedTenantForRequest } from "@/lib/embed-tenant-resolve";

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

    const bodyRecord = body as Record<string, unknown>;
    const embedRes = await resolveEmbedTenantForRequest(request, bodyRecord);
    if (!embedRes.ok) {
      return NextResponse.json({ error: embedRes.error }, { status: embedRes.status });
    }
    const embedTenant = embedRes.tenant;

    const userId = await getCurrentUserId();
    const ipHash = hashIpForUsage(clientIp(request));
    const { usageUserId, usageIpHash } = usageSubjectForEmbed(embedTenant, userId, ipHash);
    const billingPlan = await getUserPlanForUserId(userId);
    const usage = await getUsage(usageUserId, usageIpHash);
    const L = embedTenant ? limitsForEmbedTenantPlan(embedTenant.plan) : limitsForPlan(billingPlan);
    const cq = checkChatQuotaAgainstLimits(L, usage);
    if (!cq.ok) {
      return NextResponse.json(quotaJsonBody(cq.message, locale), { status: 429 });
    }

    const country = getCountry((jurisdiction || "us").toLowerCase()) ?? getCountry("us")!;
    const snippetEmbFile = await loadSnippetEmbeddingsFile();
    const embMeta = getMeta(snippetEmbFile) ?? { dim: 384, model: "Xenova/all-MiniLM-L6-v2", provider: "xenova" as const };
    const queryEmbedding = await embedQueryForRag(message, embMeta);
    const { cache: cacheHit, related } = await findSimilarPublicAnswers(queryEmbedding, country.code.toLowerCase());
    const relatedSavedAnswers = related.map((r) => ({ id: r.id, question: r.record.question, score: r.score }));

    if (cacheHit) {
      const c = cacheHit.record;
      const citationsPayload = (c.citations ?? []).map((cite) => ({
        id: cite.id,
        title: cite.title,
        source: cite.source,
        snippet: cite.snippet,
        url: cite.url,
        kind: (cite.kind === "case" ? "case" : "snippet") as "snippet" | "case",
      }));
      await incrementUsage("chat", usageUserId, usageIpHash).catch(() => {
        /* non-fatal */
      });
      return NextResponse.json({
        response: c.answer,
        citations: citationsPayload,
        cachedFrom: c.id,
        cachedAtScore: cacheHit.score,
        relatedSavedAnswers,
      });
    }

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

    const hasLlm =
      Boolean(process.env.AI_GATEWAY_API_KEY?.trim()) || Boolean(process.env.OPENROUTER_API_KEY?.trim());

    if (!hasLlm) {
      await incrementUsage("chat", usageUserId, usageIpHash).catch(() => {
        /* non-fatal */
      });
      const fallbackText = `I understand you're asking about ${jurisdictionInfo.name} law. However, the AI service is not configured properly. Please set AI_GATEWAY_API_KEY (preferred) or OPENROUTER_API_KEY on the server.\n\nFor educational purposes regarding ${jurisdictionInfo.name} (${jurisdictionInfo.legalSystem}): ${jurisdictionInfo.description}`;
      let savedAnswerId: string | undefined;
      let isPublicSaved = false;
      if (userId) {
        const citationsForSave: SavedCitation[] = citationsPayload.map((c) => ({
          id: c.id,
          title: c.title,
          source: c.source,
          snippet: c.snippet,
          url: c.url,
          kind: c.kind,
        }));
        const saved = await saveChatExchangeAsAnswer({
          question: message,
          answer: fallbackText,
          jurisdiction: country.code.toLowerCase(),
          locale: (locale || "en").split("-")[0] || "en",
          citations: citationsForSave,
          userId,
        }).catch(() => null);
        if (saved) {
          savedAnswerId = saved.id;
          isPublicSaved = saved.isPublic;
        }
      }
      return NextResponse.json({
        response: fallbackText,
        citations: citationsPayload,
        relatedSavedAnswers,
        savedAnswerId,
        isPublicSaved,
      });
    }

    let assistantResponse: string;
    try {
      const { text } = await generateChatCompletionText({
        messages: messages as Array<{ role: "system" | "user" | "assistant"; content: string }>,
        maxTokens: 1500,
        temperature: 0.5,
      });
      assistantResponse = text;
    } catch (e) {
      console.error("Chat LLM error:", e);
      return NextResponse.json({ error: "Failed to get response from AI service" }, { status: 500 });
    }

    await incrementUsage("chat", usageUserId, usageIpHash).catch(() => {
      /* non-fatal */
    });

    let savedAnswerId: string | undefined;
    let isPublicSaved = false;
    if (userId) {
      const citationsForSave: SavedCitation[] = citationsPayload.map((c) => ({
        id: c.id,
        title: c.title,
        source: c.source,
        snippet: c.snippet,
        url: c.url,
        kind: c.kind,
      }));
      const saved = await saveChatExchangeAsAnswer({
        question: message,
        answer: assistantResponse,
        jurisdiction: country.code.toLowerCase(),
        locale: (locale || "en").split("-")[0] || "en",
        citations: citationsForSave,
        userId,
      }).catch(() => null);
      if (saved) {
        savedAnswerId = saved.id;
        isPublicSaved = saved.isPublic;
      }
    }

    return NextResponse.json({
      response: assistantResponse,
      citations: citationsPayload,
      relatedSavedAnswers,
      savedAnswerId,
      isPublicSaved,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
