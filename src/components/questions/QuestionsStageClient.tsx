"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { CitizenQuestion } from "@/data/questions/types";
import { DOMAINS } from "@/data/questions/taxonomy";
import { STRONG_COVERAGE_COUNTRIES } from "@/data/questions/country-coverage";
import { QuestionCard } from "./QuestionCard";
import { DOMAIN_LABEL, STAGE_LABEL } from "./labels";
import { Button } from "@/components/ui/Button";

interface QuestionsStageClientProps {
  stage: string;
  questions: CitizenQuestion[];
}

export function QuestionsStageClient({ stage, questions }: QuestionsStageClientProps) {
  const t = useTranslations("questionsLibrary");
  const [activeCountry, setActiveCountry] = useState("us");
  const title = STAGE_LABEL[stage] ?? stage;

  const byDomain = useMemo(() => {
    const map = new Map<string, CitizenQuestion[]>();
    for (const d of DOMAINS) map.set(d, []);
    for (const q of questions) {
      map.get(q.domain)?.push(q);
    }
    return map;
  }, [questions]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">{t("eyebrow")}</p>
        <h1 className="text-3xl font-bold text-[var(--foreground)]">{t("stageHeading", { stage: title })}</h1>
        <p className="text-sm text-[var(--muted-foreground)] max-w-2xl">{t("stageSubtitle")}</p>
        <div className="flex flex-wrap gap-2 text-xs">
          <Button asChild variant="outline" size="sm">
            <Link href="/questions">{t("allStagesLink")}</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/chat">{t("openChat")}</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/audit/lease">Lease audit</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/audit/employment">Employment audit</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/audit/terms">Terms audit</Link>
          </Button>
        </div>
      </header>

      <div className="mb-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
        <label className="text-xs font-medium text-[var(--muted-foreground)]">
          {t("activeCountry")}
          <select
            value={activeCountry}
            onChange={(e) => setActiveCountry(e.target.value)}
            className="mt-1 w-full max-w-xs rounded-lg border border-[var(--border)] bg-background px-3 py-2 text-sm"
          >
            {STRONG_COVERAGE_COUNTRIES.map((code) => (
              <option key={code} value={code.toLowerCase()}>
                {code}
              </option>
            ))}
            <option value="ie">{t("outsideCoverage")}</option>
          </select>
        </label>
      </div>

      <div className="space-y-10">
        {DOMAINS.map((domain) => {
          const items = byDomain.get(domain) ?? [];
          if (items.length === 0) return null;
          return (
            <section key={domain}>
              <h2 className="mb-3 text-lg font-semibold text-[var(--foreground)]">{DOMAIN_LABEL[domain]}</h2>
              <div className="space-y-3">
                {items.map((q) => (
                  <QuestionCard key={q.id} question={q} activeCountryCodeLower={activeCountry} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
