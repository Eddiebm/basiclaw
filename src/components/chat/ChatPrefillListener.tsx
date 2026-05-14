"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useChat } from "@/store/chat-context";
import { getCountry } from "@/lib/jurisdictions";
import { track } from "@/lib/analytics";
import { readChatPrefillFromSearchParams } from "@/lib/chat-query-prefill";

export function ChatPrefillListener() {
  const searchParams = useSearchParams();
  const { currentSession, createSession, sendMessage } = useChat();
  const startedRef = useRef(false);
  const sentRef = useRef(false);

  useEffect(() => {
    const prefill = readChatPrefillFromSearchParams(searchParams);
    if (!prefill) {
      startedRef.current = false;
      sentRef.current = false;
      return;
    }
    if (startedRef.current) return;
    const rawJurisdiction = searchParams.get("jurisdiction") || searchParams.get("country") || "us";
    const country = getCountry(rawJurisdiction);
    const jurisdiction = (country?.code ?? "us").toLowerCase();
    startedRef.current = true;
    createSession(jurisdiction);
  }, [searchParams, createSession]);

  useEffect(() => {
    const prefill = readChatPrefillFromSearchParams(searchParams);
    if (!prefill || sentRef.current) return;
    if (!currentSession || currentSession.messages.length > 0) return;
    const message = prefill;
    if (!message) return;
    sentRef.current = true;
    track("question_to_chat", {
      stage: searchParams.get("stage") ?? null,
      domain: searchParams.get("domain") ?? null,
      risk: searchParams.get("risk") ?? null,
      jurisdiction: currentSession.jurisdiction,
    });
    void sendMessage(message, { jurisdiction: currentSession.jurisdiction });
  }, [searchParams, currentSession, sendMessage]);

  return null;
}
