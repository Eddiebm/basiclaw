"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { LawyerPublicMatch } from "@/lib/lawyer-directory";
import { track } from "@/lib/analytics";
import type { AuditType } from "@/lib/audit-types";

export function LawyerAuditMatches({ jurisdictionCode, auditType }: { jurisdictionCode: string; auditType: AuditType }) {
  const t = useTranslations("lawyersPage.auditMatches");
  const [rows, setRows] = useState<LawyerPublicMatch[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(
          `/api/public/lawyer-matches?country=${encodeURIComponent(jurisdictionCode)}&auditType=${encodeURIComponent(auditType)}&limit=3`
        );
        const j = (await res.json()) as { lawyers?: LawyerPublicMatch[] };
        if (!cancelled) setRows(j.lawyers ?? []);
      } catch {
        if (!cancelled) setRows([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [jurisdictionCode, auditType]);

  if (rows === null) {
    return <p className="text-xs text-[var(--muted-foreground)] py-2">{t("loading")}</p>;
  }

  if (rows.length === 0) return null;

  return (
    <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--card)]/60 p-4 space-y-3">
      <p className="text-sm font-semibold text-[var(--foreground)]">{t("title")}</p>
      <ul className="space-y-2">
        {rows.map((l) => (
          <li key={l.slug} className="flex items-center justify-between gap-3 text-sm">
            <div className="min-w-0">
              <p className="font-medium truncate">{l.name}</p>
              <p className="text-[11px] text-[var(--muted-foreground)]">
                {l.kind === "verified" ? t("badgeVerified") : t("badgePartner")} · {l.practiceAreas.slice(0, 2).join(", ")}
              </p>
            </div>
            <Link
              href={`/lawyers/${l.slug}`}
              className="shrink-0 text-[var(--primary)] font-semibold text-xs underline-offset-4 hover:underline"
              onClick={() =>
                track("lawyer_audit_referral_clicked", {
                  slug: l.slug,
                  kind: l.kind,
                  jurisdiction: jurisdictionCode,
                  auditType,
                })
              }
            >
              →
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
