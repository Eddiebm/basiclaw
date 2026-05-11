"use client";

import { useCallback, useMemo, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { Country } from "@/data/types";
import { COMPARE_TOPICS, type CompareTopic, type ComparePanel } from "@/lib/compare-highlights";
import { EventTracker } from "@/components/analytics/EventTracker";
import { Button } from "@/components/ui/Button";
import { ArrowRightLeft } from "lucide-react";

export function CompareClient({
  initialA,
  initialB,
  initialTopic,
  countries,
  panels,
}: {
  initialA: string;
  initialB: string;
  initialTopic: CompareTopic;
  countries: Pick<Country, "code" | "name" | "flag">[];
  panels: { a: ComparePanel; b: ComparePanel };
}) {
  const t = useTranslations("comparePage");
  const router = useRouter();
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

  return (
    <div className="space-y-8">
      <EventTracker event="compare_viewed" properties={{ a: initialA, b: initialB, topic: initialTopic }} />

      <div className="grid lg:grid-cols-3 gap-4 items-end">
        <label className="block">
          <span className="block text-xs uppercase tracking-wider text-[var(--muted-foreground)] mb-1">{t("countryA")}</span>
          <select
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
            value={initialA.toUpperCase()}
            disabled={pending}
            onChange={(e) => pushQuery({ a: e.target.value, b: initialB, topic: initialTopic })}
          >
            {sortedCountries.map((c) => (
              <option key={c.code} value={c.code.toUpperCase()}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>
        </label>

        <div className="flex justify-center">
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

        <label className="block">
          <span className="block text-xs uppercase tracking-wider text-[var(--muted-foreground)] mb-1">{t("countryB")}</span>
          <select
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
            value={initialB.toUpperCase()}
            disabled={pending}
            onChange={(e) => pushQuery({ a: initialA, b: e.target.value, topic: initialTopic })}
          >
            {sortedCountries.map((c) => (
              <option key={`b-${c.code}`} value={c.code.toUpperCase()}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>
        </label>

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
        <CompareCard side="A" panel={panels.a} topicLabel={t(`topics.${initialTopic}`)} />
        <CompareCard side="B" panel={panels.b} topicLabel={t(`topics.${initialTopic}`)} />
      </div>

      <p className="text-xs text-[var(--muted-foreground)]">{t("shareHint")}</p>
    </div>
  );
}

function CompareCard({ side, panel, topicLabel }: { side: "A" | "B"; panel: ComparePanel; topicLabel: string }) {
  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8">
      <p className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] mb-1">{side}</p>
      <h2 className="text-xl font-semibold text-[var(--foreground)] mb-3">
        {panel.headline} · {topicLabel}
      </h2>
      <p className="text-sm text-[var(--muted-foreground)] leading-relaxed mb-4">{panel.excerpt}</p>
      <ul className="space-y-2">
        {panel.bullets.map((b, idx) => (
          <li key={`${side}-${idx}-${b.slice(0, 24)}`} className="flex items-start gap-2 text-sm text-[var(--foreground)]">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--primary)] flex-shrink-0" aria-hidden />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
