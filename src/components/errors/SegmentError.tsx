"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

export function SegmentError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("errors");
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
      <h2 className="text-lg font-semibold text-[var(--foreground)]">{t("title")}</h2>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">{t("body")}</p>
      <Button type="button" className="mt-6" onClick={() => reset()}>
        {t("retry")}
      </Button>
    </div>
  );
}
