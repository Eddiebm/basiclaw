"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { LawyerPublicMatch } from "@/lib/lawyer-directory";

export function ChatLawyerDirectoryWidget({ countryCode }: { countryCode: string }) {
  const t = useTranslations("lawyersPage.chatWidget");
  const tLoad = useTranslations("lawyersPage.auditMatches");
  const [rows, setRows] = useState<LawyerPublicMatch[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(`/api/public/lawyer-matches?country=${encodeURIComponent(countryCode)}&limit=3`);
        const j = (await res.json()) as { lawyers?: LawyerPublicMatch[] };
        if (!cancelled) setRows(j.lawyers ?? []);
      } catch {
        if (!cancelled) setRows([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [countryCode]);

  if (rows === null) {
    return <p className="text-xs text-muted-foreground text-center py-2">{tLoad("loading")}</p>;
  }

  if (rows.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-3">
      <p className="text-sm font-semibold text-foreground">{t("title")}</p>
      <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
      <ul className="space-y-2">
        {rows.map((l) => (
          <li key={l.slug} className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/60 p-2">
            <div className="h-10 w-10 rounded-full overflow-hidden bg-muted shrink-0 border border-border">
              {l.headshotUrl ? (
                <Image
                  src={l.headshotUrl}
                  alt=""
                  width={40}
                  height={40}
                  unoptimized
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-xs font-semibold text-muted-foreground">{l.name.slice(0, 1)}</div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{l.name}</p>
              {l.firmName ? <p className="text-[11px] text-muted-foreground truncate">{l.firmName}</p> : null}
            </div>
            <Link href={`/lawyers/${l.slug}`} className="text-xs font-semibold text-primary shrink-0">
              →
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/lawyers" className="block text-center text-xs font-medium text-primary underline-offset-4 hover:underline">
        {t("directoryLink")}
      </Link>
    </div>
  );
}
