import { NextRequest, NextResponse } from "next/server";

interface SearchRequest {
  query: string;
  jurisdiction?: "us" | "ghana" | "nigeria";
  limit?: number;
}

interface LegalTopic {
  id: string;
  title: string;
  category: string;
  jurisdiction: string[];
  summary: string;
  keyPoints: string[];
  relatedTopics: string[];
  citations: {
    title: string;
    source: string;
    url?: string;
  }[];
}

const LEGAL_KNOWLEDGE_BASE: LegalTopic[] = [
  {
    id: "constitutional-rights",
    title: "Constitutional Rights",
    category: "Fundamental Rights",
    jurisdiction: ["us", "ghana", "nigeria"],
    summary: "Constitutional rights are basic human rights protected by a country's constitution. These rights apply to all citizens and establish the framework for governance and individual freedoms.",
    keyPoints: [
      "Right to life, liberty, and security of person",
      "Freedom of speech and expression",
      "Protection from unreasonable search and seizure",
      "Right to a fair trial",
      "Freedom of religion",
      "Right to privacy"
    ],
    relatedTopics: ["due-process", "equal-protection", "human-rights"],
    citations: [
      { title: "US Constitution", source: "US Government" },
      { title: "Ghana Constitution 1992", source: "Republic of Ghana" },
      { title: "Nigeria Constitution 1999", source: "Federal Republic of Nigeria" }
    ]
  },
  {
    id: "contract-law-basics",
    title: "Contract Law Basics",
    category: "Civil Law",
    jurisdiction: ["us", "ghana", "nigeria"],
    summary: "A contract is a legally binding agreement between two or more parties. For a contract to be valid, it must contain certain essential elements including offer, acceptance, consideration, and mutual intent.",
    keyPoints: [
      "Offer: clear proposal made by one party",
      "Acceptance: unqualified agreement to the offer",
      "Consideration: something of value exchanged",
      "Capacity: parties must be legally able to contract",
      "Legality: contract must be for legal purposes",
      "Written vs verbal contracts"
    ],
    relatedTopics: ["breach-of-contract", "contract-disputes", "settlement-agreements"],
    citations: [
      { title: "Restatement (Second) of Contracts", source: "American Law Institute" },
      { title: "Ghana Contracts Act 1963", source: "Republic of Ghana" },
      { title: "Nigeria Contract Law", source: "Federal Ministry of Justice" }
    ]
  },
  {
    id: "tenant-rights",
    title: "Tenant Rights",
    category: "Property Law",
    jurisdiction: ["us", "ghana", "nigeria"],
    summary: "Tenant rights are legal protections for individuals who rent property. These rights vary by jurisdiction but typically include the right to habitable housing, protection from arbitrary eviction, and privacy.",
    keyPoints: [
      "Right to habitable living conditions",
      "Protection from arbitrary eviction",
      "Privacy rights in rented property",
      "Security deposit protections",
      "Repair and maintenance obligations",
      "Lease agreement protections"
    ],
    relatedTopics: ["landlord-tenant", "eviction-process", "housing-law"],
    citations: [
      { title: "Fair Housing Act", source: "US Department of Housing and Urban Development" },
      { title: "Rent Act", source: "Ghana Ministry of Housing" },
      { title: "Tenancy Law", source: "Nigeria Federal Ministry of Works" }
    ]
  },
  {
    id: "family-law-overview",
    title: "Family Law Overview",
    category: "Family Law",
    jurisdiction: ["us", "ghana", "nigeria"],
    summary: "Family law covers legal matters related to family relationships including marriage, divorce, child custody, adoption, and domestic violence. These laws protect family members and establish procedures for resolving family disputes.",
    keyPoints: [
      "Marriage requirements and registration",
      "Divorce procedures and grounds",
      "Child custody and support",
      "Adoption processes",
      "Domestic violence protections",
      "Inheritance and succession"
    ],
    relatedTopics: ["divorce-procedure", "child-custody", "domestic-violence"],
    citations: [
      { title: "Family Law Act", source: "US States Federal System" },
      { title: "Matrimonial Causes Act", source: "Ghana Judicial Service" },
      { title: "Matrimonial Causes Decree", source: "Nigeria Courts" }
    ]
  },
  {
    id: "criminal-procedure",
    title: "Criminal Procedure",
    category: "Criminal Law",
    jurisdiction: ["us", "ghana", "nigeria"],
    summary: "Criminal procedure refers to the legal process for investigating, charging, and trying individuals accused of criminal offenses. These procedures protect the rights of the accused while ensuring justice.",
    keyPoints: [
      "Right to remain silent",
      "Right to legal representation",
      "Protection from self-incrimination",
      "Presumption of innocence",
      "Right to a speedy trial",
      "Protection from cruel punishment"
    ],
    relatedTopics: ["arrest-procedure", "bail-and-bond", "criminal-trial"],
    citations: [
      { title: "Criminal Procedure Code", source: "US Federal and State Governments" },
      { title: "Criminal Procedure Code Ghana", source: "Republic of Ghana" },
      { title: "Criminal Procedure Act Nigeria", source: "Federal Republic of Nigeria" }
    ]
  },
  {
    id: "consumer-protection",
    title: "Consumer Protection",
    category: "Commercial Law",
    jurisdiction: ["us", "ghana", "nigeria"],
    summary: "Consumer protection laws safeguard individuals purchasing goods and services. These laws ensure fair dealing, protect against fraud, and provide remedies for defective products or services.",
    keyPoints: [
      "Protection from fraudulent practices",
      "Right to fair pricing",
      "Product safety requirements",
      "Right to refunds and replacements",
      "Truth in advertising",
      "Debt collection protections"
    ],
    relatedTopics: ["business-law", "product-liability", "fraud-prevention"],
    citations: [
      { title: "Consumer Product Safety Act", source: "US Consumer Product Safety Commission" },
      { title: "Consumer Protection Act Ghana", source: "Ghana Ministry of Trade" },
      { title: "Consumer Protection Council Act Nigeria", source: "Nigeria CPC" }
    ]
  }
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q") || searchParams.get("query") || "";
  const jurisdiction = searchParams.get("jurisdiction") as "us" | "ghana" | "nigeria" | undefined;

  if (!query) {
    return NextResponse.json({
      topics: LEGAL_KNOWLEDGE_BASE.map((topic) => ({
        id: topic.id,
        title: topic.title,
        category: topic.category,
        summary: topic.summary
      }))
    });
  }

  // Simple search implementation
  const lowerQuery = query.toLowerCase();
  const results = LEGAL_KNOWLEDGE_BASE.filter((topic) => {
    const matchesQuery =
      topic.title.toLowerCase().includes(lowerQuery) ||
      topic.summary.toLowerCase().includes(lowerQuery) ||
      topic.category.toLowerCase().includes(lowerQuery);

    const matchesJurisdiction = !jurisdiction || topic.jurisdiction.includes(jurisdiction);

    return matchesQuery && matchesJurisdiction;
  });

  return NextResponse.json({
    query,
    jurisdiction: jurisdiction || "all",
    count: results.length,
    results: results.map((topic) => ({
      id: topic.id,
      title: topic.title,
      category: topic.category,
      summary: topic.summary,
      keyPoints: topic.keyPoints,
      relatedTopics: topic.relatedTopics,
      citations: topic.citations
    }))
  });
}

export async function POST(request: NextRequest) {
  try {
    const body: { topicId: string; jurisdiction?: string } = await request.json();
    const { topicId } = body;

    const topic = LEGAL_KNOWLEDGE_BASE.find((t) => t.id === topicId);

    if (!topic) {
      return NextResponse.json(
        { error: "Topic not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ topic });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch topic" },
      { status: 500 }
    );
  }
}