import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { isClerkEnabled } from "@/lib/auth-config";
import { listUserAnswers, toPublicAnswer } from "@/lib/saved-answers";

export async function GET() {
  if (!isClerkEnabled()) {
    return NextResponse.json({ answers: [] });
  }
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const answers = await listUserAnswers(userId, 1, 200);
  const sanitized = answers.map(toPublicAnswer);
  return NextResponse.json({ answers: sanitized });
}
