"use client";

import { useEffect, useRef, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import type { EmbedBorderParam, EmbedThemeParam } from "@/lib/embed-params";

function subscribePreferredDark(callback: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getPreferredDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function getPreferredDarkServer() {
  return false;
}

function postResize(height: number) {
  if (typeof window === "undefined" || window.parent === window) return;
  window.parent.postMessage({ source: "basiclaw", type: "resize", height }, "*");
}

export function EmbedVisualShell({
  theme,
  accentCss,
  border,
  children,
}: {
  theme: EmbedThemeParam;
  accentCss: string | null;
  border: EmbedBorderParam;
  children: ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const prefersDark = useSyncExternalStore(subscribePreferredDark, getPreferredDark, getPreferredDarkServer);
  const dark = theme === "dark" || (theme === "auto" && prefersDark);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const h = Math.ceil(el.getBoundingClientRect().height);
      postResize(h);
    });
    ro.observe(el);
    postResize(Math.ceil(el.getBoundingClientRect().height));
    return () => ro.disconnect();
  }, []);

  const radius = border === "square" ? "rounded-md" : "rounded-xl";

  return (
    <div
      ref={rootRef}
      suppressHydrationWarning
      className={`${dark ? "dark" : ""} w-full min-w-0 bg-background text-foreground antialiased`}
      style={
        accentCss
          ? ({
              ["--color-primary" as string]: accentCss,
              ["--color-ring" as string]: accentCss,
            } as CSSProperties)
          : undefined
      }
    >
      <div className={`mx-auto w-full max-w-3xl border border-[var(--border)] bg-card p-4 shadow-sm sm:p-5 ${radius}`}>
        {children}
      </div>
    </div>
  );
}
