import { NextResponse } from "next/server";
import { isClerkEnabled } from "@/lib/auth-config";

export const runtime = "nodejs";

export async function GET() {
  if (!isClerkEnabled()) {
    return NextResponse.json({ chats: [] });
  }
  return NextResponse.json({ error: "not_implemented" }, { status: 501 });
}
