"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type AnnouncerContextValue = { announce: (message: string) => void };

const AnnouncerContext = createContext<AnnouncerContextValue | null>(null);

export function AnnouncerProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState("");

  const announce = useCallback((msg: string) => {
    setMessage("");
    requestAnimationFrame(() => setMessage(msg));
  }, []);

  const value = useMemo(() => ({ announce }), [announce]);

  return (
    <AnnouncerContext.Provider value={value}>
      {children}
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {message}
      </p>
    </AnnouncerContext.Provider>
  );
}

export function useAnnouncer(): (msg: string) => void {
  const ctx = useContext(AnnouncerContext);
  return ctx?.announce ?? (() => {});
}
