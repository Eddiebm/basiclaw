import { NextRequest, NextResponse } from "next/server";
import type { Country } from "@/data/types";
import { getCountry, getSources } from "@/lib/jurisdictions";
import { LEGAL_SYSTEM_LABELS } from "@/data/types";

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
    "Citation rule: When referencing these materials, include markdown links like [short label](full URL) using ONLY URLs listed above.",
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

function buildSystemPrompt(country: Country): { name: string; legalSystem: string; description: string; prompt: string } {
  const { constitution, languages, name, legalSystem } = country;
  const legalSystemLabel = LEGAL_SYSTEM_LABELS[legalSystem];
  const principles = constitution.keyPrinciples.join(", ");

  return {
    name,
    legalSystem: legalSystemLabel,
    description: constitution.summary,
    prompt: `You are a legal information assistant specialising in ${name} (${legalSystemLabel}). The relevant constitutional framework is "${constitution.title}" (adopted ${constitution.yearAdopted}${constitution.yearLatestAmendment ? `, latest amendment ${constitution.yearLatestAmendment}` : ""}). Key constitutional principles you should be aware of: ${principles}. Official languages: ${languages.join(", ")}.

When answering:
- Use plain language a non-lawyer can understand. Avoid Latin and untranslated jargon.
- Be specific to ${name} where the question is jurisdiction-sensitive. If the question involves another jurisdiction, say so and answer for ${name} unless the user asks otherwise.
- Where relevant, cite the article or section of the constitution or a named statute. Do not invent citations.
- Use markdown links [label](URL) only from the authorized URLs provided in the BasicLaw reference section — never fabricate links.
- For any topic where rules vary by sub-region (state, province, region), say so and recommend checking local rules.
- Always end with a brief disclaimer: this is educational legal information, not legal advice, and the reader should consult a licensed lawyer in ${name} for their specific situation.
- Refuse to draft documents intended for filing in court or to represent the reader. You may explain what such documents typically contain.`,
  };
}

export async function POST(request: NextRequest) {
  try {
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

    const country = getCountry((jurisdiction || "us").toLowerCase()) ?? getCountry("us")!;
    const jurisdictionInfo = buildSystemPrompt(country);
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
      return NextResponse.json({
        response: `I understand you're asking about ${jurisdictionInfo.name} law. However, the AI service is not configured properly. Please ensure the OPENROUTER_API_KEY environment variable is set.\n\nFor educational purposes regarding ${jurisdictionInfo.name} (${jurisdictionInfo.legalSystem}): ${jurisdictionInfo.description}`,
        citations: [],
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

    return NextResponse.json({
      response: assistantResponse,
      citations: [],
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
