"use client";

import { useTranslations } from "next-intl";
import { ReadAloudButton } from "@/components/voice/ReadAloudButton";

export function ConstitutionPlainSummaryVoice({
  summary,
  jurisdictionCode,
}: {
  summary: string;
  jurisdictionCode: string;
}) {
  const t = useTranslations("voice");
  if (!summary.trim()) return null;

  const text = `${t("constitutionSummaryLead")} ${summary.trim()}`;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <ReadAloudButton
        text={text}
        surface="constitution"
        dialectHints={[jurisdictionCode.toLowerCase()]}
        size="sm"
        label={t("listenToSummary")}
        className="h-8 px-2 text-xs"
      />
    </div>
  );
}
