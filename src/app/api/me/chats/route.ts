import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isClerkEnabled } from "@/lib/auth-config";
import { listChatsForUser } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET() {
  if (!isClerkEnabled()) {
    return NextResponse.json({ error: "auth_disabled" }, { status: 503 });
  }
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const chats = await listChatsForUser(userId);
  return NextResponse.json({ chats });
}
