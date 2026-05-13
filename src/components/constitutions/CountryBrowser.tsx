"use client";

import { useMemo, useState, useDeferredValue } from "react";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Search, ChevronRight, Globe2, Scale } from "lucide-react";
import { VoiceDictationButton } from "@/components/voice/dynamic-voice-controls";
import type { Country, LegalSystem, Region } from "@/data/types";
import { LEGAL_SYSTEM_LABELS } from "@/data/types";
import { groupByRegion, REGIONS, LEGAL_SYSTEMS, searchCountries } from "@/lib/jurisdictions";

type Props = {
  countries: Country[];
  popular: Country[];
};

const STATUS_TONE: Record<Country["status"], string> = {
  active: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/30",
  preview: "bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/20",
  planned: "bg-zinc-500/10 text-zinc-500 ring-1 ring-zinc-500/20",
};

export function CountryBrowser({ countries, popular }: Props) {
  const t = useTranslations("countryBrowser");
  const tComposer = useTranslations("chatComposer");
  const [query, setQuery] = useState("");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const deferredQuery = useDeferredValue(query);
  const [region, setRegion] = useState<Region | "All">("All");
  const [system, setSystem] = useState<LegalSystem | "All">("All");

  const filtered = useMemo(() => {
    const base = deferredQuery.trim() ? searchCountries(deferredQuery) : countries;
    return base.filter((country) => {
      const regionOk = region === "All" || country.region === region;
      const systemOk = system === "All" || country.legalSystem === system;
      return regionOk && systemOk;
    });
  }, [deferredQuery, region, system, countries]);

  const grouped = useMemo(() => groupByRegion(filtered), [filtered]);

  const noQuery = !deferredQuery.trim() && region === "All" && system === "All";

  return (
    <div className="space-y-12">
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto] items-stretch">
          <div className="flex flex-col gap-2 min-w-0">
            {voiceError && (
              <p className="text-xs text-amber-700 dark:text-amber-300" role="status">
                {tComposer("voiceErrorBanner", { message: voiceError })}
              </p>
            )}
            <label className="relative block flex-1 min-h-14">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--muted-foreground)]" aria-hidden />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              type="search"
              placeholder={t("placeholder")}
              aria-label={t("searchAria")}
              className="w-full h-14 pl-12 pr-14 rounded-2xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
              <VoiceDictationButton
                value={query}
                onChange={setQuery}
                mode="append"
                surface="constitution"
                onErrorMessage={setVoiceError}
                className="h-10 w-10"
              />
            </span>
          </label>
          </div>
          <select
            value={region}
            onChange={(event) => setRegion(event.target.value as Region | "All")}
            aria-label={t("filterRegionAria")}
            className="h-14 px-4 rounded-2xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          >
            <option value="All">{t("allRegions")}</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <select
            value={system}
            onChange={(event) => setSystem(event.target.value as LegalSystem | "All")}
            aria-label={t("filterSystemAria")}
            className="h-14 px-4 rounded-2xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          >
            <option value="All">{t("allSystems")}</option>
            {LEGAL_SYSTEMS.map((s) => (
              <option key={s} value={s}>{LEGAL_SYSTEM_LABELS[s]}</option>
            ))}
          </select>
        </div>
        <p className="mt-4 text-sm text-[var(--muted-foreground)]">
          {t("showing", { filtered: filtered.length, total: countries.length })}
        </p>
      </div>

      {noQuery && popular.length > 0 && (
        <section aria-labelledby="popular-heading" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 id="popular-heading" className="text-xl font-semibold text-[var(--foreground)] flex items-center gap-2">
              <Globe2 className="h-5 w-5 text-[var(--primary)]" aria-hidden />
              {t("popularHeading")}
            </h2>
            <span className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">{t("tierLabel")}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {popular.map((country, index) => (
              <CountryCard key={country.code} country={country} index={index} />
            ))}
          </div>
        </section>
      )}

      {REGIONS.map((regionName) => {
        const list = grouped[regionName];
        if (list.length === 0) return null;
        return (
          <section key={regionName} aria-labelledby={`region-${regionName}`} className="space-y-4">
            <header className="flex items-baseline justify-between border-b border-[var(--border)] pb-2">
              <h2 id={`region-${regionName}`} className="text-xl font-semibold text-[var(--foreground)]">
                {regionName}
              </h2>
              <span className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">
                {t("countryCount", { count: list.length })}
              </span>
            </header>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {list.map((country, index) => (
                <CountryCard key={country.code} country={country} index={index} compact />
              ))}
            </div>
          </section>
        );
      })}

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[var(--border)] p-12 text-center">
          <Scale className="mx-auto h-10 w-10 text-[var(--muted-foreground)]" aria-hidden />
          <h3 className="mt-4 text-lg font-semibold text-[var(--foreground)]">{t("emptyTitle")}</h3>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">{t("emptyBody")}</p>
        </div>
      )}
    </div>
  );
}

function CountryCard({ country, index, compact }: { country: Country; index: number; compact?: boolean }) {
  const t = useTranslations("countryBrowser");
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.02, 0.4) }}
    >
      <Link
        href={`/constitutions/${country.code.toLowerCase()}`}
        className="group block h-full rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 hover:border-[var(--primary)] hover:shadow-md transition-all"
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <span className="text-3xl leading-none" aria-hidden>{country.flag}</span>
          <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full ${STATUS_TONE[country.status]}`}>
            {t(`status.${country.status}`)}
          </span>
        </div>
        <p className="text-sm font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors line-clamp-2">
          {country.name}
        </p>
        {!compact && (
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">{country.capital}</p>
        )}
        <div className="mt-3 flex items-center justify-between text-xs text-[var(--muted-foreground)]">
          <span>{LEGAL_SYSTEM_LABELS[country.legalSystem]}</span>
          <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden />
        </div>
      </Link>
    </motion.div>
  );
}
