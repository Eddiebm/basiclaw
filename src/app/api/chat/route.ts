import { NextRequest, NextResponse } from "next/server";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

interface ChatRequest {
  sessionId: string;
  message: string;
  jurisdiction: "us" | "ghana" | "nigeria";
  history?: Message[];
}

const JURISDICTION_CONTEXT = {
  us: {
    name: "United States",
    legalSystem: "Common Law (Federal & State)",
    description: "Based on case law, statutes, and constitutional principles"
  },
  ghana: {
    name: "Ghana",
    legalSystem: "Mixed Common Law & Customary",
    description: "Combines English common law with customary law and statutes"
  },
  nigeria: {
    name: "Nigeria",
    legalSystem: "Common Law (Federal System)",
    description: "Follows English common law with Islamic law in northern states"
  }
};

const LEGAL_TOPICS = {
  us: [
    "Constitutional Rights", "Criminal Law", "Civil Rights", "Family Law",
    "Contract Law", "Property Law", "Immigration", "Employment Law",
    "Consumer Protection", "Traffic Violations"
  ],
  ghana: [
    "Constitutional Rights", "Inheritance", "Land Law", "Family Law",
    "Criminal Law", "Commercial Law", "Environmental Law", "Customary Law"
  ],
  nigeria: [
    "Constitutional Rights", "Sharia Law", "Family Law", "Criminal Law",
    "Property Law", "Oil & Gas Law", "Corporate Law", "Immigration"
  ]
};

const SAMPLE_RESPONSES: Record<string, string[]> = {
  default: [
    "This is an educational response about legal concepts. For specific legal advice, please consult a licensed attorney in your jurisdiction.",
    "Legal information is complex and varies by jurisdiction. A qualified lawyer can provide guidance tailored to your specific situation.",
    "Understanding your rights is important. While I can provide general information, only a lawyer can give legal advice for your case."
  ]
};

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { message, jurisdiction, history = [] } = body;

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Build context-aware response
    const jurContext = JURISDICTION_CONTEXT[jurisdiction] || JURISDICTION_CONTEXT.us;
    const topics = LEGAL_TOPICS[jurisdiction] || LEGAL_TOPICS.us;

    // Simple keyword detection for demo
    const lowerMessage = message.toLowerCase();
    let response = "";

    if (lowerMessage.includes("rights") || lowerMessage.includes("constitution")) {
      response = `In the ${jurContext.name} legal system (${jurContext.legalSystem}), constitutional rights are foundational. ${jurContext.description}. Key rights typically include due process, equal protection, and freedom of expression. However, specific rights and their interpretations vary by case law and statute.`;
    } else if (lowerMessage.includes("contract") || lowerMessage.includes("agreement")) {
      response = `Contract law in ${jurContext.name} requires essential elements: offer, acceptance, consideration, and mutual intent. ${jurContext.description}. Verbal contracts can be enforceable, but written contracts provide stronger evidence. Consult a lawyer for specific contract disputes.`;
    } else if (lowerMessage.includes("family") || lowerMessage.includes("divorce") || lowerMessage.includes("custody")) {
      response = `Family law in ${jurContext.name} covers marriage, divorce, child custody, and support. ${jurContext.description}. Family courts handle these matters, and outcomes depend on specific circumstances and jurisdiction. Legal representation is strongly recommended.`;
    } else if (lowerMessage.includes("criminal") || lowerMessage.includes("arrest") || lowerMessage.includes("police")) {
      response = `Criminal procedure in ${jurContext.name} varies by jurisdiction level. ${jurContext.description}. You have rights including the right to remain silent, right to attorney, and protection from unreasonable search. If arrested, exercise your rights and seek legal counsel immediately.`;
    } else if (lowerMessage.includes("property") || lowerMessage.includes("land") || lowerMessage.includes("housing")) {
      response = `Property law in ${jurContext.name} governs ownership, transfers, and disputes. ${jurContext.description}. Property rights can be affected by zoning, easements, and local regulations. Legal advice is essential for significant property transactions.`;
    } else {
      // General educational response
      const samples = SAMPLE_RESPONSES.default;
      response = `In ${jurContext.name} (${jurContext.legalSystem}), legal matters can be complex. ${jurContext.description}.\n\nKey legal topics in ${jurContext.name}: ${topics.slice(0, 5).join(", ")}.\n\nFor specific legal advice tailored to your situation, please consult a licensed attorney in ${jurContext.name}.`;
    }

    // Return mock response with citations
    return NextResponse.json({
      response,
      citations: [
        {
          id: crypto.randomUUID(),
          title: `Legal Information - ${jurContext.name}`,
          source: `${jurContext.name} Legal System`,
          snippet: `${jurContext.legalSystem}: ${jurContext.description}`
        }
      ]
    });

  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}