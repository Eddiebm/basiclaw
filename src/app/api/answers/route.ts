import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { isClerkEnabled } from "@/lib/auth-config";
import { saveAnswer, type SavedCitation } from "@/lib/saved-answers";

export async function POST(request: NextRequest) {
  if (!isClerkEnabled()) {
    return NextResponse.json({ error: "Auth not configured" }, { status: 401 });
  }
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const { question, answer, jurisdiction, locale, citations } = body as {
    question?: string;
    answer?: string;
    jurisdiction?: string;
    locale?: string;
    citations?: SavedCitation[];
  };
  if (!question || typeof question !== "string" || !answer || typeof answer !== "string") {
    return NextResponse.json({ error: "question and answer are required" }, { status: 400 });
  }
  const row = await saveAnswer({
    userId,
    question: question.trim(),
    answer: answer.trim(),
    jurisdiction: (jurisdiction || "us").toLowerCase(),
    locale: locale || "en",
    citations: Array.isArray(citations) ? citations : [],
  });
  return NextResponse.json({ id: row.id });
}
