"use client";

import { sendEmbedTelemetry } from "@/lib/embed-telemetry-client";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://basiclaw.app";

export function EmbedPoweredBy() {
  return (
    <footer className="mt-4 border-t border-[var(--border)] pt-3 text-center text-[11px] text-muted-foreground">
      <a
        href={SITE}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-primary underline-offset-2 hover:underline"
        onClick={() => sendEmbedTelemetry("embed_link_clicked", { target: "powered_by", href: SITE })}
      >
        Powered by BasicLaw
      </a>
    </footer>
  );
}
