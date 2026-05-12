"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { LegalIndexEntry } from "@/lib/legal-index";
import { LEGAL_INDEX_DIMENSION_ORDER, type LegalIndexDimensionId } from "@/lib/legal-index";
import { Button } from "@/components/ui/Button";
import { ArrowRight, ArrowRightLeft, BookText } from "lucide-react";
import { LegalIndexRadar } from "@/components/legal-index/LegalIndexRadar";
import { LegalIndexBars } from "@/components/legal-index/LegalIndexBars";
import { LegalIndexShareRow } from "@/components/legal-index/LegalIndexShareRow";

export function LegalIndexCountryBody({
  entry,
  shareUrl,
  shareTitle,
  compareHref,
  constitutionHref,
}: {
  entry: LegalIndexEntry;
  shareUrl: string;
  shareTitle: string;
  compareHref: string;
  constitutionHref: string;
}) {
  const t = useTranslations("legalIndex");

  const labels = {} as Record<LegalIndexDimensionId, string>;
  for (const id of LEGAL_INDEX_DIMENSION_ORDER) {
    labels[id] = t(`label_${id}` as "label_accessibility");
  }

  return (
    <div className="space-y-12">
      <div
        role="status"
        className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.08] px-4 py-3 text-sm text-amber-950 dark:text-amber-100"
      >
        {t("banner")}
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
        <div className="space-y-6">
          <LegalIndexRadar dimensions={entry.dimensions} labels={labels} caption={t("radarCaption")} />
          <LegalIndexBars dimensions={entry.dimensions} labels={labels} caption={t("barsCaption")} />
        </div>
        <div className="space-y-6">
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-3">
              {t("detailWhyTitle")}
            </h2>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed mb-4">
              Each paragraph below is generated only from BasicLaw&apos;s public fields (legal system, languages, constitution
              summary, key principles, adoption/amendment years, and URLs we list). It is not a review of court practice or
              compliance.
            </p>
            <ul className="space-y-4">
              {LEGAL_INDEX_DIMENSION_ORDER.map((id) => (
                <li key={id} className="rounded-xl border border-[var(--border)] bg-[var(--card)]/80 p-4">
                  <h3 className="font-semibold text-[var(--foreground)]">{labels[id]}</h3>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)] leading-relaxed">{entry.rationales[id]}</p>
                  <p className="mt-2 text-xs text-[var(--muted-foreground)] tabular-nums">Score: {entry.dimensions[id]} / 100</p>
                </li>
              ))}
            </ul>
          </section>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <Button asChild variant="outline" className="gap-2">
              <Link href={compareHref}>
                <ArrowRightLeft className="h-4 w-4" aria-hidden />
                {t("detailCompareCta")}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button asChild className="gap-2">
              <Link href={constitutionHref}>
                <BookText className="h-4 w-4" aria-hidden />
                {t("detailConstitutionCta")}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </div>

          <section aria-label={t("shareHeading")}>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-2">{t("shareHeading")}</h2>
            <LegalIndexShareRow shareUrl={shareUrl} shareTitle={shareTitle} />
          </section>
        </div>
      </div>
    </div>
  );
}
