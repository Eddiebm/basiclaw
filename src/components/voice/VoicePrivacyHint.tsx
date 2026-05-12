"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function VoicePrivacyHint({ className }: { className?: string }) {
  const t = useTranslations("voice");
  return (
    <p className={cn(className)}>
      {t("privacyHintLead")}{" "}
      <Link href="/privacy#voice-browser" className="font-medium text-primary underline-offset-4 hover:underline">
        {t("privacyHintLink")}
      </Link>
      .
    </p>
  );
}
