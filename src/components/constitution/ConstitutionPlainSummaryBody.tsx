"use client";

import { MarkdownContent } from "@/components/markdown/MarkdownContent";
import { ConstitutionPlainSummaryVoice } from "@/components/voice/ConstitutionPlainSummaryVoice";

export function ConstitutionPlainSummaryBody({
  summary,
  jurisdictionCode,
}: {
  summary: string;
  jurisdictionCode: string;
}) {
  return (
    <>
      <MarkdownContent
        markdown={summary}
        className="text-lg text-[var(--foreground)] sm:text-xl [&_p]:leading-[1.75] sm:[&_p]:leading-[1.72] text-pretty"
      />
      <ConstitutionPlainSummaryVoice summary={summary} jurisdictionCode={jurisdictionCode} />
    </>
  );
}
