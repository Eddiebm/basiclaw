"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { initAnalytics } from "@/lib/analytics";

export function AnalyticsProvider() {
  const pathname = usePathname();
  const search = useSearchParams();

  useEffect(() => {
    if (pathname?.startsWith("/embed/")) return;
    initAnalytics();
  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (pathname?.startsWith("/embed/")) return;
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
    const url = `${pathname}${search?.toString() ? `?${search.toString()}` : ""}`;
    posthog.capture("$pageview", { $current_url: url });
  }, [pathname, search]);

  return null;
}
