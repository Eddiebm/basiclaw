"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { LEGAL_INDEX_DIMENSION_ORDER, type LegalIndexDimensionId, type LegalIndexEntry } from "@/lib/legal-index";
import { REGIONS, LEGAL_SYSTEMS } from "@/lib/jurisdictions";
import { LEGAL_SYSTEM_LABELS } from "@/data/types";
import { track } from "@/lib/analytics";
import { EventTracker } from "@/components/analytics/EventTracker";
import { Navigation } from "@/components/sections/Navigation";
import { Footer } from "@/components/sections/Footer";

const PAGE_SIZE = 18;

type SortKey = "overall" | LegalIndexDimensionId;

function matchesRow(
  row: LegalIndexEntry,
  region: string,
  legal: string,
  language: string,
  q: string
): boolean {
  if (region && row.region !== region) return false;
  if (legal && row.legalSystem !== legal) return false;
  if (language) {
    const needle = language.toLowerCase();
    if (!row.languages.some((l) => l.toLowerCase().includes(needle))) return false;
  }
  if (q.trim()) {
    const t = q.trim().toLowerCase();
    if (!row.name.toLowerCase().includes(t) && !row.code.toLowerCase().includes(t)) return false;
  }
  return true;
}

function sortRows(rows: LegalIndexEntry[], sort: SortKey): LegalIndexEntry[] {
  const copy = rows.slice();
  copy.sort((a, b) => {
    const va = sort === "overall" ? a.overall : a.dimensions[sort];
    const vb = sort === "overall" ? b.overall : b.dimensions[sort];
    return vb - va;
  });
  return copy;
}

