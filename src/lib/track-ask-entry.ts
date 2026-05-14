import { track } from "@/lib/analytics";

export type AskEntrySurface =
  | "hero_primary"
  | "hero_card"
  | "nav_desktop_link"
  | "nav_mobile_link"
  | "nav_mobile_cta"
  | "nav_desktop_cta";

let lastKey = "";
let lastAt = 0;

/** Fire PostHog `ask_entry_clicked` with light dedupe (double events from label+icon clicks). */
export function trackAskEntryClick(surface: AskEntrySurface): void {
  const now = Date.now();
  const key = `${surface}`;
  if (key === lastKey && now - lastAt < 400) return;
  lastKey = key;
  lastAt = now;
  track("ask_entry_clicked", { surface });
}
