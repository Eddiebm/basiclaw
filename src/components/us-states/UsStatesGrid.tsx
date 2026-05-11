"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Briefcase, Scale, ShieldAlert, Sparkles } from "lucide-react";
import type { UsState } from "@/data/us-states";

const ICONS = {
  rights: Sparkles,
  "police-stop": ShieldAlert,
  landlord: Scale,
  employment: Briefcase,
} as const;

export function UsStatesGrid({ states }: { states: UsState[] }) {
  const t = useTranslations("usStatesIndex");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return states;
    return states.filter(
      (st) =>
        st.name.toLowerCase().includes(s) ||
        st.code.toLowerCase().includes(s) ||
        st.capital.toLowerCase().includes(s)
    );
  }, [q, states]);

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="us-state-search" className="sr-only">
          {t("searchAria")}
        </label>
        <input
          id="us-state-search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchAria")}
          className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
        />
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">{t("mapHint")}</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((state) => (
          <article
            key={state.code}
            id={state.slug}
            className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 scroll-mt-28"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h2 className="text-lg font-semibold text-[var(--foreground)]">{state.name}</h2>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {state.code} · {state.capital}
                </p>
              </div>
              <span className="text-xl" aria-hidden>
                🇺🇸
              </span>
            </div>
            {state.notes && <p className="text-xs text-[var(--muted-foreground)] mb-4 line-clamp-3">{state.notes}</p>}
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(ICONS) as Array<keyof typeof ICONS>).map((topic) => {
                const Icon = ICONS[topic];
                const label =
                  topic === "rights"
                    ? t("topic_rights")
                    : topic === "police-stop"
                      ? t("topic_police")
                      : topic === "landlord"
                        ? t("topic_landlord")
                        : t("topic_employment");
                return (
                  <Link
                    key={topic}
                    href={`/us/${state.slug}/${topic}`}
                    className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)]/70 bg-[var(--background)] px-2.5 py-2 text-xs font-medium text-[var(--foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    <span className="truncate">{label}</span>
                  </Link>
                );
              })}
            </div>
            <Link
              href={`/us/${state.slug}/rights`}
              className="mt-3 inline-flex items-center gap-1 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              {t("openState", { state: state.name })}
              <ArrowRight className="h-3 w-3" aria-hidden />
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