export function LegalIndexLandingClient({
  entries,
  topTen,
  languageOptions,
}: {
  entries: LegalIndexEntry[];
  topTen: LegalIndexEntry[];
  languageOptions: string[];
}) {
  const t = useTranslations("legalIndex");
  const [region, setRegion] = useState("");
  const [legal, setLegal] = useState("");
  const [language, setLanguage] = useState("");
  const [sort, setSort] = useState<SortKey>("overall");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const skipTrack = useRef(true);

  const filtered = useMemo(
    () => entries.filter((row) => matchesRow(row, region, legal, language, q)),
    [entries, region, legal, language, q]
  );

  const sorted = useMemo(() => sortRows(filtered, sort), [filtered, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const slice = sorted.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  useEffect(() => {
    if (skipTrack.current) {
      skipTrack.current = false;
      return;
    }
    track("index_filter_applied", {
      region: region || "all",
      legal_system: legal || "all",
      language: language || "all",
      sort,
      query: q.trim() || null,
    });
  }, [region, legal, language, sort, q]);

  const sortLabel = (k: SortKey) =>
    k === "overall" ? t("sortOverall") : t(`sort_${k}` as "sort_accessibility");

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <EventTracker event="index_viewed" />
      <main id="main-content" className="flex-1 pt-24 sm:pt-28 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            role="status"
            className="mb-8 rounded-2xl border border-amber-500/30 bg-amber-500/[0.08] px-4 py-3 text-sm text-amber-950 dark:text-amber-100"
          >
            {t("banner")}
          </div>

          <header className="mb-12 max-w-3xl">
            <h1 className="font-editorial text-4xl sm:text-5xl text-[var(--foreground)] tracking-tight">{t("heroTitle")}</h1>
            <p className="mt-4 text-lg text-[var(--muted-foreground)] leading-relaxed">{t("heroSubtitle")}</p>
          </header>

          <section aria-labelledby="leaderboard-heading" className="mb-14">
            <h2 id="leaderboard-heading" className="text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-4">
              {t("leaderboardTitle")}
            </h2>
            <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {topTen.map((row, i) => (
                <li key={row.code}>
                  <Link
                    href={`/the-index/${row.code.toLowerCase()}`}
                    className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)]/90 p-4 hover:border-[var(--primary)]/40 transition-colors"
                  >
                    <span className="text-xs font-bold text-[var(--muted-foreground)] w-5">{i + 1}</span>
                    <span className="text-2xl" aria-hidden>
                      {row.flag}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-[var(--foreground)] truncate">{row.name}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {row.grade} · {row.overall}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          </section>

          <section className="mb-8 space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)]/60 p-4 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-[var(--muted-foreground)]">{t("filterRegion")}</span>
                <select
                  value={region}
                  onChange={(e) => {
                    setRegion(e.target.value);
                    setPage(1);
                  }}
                  className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)]"
                >
                  <option value="">{t("all")}</option>
                  {REGIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-[var(--muted-foreground)]">{t("filterLegal")}</span>
                <select
                  value={legal}
                  onChange={(e) => {
                    setLegal(e.target.value);
                    setPage(1);
                  }}
                  className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)]"
                >
                  <option value="">{t("all")}</option>
                  {LEGAL_SYSTEMS.map((ls) => (
                    <option key={ls} value={ls}>
                      {LEGAL_SYSTEM_LABELS[ls]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-[var(--muted-foreground)]">{t("filterLanguage")}</span>
                <select
                  value={language}
                  onChange={(e) => {
                    setLanguage(e.target.value);
                    setPage(1);
                  }}
                  className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)]"
                >
                  <option value="">{t("all")}</option>
                  {languageOptions.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-[var(--muted-foreground)]">{t("filterSort")}</span>
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value as SortKey);
                    setPage(1);
                  }}
                  className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)]"
                >
                  <option value="overall">{sortLabel("overall")}</option>
                  {LEGAL_INDEX_DIMENSION_ORDER.map((id) => (
                    <option key={id} value={id}>
                      {sortLabel(id)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="flex flex-col gap-1 text-sm max-w-xl">
              <span className="text-[var(--muted-foreground)]">{t("searchLabel")}</span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)]"
                type="search"
                autoComplete="off"
              />
            </label>
          </section>

          <div className="mb-3 text-sm text-[var(--muted-foreground)]">
            {t("pageStatus", { page: pageSafe, totalPages, count: sorted.length })}
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[var(--border)]">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-[var(--accent)]/40 text-[var(--muted-foreground)]">
                <tr>
                  <th scope="col" className="px-3 py-3 font-medium w-10">
                    {t("tableRank")}
                  </th>
                  <th scope="col" className="px-3 py-3 font-medium">
                    {t("tableCountry")}
                  </th>
                  <th scope="col" className="px-3 py-3 font-medium">
                    {t("tableGrade")}
                  </th>
                  <th scope="col" className="px-3 py-3 font-medium">
                    {t("tableOverall")}
                  </th>
                  <th scope="col" className="px-3 py-3 font-medium">
                    {t("tableRegion")}
                  </th>
                  <th scope="col" className="px-3 py-3 font-medium">
                    {t("tableLegal")}
                  </th>
                  <th scope="col" className="px-3 py-3 font-medium">
                    {t("tableView")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {slice.map((row, idx) => (
                  <tr key={row.code} className="border-t border-[var(--border)] hover:bg-[var(--accent)]/25">
                    <td className="px-3 py-3 text-[var(--muted-foreground)]">{(pageSafe - 1) * PAGE_SIZE + idx + 1}</td>
                    <td className="px-3 py-3">
                      <span className="mr-2" aria-hidden>
                        {row.flag}
                      </span>
                      <span className="font-medium text-[var(--foreground)]">{row.name}</span>
                    </td>
                    <td className="px-3 py-3 font-semibold">{row.grade}</td>
                    <td className="px-3 py-3 tabular-nums">{row.overall}</td>
                    <td className="px-3 py-3 text-[var(--muted-foreground)]">{row.region}</td>
                    <td className="px-3 py-3 text-[var(--muted-foreground)]">{LEGAL_SYSTEM_LABELS[row.legalSystem]}</td>
                    <td className="px-3 py-3">
                      <Link href={`/the-index/${row.code.toLowerCase()}`} className="text-[var(--primary)] font-medium underline-offset-2 hover:underline">
                        {t("tableView")}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <nav className="mt-6 flex flex-wrap items-center justify-between gap-3" aria-label={t("paginationNavAria")}>
            <button
              type="button"
              disabled={pageSafe <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium disabled:opacity-40"
            >
              {t("paginationPrev")}
            </button>
            <button
              type="button"
              disabled={pageSafe >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium disabled:opacity-40"
            >
              {t("paginationNext")}
            </button>
          </nav>

          <details className="mt-16 rounded-2xl border border-[var(--border)] bg-[var(--card)]/50 p-6">
            <summary className="cursor-pointer text-lg font-semibold text-[var(--foreground)]">{t("methodologyTitle")}</summary>
            <div className="mt-4 space-y-4 text-sm text-[var(--muted-foreground)] leading-relaxed">
              <p className="text-[var(--foreground)] font-medium">{t("methodologyLead")}</p>
              <p>{t("methodologyIntro")}</p>
              <p>{t("weightsLine")}</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>{t("dim_accessibility")}</li>
                <li>{t("dim_plainLanguage")}</li>
                <li>{t("dim_rightsProtection")}</li>
                <li>{t("dim_judicialIndependence")}</li>
                <li>{t("dim_citizenEmpowerment")}</li>
                <li>{t("dim_constitutionalClarity")}</li>
                <li>{t("dim_crossJurisdiction")}</li>
              </ul>
              <p className="font-semibold text-[var(--foreground)]">{t("limitationsTitle")}</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>{t("limitation1")}</li>
                <li>{t("limitation2")}</li>
                <li>{t("limitation3")}</li>
              </ul>
            </div>
          </details>
        </div>
      </main>
      <Footer />
    </div>
  );
}
