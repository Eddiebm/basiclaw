"use client";

import { createContext, useContext, type ReactNode } from "react";

const ClerkEnabledContext = createContext(false);

export function ClerkEnabledProvider({ value, children }: { value: boolean; children: ReactNode }) {
  return <ClerkEnabledContext.Provider value={value}>{children}</ClerkEnabledContext.Provider>;
}

/** Mirrors server `isClerkEnabled()` so client components can branch without calling Clerk hooks. */
export function useClerkEnabled(): boolean {
  return useContext(ClerkEnabledContext);
}
