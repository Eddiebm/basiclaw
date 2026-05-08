import { NextRequest, NextResponse } from "next/server";
import type { Jurisdiction } from "@/store/chat-context";

const JURISDICTION_CONTEXT = {
  us: {
    name: "United States",
    legalSystem: "Common Law (Federal & State)",
    description: "Based on case law, statutes, and constitutional principles",
    prompt: `You are a legal information assistant specializing in United States law. You provide clear, accurate information about legal concepts, rights, and processes in the US legal system. You should:
- Explain constitutional rights and their origins
- Discuss federal vs. state jurisdiction
- Reference key Supreme Court decisions when relevant
- Clarify procedural aspects of US courts
- Always include a disclaimer that this is educational information, not legal advice
- Be clear about the distinction between federal and state laws`,
  },
  ghana: {
    name: "Ghana",
    legalSystem: "Mixed Common Law and Customary Law",
    description: "Combines English common law with traditional customary law",
    prompt: `You are a legal information assistant specializing in Ghanaian law. You provide clear, accurate information about legal concepts, rights, and processes in Ghana. You should:
- Explain fundamental human rights under the 1992 Constitution
- Discuss the distinction between common law and customary law
- Reference relevant Ghanaian statutes and case law
- Clarify the court system structure
- Always include a disclaimer that this is educational information, not legal advice
- Be sensitive to the role of traditional authorities in dispute resolution`,
  },
  nigeria: {
    name: "Nigeria",
    legalSystem: "Common Law (Federal System)",
    description: "Based on English common law with federal and state variations",
    prompt: `You are a legal information assistant specializing in Nigerian law. You provide clear, accurate information about legal concepts, rights, and processes in Nigeria. You should:
- Explain fundamental rights under the 1999 Constitution (as amended)
- Discuss federal vs. state jurisdiction
- Reference relevant Nigerian statutes and case law
- Clarify the court system from Magistrate to Supreme Court
- Always include a disclaimer that this is educational information, not legal advice
- Address both civil and criminal law distinctions`,
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, jurisdiction = "us", sessionId } = body as {
      message: string;
      jurisdiction: Jurisdiction;
      sessionId: string;
    };

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const jurisdictionInfo = JURISDICTION_CONTEXT[jurisdiction] || JURISDICTION_CONTEXT.us;

    const messages = [
      {
        role: "system",
        content: jurisdictionInfo.prompt,
      },
      {
        role: "user",
        content: message,
      },
    ];

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        response: `I understand you're asking about ${jurisdictionInfo.name} law. However, the AI service is not configured properly. Please ensure the OpenRouter API key is set.\n\nFor educational purposes regarding ${jurisdictionInfo.name} (${jurisdictionInfo.legalSystem}): ${jurisdictionInfo.description}`,
        citations: [],
      });
    }

    const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://basiclaw.app",
        "X-Title": "BasicLaw - Legal Information Assistant",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1:free",
        messages,
        max_tokens: 1500,
        temperature: 0.7,
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
    const assistantResponse = data.choices?.[0]?.message?.content ||
                             data.choices?.[0]?.text ||
                             "I apologize, but I couldn't generate a response. Please try again.";

    return NextResponse.json({
      response: assistantResponse,
      citations: [],
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
