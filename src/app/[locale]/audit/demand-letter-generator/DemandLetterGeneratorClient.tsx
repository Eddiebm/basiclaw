"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { ArrowRight, Loader2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { VoiceDictationButton } from "@/components/voice/VoiceDictationButton";
import { VoicePrivacyHint } from "@/components/voice/VoicePrivacyHint";
import { getPopularCountries } from "@/lib/jurisdictions";
import { AuditReportCard } from "@/components/audit/AuditReportCard";
import type { AuditReport } from "@/lib/audit-types";
import { track } from "@/lib/analytics";
import { COUNTRIES } from "@/data/countries";

const MIN_COMPILED_CHARS = 200;

export function DemandLetterGeneratorClient() {
  const t = useTranslations("demandLetterGenerator");
  const tComposer = useTranslations("chatComposer");
  const locale = useLocale();
  const popularCountries = useMemo(() => getPopularCountries(8), []);
  const [fromParty, setFromParty] = useState("");
  const [toParty, setToParty] = useState("");
  const [subject, setSubject] = useState("");
  const [facts, setFacts] = useState("");
  const [relief, setRelief] = useState("");
  const [daysToRespond, setDaysToRespond] = useState("14");
  const [jurisdiction, setJurisdiction] = useState("us");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<AuditReport | null>(null);
  const [paywall, setPaywall] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const compileText = useCallback(() => {
    const parts = [
      `DEMAND LETTER OUTLINE (educational draft)`,
      ``,
      `From: ${fromParty.trim()}`,
      `To: ${toParty.trim()}`,
      `Re: ${subject.trim()}`,
      ``,
      `Facts and timeline:`,
      facts.trim(),
      ``,
      `Relief sought:`,
      relief.trim(),
      ``,
      `Requested response within: ${daysToRespond.trim()} days from receipt.`,
      ``,
      `This text was assembled from a structured form for risk review. It is not a final letter for service or filing.`,
    ];
    return parts.join("\n");
  }, [fromParty, toParty, subject, facts, relief, daysToRespond]);

  async function submit() {
    setError(null);
    setPaywall(false);
    if (!fromParty.trim() || !toParty.trim() || !subject.trim() || !facts.trim() || !relief.trim()) {
      setError(t("validation"));
      return;
    }
    const text = compileText();
    if (text.length < MIN_COMPILED_CHARS) {
      setError(t("validation"));
      return;
    }

    setSubmitting(true);
    setReport(null);
    track("audit_started", {
      auditType: "demand_letter",
      audit_type: "demand_letter",
      jurisdiction,
      input_type: "form",
      char_count: text.length,
    });
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "content-type": "application/json", "x-basiclaw-locale": locale },
        body: JSON.stringify({
          text,
          jurisdiction,
          documentType: `Demand letter: ${subject.trim()}`,
          auditType: "demand_letter",
        }),
      });
      const json = (await res.json()) as {
        report?: AuditReport;
        error?: string;
        message?: string;
        upgradeUrl?: string;
      };
      if (res.status === 429) {
        const upgrade = json.upgradeUrl?.trim();
        if (typeof window !== "undefined" && upgrade?.startsWith("/")) {
          window.location.assign(`${window.location.origin}${upgrade}`);
          return;
        }
        setPaywall(true);
        setError(json.message ?? t("paywallBody"));
        track("demand_letter_paywall", { jurisdiction, reason: json.error ?? "quota" });
        return;
      }
      if (json.report) {
        setReport(json.report);
        track("audit_completed", {
          auditType: json.report.auditType,
          audit_type: json.report.auditType,
          jurisdiction: json.report.jurisdictionCode,
          document_type: json.report.documentType,
          risk_grade: json.report.overallRiskGrade,
          red_flags: json.report.redFlags.length,
        });
      } else {
        setError(json.message ?? json.error ?? t("failed"));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("network"));
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setReport(null);
    setError(null);
    setPaywall(false);
  }

  if (report) {
    return (
      <div className="space-y-6">
        <AuditReportCard
          report={report}
          onShared={() =>
            track("audit_shared", {
              auditType: report.auditType,
              audit_type: report.auditType,
              jurisdiction: report.jurisdictionCode,
              risk_grade: report.overallRiskGrade,
            })
          }
        />
        <div className="flex justify-center">
          <Button variant="outline" onClick={reset}>
            {t("another")}
          </Button>
        </div>
      </div>
    );
  }

  if (paywall) {
    return (
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 text-center space-y-4">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">{t("paywallTitle")}</h2>
        <p className="text-sm text-[var(--muted-foreground)]">{t("paywallBody")}</p>
        <Button asChild>
          <Link href="/pricing">
            {t("paywallCta")}
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
          </Link>
        </Button>
        <div>
          <Button variant="ghost" size="sm" onClick={() => setPaywall(false)}>
            {t("paywallBack")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="dl-from" className="block text-xs uppercase tracking-wider text-[var(--muted-foreground)] mb-1">
            {t("fromLabel")}
          </label>
          <input
            id="dl-from"
            value={fromParty}
            onChange={(e) => setFromParty(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="dl-to" className="block text-xs uppercase tracking-wider text-[var(--muted-foreground)] mb-1">
            {t("toLabel")}
          </label>
          <input
            id="dl-to"
            value={toParty}
            onChange={(e) => setToParty(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="dl-subject" className="block text-xs uppercase tracking-wider text-[var(--muted-foreground)] mb-1">
            {t("subjectLabel")}
          </label>
          <input
            id="dl-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder={t("subjectPlaceholder")}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="dl-jurisdiction" className="block text-xs uppercase tracking-wider text-[var(--muted-foreground)] mb-1">
            {t("jurisdiction")}
          </label>
          <select
            id="dl-jurisdiction"
            value={jurisdiction}
            onChange={(e) => setJurisdiction(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
          >
            <optgroup label={t("optgroupPopular")}>
              {popularCountries.map((c) => (
                <option key={c.code} value={c.code.toLowerCase()}>
                  {c.flag} {c.name}
                </option>
              ))}
            </optgroup>
            <optgroup label={t("optgroupAll")}>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code.toLowerCase()}>
                  {c.flag} {c.name}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
        <div>
          <label htmlFor="dl-days" className="block text-xs uppercase tracking-wider text-[var(--muted-foreground)] mb-1">
            {t("daysLabel")}
          </label>
          <input
            id="dl-days"
            type="number"
            min={1}
            max={90}
            value={daysToRespond}
            onChange={(e) => setDaysToRespond(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="dl-facts" className="block text-xs uppercase tracking-wider text-[var(--muted-foreground)] mb-1">
            {t("factsLabel")}
          </label>
          <div className="relative">
            <textarea
              id="dl-facts"
              rows={6}
              value={facts}
              onChange={(e) => setFacts(e.target.value)}
              placeholder={t("factsPlaceholder")}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 pr-12 text-sm"
            />
            <div className="absolute right-2 top-2">
              <VoiceDictationButton
                value={facts}
                onChange={setFacts}
                mode="append"
                surface="audit"
                disabled={submitting}
                onErrorMessage={setVoiceError}
              />
            </div>
          </div>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="dl-relief" className="block text-xs uppercase tracking-wider text-[var(--muted-foreground)] mb-1">
            {t("reliefLabel")}
          </label>
          <div className="relative">
            <textarea
              id="dl-relief"
              rows={4}
              value={relief}
              onChange={(e) => setRelief(e.target.value)}
              placeholder={t("reliefPlaceholder")}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 pr-12 text-sm"
            />
            <div className="absolute right-2 top-2">
              <VoiceDictationButton
                value={relief}
                onChange={setRelief}
                mode="append"
                surface="audit"
                disabled={submitting}
                onErrorMessage={setVoiceError}
              />
            </div>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      {voiceError && (
        <p className="text-xs text-amber-700 dark:text-amber-300" role="status">
          {tComposer("voiceErrorBanner", { message: voiceError })}
        </p>
      )}

      <VoicePrivacyHint className="text-xs text-[var(--muted-foreground)] max-w-2xl leading-relaxed mb-2" />

      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <Button onClick={submit} disabled={submitting} className="gap-2">
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              {t("submitting")}
            </>
          ) : (
            t("submit")
          )}
        </Button>
        <p className="text-xs text-[var(--muted-foreground)]">{t("footnote")}</p>
      </div>
    </div>
  );
}
