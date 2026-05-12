"use client";

import { useEffect } from "react";

export function EmbedLayoutClient({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.setAttribute("data-embed", "true");
    return () => {
      document.documentElement.removeAttribute("data-embed");
    };
  }, []);
  return <>{children}</>;
}
