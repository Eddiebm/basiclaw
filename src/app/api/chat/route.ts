import { NextRequest, NextResponse } from "next/server";
import { getCountry } from "@/lib/jurisdictions";
import { LEGAL_SYSTEM_LABELS } from "@/data/types";

function buildSystemPrompt(code: string): { name: string; legalSystem: string; description: string; prompt: string } {
  const country = getCountry(code) ?? getCountry("us")!;
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

    const jurisdictionInfo = buildSystemPrompt((jurisdiction || "us").toLowerCase());

    const messages = [
      { role: "system", content: jurisdictionInfo.prompt },
      { role: "user", content: message },
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
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://basiclaw.app",
        "X-Title": "BasicLaw \u2014 Legal Information Assistant",
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || "openai/gpt-oss-120b:free",
        messages,
        max_tokens: 1500,
        temperature: 0.5,
      }),
    });

    if (!openRouterResponse.ok) {
      const errorData = await openRouterResponse.text();
      console.error("OpenRouter API error:", errorData);
      return NextResponse.json(
        { error: "Failed to get response from AI service" },
        { status: 500 }
      );
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
