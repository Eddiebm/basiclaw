"use client";

import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Globe, Map, Search, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { LEGAL_SYSTEM_LABELS } from "@/data/types";
import { COUNTRIES } from "@/data/countries";
import { countryStats, getPopularCountries, groupByRegion, searchCountries, REGIONS } from "@/lib/jurisdictions";
import { track } from "@/lib/analytics";
import type { Region } from "@/data/types";
import { fadeUpContainer, fadeUpItem } from "@/lib/motion-variants";

export function CountrySelector() {
  const t = useTranslations("countrySelector");
  const stats = countryStats();
  const popular = getPopularCountries();
  const reduce = useReducedMotion();
  const byRegion = useMemo(() => groupByRegion(), []);
  const regions = useMemo(() => REGIONS.filter((r) => byRegion[r].length > 0), [byRegion]);
  const [region, setRegion] = useState<Region>(() => regions[0] ?? "Africa");
  const [query, setQuery] = useState("");

  const matches = useMemo(() => {
    if (!query.trim()) return [];
    return searchCountries(query).slice(0, 8);
  }, [query]);

  const regionList = byRegion[region] ?? [];
  const previewCountry = regionList[0] ?? popular[0] ?? COUNTRIES[0];

  return (
    <section id="countries" className="border-b border-[var(--border)]/60 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeUpContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="text-center"
        >
          <motion.span variants={fadeUpItem} className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)]/70 px-3 py-1 text-xs font-medium text-[var(--muted-foreground)] backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-[var(--primary)]" aria-hidden />
            {t("badge")}
          </motion.span>
          <motion.h2 variants={fadeUpItem} className="mt-4 font-editorial text-4xl text-[var(--foreground)] sm:text-5xl">
            {t("title")}
          </motion.h2>
          <motion.p variants={fadeUpItem} className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-[var(--muted-foreground)]">
            {t("subtitle", { count: stats.total })}
          </motion.p>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 140, damping: 22 }}
          className="relative mx-auto mt-12 max-w-2xl"
        >
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--muted-foreground)]" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("searchPlaceholder", { count: stats.total })}
            aria-label={t("searchAria")}
            className="h-14 w-full rounded-2xl border border-[var(--border)] bg-[var(--card)]/90 pl-12 pr-36 text-[var(--foreground)] shadow-paper backdrop-blur-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
          <Button asChild className="absolute right-2 top-1/2 -translate-y-1/2 gap-1 rounded-xl">
            <Link href="/constitutions">
              {t("viewAll")} <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
          {matches.length > 0 && (
            <ul className="absolute left-0 right-0 top-full z-10 mt-2 max-h-72 overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface-glass)] shadow-paper backdrop-blur-xl">
              {matches.map((country) => (
                <li key={country.code} className="border-b border-[var(--border)]/60 last:border-0">
                  <Link
                    href={`/constitutions/${country.code.toLowerCase()}`}
                    onClick={() => {
                      setQuery("");
                      track("country_selected", { country_code: country.code, country: country.name, source: "country_search" });
                    }}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm transition hover:bg-[var(--accent)]/40"
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-2xl" aria-hidden>
                        {country.flag}
                      </span>
                      <span>
                        <span className="block font-medium text-[var(--foreground)]">{country.name}</span>
                        <span className="block text-xs text-[var(--muted-foreground)]">
                          {country.region} · {LEGAL_SYSTEM_LABELS[country.legalSystem]}
                        </span>
                      </span>
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--primary)]">{t("openConstitution")}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </motion.div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_minmax(0,340px)] lg:items-start">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
              <Map className="h-4 w-4 text-[var(--primary)]" aria-hidden />
              {t("regionsEyebrow")}
            </div>
            <div
              role="tablist"
              aria-label={t("regionsEyebrow")}
              className="mt-4 flex flex-wrap gap-2"
            >
              {regions.map((r) => (
                <button
                  key={r}
                  type="button"
                  role="tab"
                  aria-selected={region === r}
                  onClick={() => {
                    setRegion(r);
                    setQuery("");
                  }}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    region === r
                      ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--foreground)]"
                      : "border-[var(--border)] bg-[var(--card)]/60 text-[var(--muted-foreground)] hover:border-[var(--primary)]/30"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <ul aria-label={t("listAria")} className="mt-6 grid max-h-[420px] gap-2 overflow-y-auto sm:grid-cols-2">
              {regionList.map((country, index) => (
                <motion.li
                  key={country.code}
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: Math.min(index * 0.02, 0.24) }}
                >
                  <Link
                    href={`/constitutions/${country.code.toLowerCase()}`}
                    onClick={() => track("country_selected", { country_code: country.code, country: country.name, source: "country_region_list" })}
                    className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                      previewCountry.code === country.code
                        ? "border-[var(--primary)]/50 bg-[var(--primary)]/5"
                        : "border-[var(--border)]/80 bg-[var(--card)]/50 hover:border-[var(--primary)]/25"
                    }`}
                  >
                    <span className="text-xl" aria-hidden>
                      {country.flag}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-[var(--foreground)]">{country.name}</span>
                      <span className="block truncate text-xs text-[var(--muted-foreground)]">{LEGAL_SYSTEM_LABELS[country.legalSystem]}</span>
                    </span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>

          <motion.aside
            layout
            className="relative overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[var(--surface-glass)] p-6 shadow-paper backdrop-blur-xl"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted-foreground)]">{t("featuredLabel")}</p>
            <div className="mt-4 flex items-start gap-4">
              <span className="text-5xl leading-none" aria-hidden>
                {previewCountry.flag}
              </span>
              <div className="min-w-0">
                <h3 className="font-editorial text-2xl text-[var(--foreground)]">{previewCountry.name}</h3>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">{LEGAL_SYSTEM_LABELS[previewCountry.legalSystem]}</p>
              </div>
            </div>
            <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">{t("snapshotLabel")}</p>
            <p className="mt-2 line-clamp-6 text-sm leading-relaxed text-[var(--foreground)]/90">{previewCountry.constitution.summary}</p>
            <Button asChild className="mt-6 w-full gap-2 rounded-xl">
              <Link
                href={`/constitutions/${previewCountry.code.toLowerCase()}`}
                onClick={() =>
                  track("country_selected", {
                    country_code: previewCountry.code,
                    country: previewCountry.name,
                    source: "atlas_featured",
                  })
                }
              >
                {t("openConstitution")} <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <p className="mt-4 text-xs leading-relaxed text-[var(--muted-foreground)]">{t("atlasIntro")}</p>
          </motion.aside>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <p className="text-sm text-[var(--muted-foreground)]">{t("lookingFor")}</p>
          <Button asChild variant="ghost" className="gap-2 rounded-full">
            <Link href="/constitutions">
              <Globe className="h-4 w-4" aria-hidden /> {t("browseAllLong", { count: COUNTRIES.length })}
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
