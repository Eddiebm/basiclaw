"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { VerifiedLawyer } from "@/data/verified-lawyers";
import { track } from "@/lib/analytics";

export function LawyersDirectory({ lawyers }: { lawyers: VerifiedLawyer[] }) {
  const t = useTranslations("lawyersPage");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return lawyers;
    return lawyers.filter(
      (l) =>
        l.name.toLowerCase().includes(s) ||
        l.jurisdiction.toLowerCase().includes(s) ||
        l.country.toLowerCase().includes(s) ||
        l.practiceAreas.some((a) => a.toLowerCase().includes(s))
    );
  }, [lawyers, q]);

  const jsonLd =
    lawyers.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: lawyers.map((l, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "Person",
              name: l.name,
              jobTitle: "Lawyer",
              ...(l.aggregateRatingValue != null && l.aggregateRatingCount != null
                ? {
                    aggregateRating: {
                      "@type": "AggregateRating",
                      ratingValue: l.aggregateRatingValue,
                      ratingCount: l.aggregateRatingCount,
                    },
                  }
                : {}),
            },
          })),
        }
      : null;

  return (
    <>
      {jsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      ) : null}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="law-filter">
            {t("filterLabel")}
          </label>
          <input
            id="law-filter"
            className="w-full max-w-md rounded-lg border border-[var(--border)] bg-background px-3 py-2 text-sm"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("filterPlaceholder")}
          />
        </div>
        {filtered.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">{t("empty")}</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {filtered.map((l) => (
              <li key={l.id}>
                <article
                  className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/80 p-4 hover:border-[var(--primary)]/40 transition-colors cursor-default"
                  onClick={() =>
                    track("verified_lawyer_clicked", {
                      lawyer_id: l.id,
                      jurisdiction: l.jurisdiction,
                      country: l.country,
                    })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      track("verified_lawyer_clicked", {
                        lawyer_id: l.id,
                        jurisdiction: l.jurisdiction,
                        country: l.country,
                      });
                    }
                  }}
                  tabIndex={0}
                >
                  <p className="font-semibold text-[var(--foreground)]">{l.name}</p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">{l.jurisdiction}</p>
                  <p className="text-xs mt-2">
                    <span className="text-[var(--muted-foreground)]">{t("practiceAreas")}: </span>
                    {l.practiceAreas.join(", ")}
                  </p>
                  {l.statement ? <p className="text-sm text-[var(--muted-foreground)] mt-2 line-clamp-3">{l.statement}</p> : null}
                </article>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
