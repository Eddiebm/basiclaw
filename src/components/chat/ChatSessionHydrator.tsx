"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useChat, type ChatSession, type Message, type MessageRole } from "@/store/chat-context";
import type { StoredChat } from "@/lib/storage";

function storedToSession(c: StoredChat): ChatSession {
  const updated = new Date(c.updatedAt);
  const messages: Message[] = c.messages.map((m, idx) => ({
    id: `${c.id}-m-${idx}`,
    role: (m.role === "assistant" || m.role === "user" || m.role === "system" ? m.role : "user") as MessageRole,
    content: m.content,
    timestamp: updated,
  }));
  return {
    id: c.id,
    title: c.title,
    messages,
    jurisdiction: c.jurisdiction,
    createdAt: updated,
    updatedAt: updated,
  };
}

export function ChatSessionHydrator() {
  const searchParams = useSearchParams();
  const { upsertSession } = useChat();
  const fetchedFor = useRef<string | null>(null);

  useEffect(() => {
    const sid = searchParams.get("session")?.trim();
    if (!sid) {
      fetchedFor.current = null;
      return;
    }
    if (fetchedFor.current === sid) return;
    fetchedFor.current = sid;
    void (async () => {
      const res = await fetch(`/api/me/chats/${encodeURIComponent(sid)}`);
      if (res.status === 401) {
        fetchedFor.current = null;
        return;
      }
      if (!res.ok) return;
      const json = (await res.json()) as { chat?: StoredChat };
      if (json.chat) upsertSession(storedToSession(json.chat));
    })();
  }, [searchParams, upsertSession]);

  return null;
}
