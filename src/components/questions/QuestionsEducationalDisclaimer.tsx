"use client";

import { Info } from "lucide-react";

export function QuestionsEducationalDisclaimer() {
  return (
    <div className="mt-12 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-sm text-[var(--muted-foreground)]">
      <div className="flex gap-3">
        <Info className="h-5 w-5 shrink-0 text-[var(--primary)]" aria-hidden />
        <div className="space-y-2">
          <p className="font-medium text-[var(--foreground)]">Educational information only</p>
          <p>
            BasicLaw explains general legal ideas and public legal texts. It is not legal advice, not a lawyer–client
            relationship, and may be incomplete or wrong for your exact situation. Laws change by place and over time.
            For decisions with consequences, speak with a qualified lawyer or a local official helpline.
          </p>
        </div>
      </div>
    </div>
  );
}
