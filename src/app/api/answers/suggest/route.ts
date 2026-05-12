import { NextRequest, NextResponse } from "next/server";
import { suggestPublicAnswers } from "@/lib/saved-answers";

export async function GET(request: NextRequest) {
  const country = request.nextUrl.searchParams.get("country")?.trim().toLowerCase() || "us";
  const items = await suggestPublicAnswers(country, 6);
  return NextResponse.json({
    items: items.map((i) => ({
      id: i.id,
      question: i.question,
      upvotes: i.upvotes,
    })),
  });
}
