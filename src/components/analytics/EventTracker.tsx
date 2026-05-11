"use client";

import { useEffect, useRef } from "react";
import { track, type AnalyticsEvent } from "@/lib/analytics";

interface Props {
  event: AnalyticsEvent;
  properties?: Record<string, unknown>;
}

export function EventTracker({ event, properties }: Props) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    track(event, properties);
  }, [event, properties]);
  return null;
}
