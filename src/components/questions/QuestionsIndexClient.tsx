"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import type { CitizenQuestion } from "@/data/questions/types";
import { DOMAINS, RISK_FLAGS, STAGES } from "@/data/questions/taxonomy";
import { STRONG_COVERAGE_COUNTRIES } from "@/data/questions/country-coverage";
import { QuestionCard } from "./QuestionCard";
import { DOMAIN_LABEL, STAGE_LABEL } from "./labels";
import { Button } from "@/components/ui/Button";
import { VoiceDictationButton } from "@/components/voice/dynamic-voice-controls";

interface QuestionsIndexClientProps {
  questions: CitizenQuestion[];
}

export function QuestionsIndexClient({ questions }: QuestionsIndexClientProps) {
  const t = useTranslations("questionsLibrary");
  const tComposer = useTranslations("chatComposer");
  const [query, setQuery] = useState("");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [stageFilter, setStageFilter] = useState("");
  const [domainFilter, setDomainFilter] = useState("");
  const [riskFilter, setRiskFilter] = useState("");
  const [activeCountry, setActiveCountry] = useState("us");
  const [openStages, setOpenStages] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(STAGES.map((s) => [s, true]))
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return questions.filter((item) => {
      if (stageFilter && item.stage !== stageFilter) return false;
      if (domainFilter && item.domain !== domainFilter) return false;
      if (riskFilter && item.risk !== riskFilter) return false;
      if (q && !item.question.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [questions, query, stageFilter, domainFilter, riskFilter]);

  const byStage = useMemo(() => {
    const map = new Map<string, CitizenQuestion[]>();
    for (const s of STAGES) map.set(s, []);
    for (const item of filtered) {
      map.get(item.stage)?.push(item);
    }
    return map;
  }, [filtered]);

  const toggleStage = (stage: string) => {
    setOpenStages((prev) => ({ ...prev, [stage]: !prev[stage] }));
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">{t("eyebrow")}</p>
        <h1 className="text-3xl font-bold text-[var(--foreground)]">{t("title")}</h1>
        <p className="text-sm text-[var(--muted-foreground)] max-w-2xl">{t("subtitle")}</p>
      </header>

      <div className="mb-6 grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-xs font-medium text-[var(--muted-foreground)] sm:col-span-2 lg:col-span-1">
          {t("activeCountry")}
          <select
            value={activeCountry}
            onChange={(e) => setActiveCountry(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-background px-3 py-2 text-sm"
          >
            {STRONG_COVERAGE_COUNTRIES.map((code) => (
              <option key={code} value={code.toLowerCase()}>
                {code}
              </option>
            ))}
            <option value="ie">{t("outsideCoverage")}</option>
          </select>
        </label>
        <label className="text-xs font-medium text-[var(--muted-foreground)]">
          {t("stage")}
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-background px-3 py-2 text-sm"
          >
            <option value="">{t("allStages")}</option>
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {STAGE_LABEL[s] ?? s}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-medium text-[var(--muted-foreground)]">
          {t("domain")}
          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-background px-3 py-2 text-sm"
          >
            <option value="">{t("allDomains")}</option>
            {DOMAINS.map((d) => (
              <option key={d} value={d}>
                {DOMAIN_LABEL[d]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-medium text-[var(--muted-foreground)]">
          {t("risk")}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-background px-3 py-2 text-sm"
          >
            <option value="">{t("allRisk")}</option>
            {RISK_FLAGS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-col gap-1 sm:col-span-2 lg:col-span-4">
          {voiceError && (
            <p className="text-xs text-amber-700 dark:text-amber-300" role="status">
              {tComposer("voiceErrorBanner", { message: voiceError })}
            </p>
          )}
          <div className="relative flex gap-2 items-center">
            <div className="relative flex-1 min-w-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("searchPlaceholder")}
                aria-label={t("searchAria")}
                className="w-full rounded-lg border border-[var(--border)] bg-background py-2 pl-9 pr-12 text-sm"
              />
            </div>
            <VoiceDictationButton
              value={query}
              onChange={setQuery}
              mode="append"
              surface="questions"
              onErrorMessage={setVoiceError}
            />
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--muted-foreground)]">
        <span>{t("showingCounts", { filtered: filtered.length, total: questions.length })}</span>
        <Button asChild variant="outline" size="sm">
          <Link href="/chat">{t("openChat")}</Link>
        </Button>
      </div>

      <div className="space-y-4">
        {STAGES.map((stage) => {
          const items = byStage.get(stage) ?? [];
          if (items.length === 0) return null;
          const open = openStages[stage] ?? true;
          return (
            <section key={stage} className="rounded-2xl border border-[var(--border)] bg-[var(--background)]">
              <button
                type="button"
                onClick={() => toggleStage(stage)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
              >
                <div>
                  <h2 className="text-lg font-semibold text-[var(--foreground)]">{STAGE_LABEL[stage] ?? stage}</h2>
                  <p className="text-xs text-[var(--muted-foreground)]">{t("questionCount", { count: items.length })}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/questions/${stage}`}
                    className="text-xs font-medium text-[var(--primary)] hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {t("stagePage")}
                  </Link>
                  {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </div>
              </button>
              {open && (
                <div className="space-y-3 border-t border-[var(--border)] px-4 py-4">
                  {items.map((q) => (
                    <QuestionCard key={q.id} question={q} activeCountryCodeLower={activeCountry} />
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
