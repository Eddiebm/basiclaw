"use client";

import { useCallback, useMemo, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { Country } from "@/data/types";
import {
  COMPARE_TOPICS,
  legalSystemsMatch,
  type CompareNarrativeFacts,
  type CompareSidePayload,
  type CompareTopic,
} from "@/lib/compare-shared";
import { EventTracker } from "@/components/analytics/EventTracker";
import { Button } from "@/components/ui/Button";
import { ArrowRightLeft, ExternalLink } from "lucide-react";
import { CompareCountryPicker } from "@/components/compare/CompareCountryPicker";

export function CompareClient({
  initialA,
  initialB,
  initialTopic,
  countries,
  panels,
  narrativeFacts,
}: {
  initialA: string;
  initialB: string;
  initialTopic: CompareTopic;
  countries: Pick<Country, "code" | "name" | "flag" | "region" | "legalSystem">[];
  panels: { a: CompareSidePayload; b: CompareSidePayload };
  narrativeFacts: CompareNarrativeFacts;
}) {
  const t = useTranslations("comparePage");
  const router = useRouter();
  const locale = useLocale();
  const [pending, startTransition] = useTransition();

  const sortedCountries = useMemo(() => countries.slice().sort((x, y) => x.name.localeCompare(y.name)), [countries]);

  const pushQuery = useCallback(
    (next: { a: string; b: string; topic: CompareTopic }) => {
      const qs = new URLSearchParams({
        a: next.a.toUpperCase(),
        b: next.b.toUpperCase(),
        topic: next.topic,
      });
      startTransition(() => {
        router.replace(`/compare?${qs.toString()}`);
      });
    },
    [router]
  );

  const similaritiesItems = useMemo(() => {
    const items: string[] = [];
    if (legalSystemsMatch(narrativeFacts.aSystem, narrativeFacts.bSystem)) {
      items.push(t("narrativeLegalSame", { system: narrativeFacts.aSystemLabel }));
    }
    if (narrativeFacts.aTopicPrinciples > 0 && narrativeFacts.bTopicPrinciples > 0) {
      items.push(t("narrativePrinciplesBoth", { topic: narrativeFacts.topicLabel }));
    }
    if (items.length === 0) {
      items.push(t("similaritiesFallback", { a: narrativeFacts.aName, b: narrativeFacts.bName }));
    }
    return items;
  }, [narrativeFacts, t]);

  const differencesItems = useMemo(() => {
    const items: string[] = [];
    if (!legalSystemsMatch(narrativeFacts.aSystem, narrativeFacts.bSystem)) {
      items.push(
        t("narrativeLegalDiff", {
          a: narrativeFacts.aName,
          b: narrativeFacts.bName,
          sysA: narrativeFacts.aSystemLabel,
          sysB: narrativeFacts.bSystemLabel,
        })
      );
    }
    const bothHit = narrativeFacts.aTopicPrinciples > 0 && narrativeFacts.bTopicPrinciples > 0;
    if (!bothHit) {
      items.push(
        t("narrativePrinciplesGap", {
          topic: narrativeFacts.topicLabel,
          a: narrativeFacts.aName,
          b: narrativeFacts.bName,
        })
      );
    }
    if (narrativeFacts.aVerified !== narrativeFacts.bVerified) {
      items.push(
        t("diffVerifiedDates", {
          a: narrativeFacts.aName,
          b: narrativeFacts.bName,
          aDate: narrativeFacts.aVerified,
          bDate: narrativeFacts.bVerified,
        })
      );
    }
    if (items.length === 0) {
      items.push(t("differencesFallback"));
    }
    return items;
  }, [narrativeFacts, t]);

  const verifiedLine = useMemo(
    () =>
      t("narrativeVerified", {
        a: narrativeFacts.aName,
        b: narrativeFacts.bName,
        aDate: narrativeFacts.aVerified,
        bDate: narrativeFacts.bVerified,
      }),
    [narrativeFacts, t]
  );

  return (
    <div className="space-y-8">
      <EventTracker
        key={`${initialA}-${initialB}-${initialTopic}-${locale}`}
        event="comparison_viewed"
        properties={{ a: initialA, b: initialB, topic: initialTopic, locale }}
      />

      <div className="grid lg:grid-cols-3 gap-4 items-end">
        <CompareCountryPicker
          id="compare-country-a"
          label={t("countryA")}
          countries={sortedCountries}
          valueCode={initialA}
          disabled={pending}
          excludeCode={initialB}
          onSelect={(code) => pushQuery({ a: code, b: initialB, topic: initialTopic })}
        />

        <div className="flex justify-center pb-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={pending}
            onClick={() => pushQuery({ a: initialB, b: initialA, topic: initialTopic })}
          >
            <ArrowRightLeft className="h-4 w-4" aria-hidden />
            {t("swap")}
          </Button>
        </div>

        <CompareCountryPicker
          id="compare-country-b"
          label={t("countryB")}
          countries={sortedCountries}
          valueCode={initialB}
          disabled={pending}
          excludeCode={initialA}
          onSelect={(code) => pushQuery({ a: initialA, b: code, topic: initialTopic })}
        />

        <label className="block lg:col-span-3">
          <span className="block text-xs uppercase tracking-wider text-[var(--muted-foreground)] mb-1">{t("topic")}</span>
          <select
            className="w-full max-w-xl rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
            value={initialTopic}
            disabled={pending}
            onChange={(e) => pushQuery({ a: initialA, b: initialB, topic: e.target.value as CompareTopic })}
          >
            {COMPARE_TOPICS.map((topic) => (
              <option key={topic} value={topic}>
                {t(`topics.${topic}`)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <CompareCard
          panel={panels.a}
          topicLabel={t(`topics.${initialTopic}`)}
          principlesHeading={t("keyPrinciplesHeading")}
          sourcesHeading={t("sourcesHeading")}
          lastVerifiedLabel={t("lastVerifiedLabel", { date: panels.a.lastVerified })}
        />
        <CompareCard
          panel={panels.b}
          topicLabel={t(`topics.${initialTopic}`)}
          principlesHeading={t("keyPrinciplesHeading")}
          sourcesHeading={t("sourcesHeading")}
          lastVerifiedLabel={t("lastVerifiedLabel", { date: panels.b.lastVerified })}
        />
      </div>

      <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8 space-y-6">
        <h2 className="text-sm uppercase tracking-wider text-[var(--muted-foreground)]">{t("narrativeTitle")}</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-3">
              {t("similaritiesTitle")}
            </h3>
            <ul className="space-y-2 text-sm text-[var(--foreground)] leading-relaxed list-disc pl-5">
              {similaritiesItems.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-3">
              {t("differencesTitle")}
            </h3>
            <ul className="space-y-2 text-sm text-[var(--foreground)] leading-relaxed list-disc pl-5">
              {differencesItems.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </div>
        <p className="text-xs text-[var(--muted-foreground)] leading-relaxed border-t border-[var(--border)]/60 pt-4">
          {verifiedLine}
        </p>
      </section>

      <p className="text-xs text-[var(--muted-foreground)]">{t("shareHint")}</p>
    </div>
  );
}

function CompareCard({
  panel,
  topicLabel,
  principlesHeading,
  sourcesHeading,
  lastVerifiedLabel,
}: {
  panel: CompareSidePayload;
  topicLabel: string;
  principlesHeading: string;
  sourcesHeading: string;
  lastVerifiedLabel: string;
}) {
  return (
    <article className="rounded-3xl border border-[var(--border)] bg-[var(--card)] overflow-hidden flex flex-col">
      <header className="border-b border-[var(--border)] bg-[var(--accent)]/30 px-6 py-4 flex flex-wrap items-center gap-3">
        <span className="text-3xl leading-none" aria-hidden>
          {panel.flag}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-wider text-[var(--muted-foreground)]">{topicLabel}</p>
          <h2 className="text-lg font-semibold text-[var(--foreground)] truncate">
            {panel.name} · {panel.yearAdopted}
          </h2>
          <p className="text-xs text-[var(--muted-foreground)] line-clamp-2">{panel.constitutionTitle}</p>
        </div>
      </header>
      <div className="p-6 sm:p-8 flex flex-col flex-1 gap-5">
        <section>
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-2">{panel.sectionHeading}</h3>
          <p className="text-sm text-[var(--muted-foreground)] leading-relaxed whitespace-pre-wrap">{panel.sectionBody}</p>
        </section>
        <section>
          <h3 className="text-xs uppercase tracking-wider text-[var(--muted-foreground)] mb-2">{principlesHeading}</h3>
          <ul className="space-y-2">
            {panel.keyPrinciples.map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm text-[var(--foreground)]">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--primary)] flex-shrink-0" aria-hidden />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="mt-auto pt-2 border-t border-[var(--border)]/60">
          <h3 className="text-xs uppercase tracking-wider text-[var(--muted-foreground)] mb-2">{sourcesHeading}</h3>
          {panel.sources.length > 0 ? (
            <ul className="space-y-2">
              {panel.sources.map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-start gap-1.5 text-sm text-[var(--primary)] hover:underline underline-offset-4"
                  >
                    <ExternalLink className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" aria-hidden />
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-[var(--muted-foreground)]">—</p>
          )}
          <p className="mt-3 text-[10px] text-[var(--muted-foreground)]">
            <time dateTime={panel.lastVerified}>{lastVerifiedLabel}</time>
          </p>
        </section>
      </div>
    </article>
  );
}
