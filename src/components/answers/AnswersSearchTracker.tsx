"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics";

export function AnswersSearchTracker({ query }: { query: string }) {
  const fired = useRef(false);
  useEffect(() => {
    const q = query.trim();
    if (!q || fired.current) return;
    fired.current = true;
    track("answer_search_used", { q_length: q.length });
  }, [query]);
  return null;
}
