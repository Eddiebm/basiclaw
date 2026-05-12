"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Check, Copy, Flag, Lightbulb, Scale, ShieldAlert, ShieldCheck, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LawyerCtaLink } from "@/components/analytics/LawyerCtaLink";
import { useAnnouncer } from "@/components/a11y/AnnouncerProvider";
import { RISK_GRADE_COLOR, RISK_GRADE_LABEL, type AuditFocusSlot, type AuditReport } from "@/lib/audit-types";
import { buildAuditReportSpeechText } from "@/lib/audit-report-speech";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { track } from "@/lib/analytics";

interface Props {
  report: AuditReport;
  showShareButton?: boolean;
  /** Locale-prefixed path e.g. /en/audit/shared?t=… when the audit was saved for a signed-in user */
  signedSharePath?: string | null;
  onShared?: () => void;
}

function encodeReport(report: AuditReport): string {
  const json = JSON.stringify(report);
  if (typeof window === "undefined") {
    return Buffer.from(json, "utf-8").toString("base64");
  }
  return btoa(unescape(encodeURIComponent(json)));
}

function FocusSlotCard({ label, slot, pushbackCaption }: { label: string; slot: AuditFocusSlot; pushbackCaption: string }) {
  return (
    <li className="rounded-2xl border border-[var(--border)]/70 bg-[var(--muted)]/15 p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">{label}</p>
      <p className="mt-2 text-sm leading-relaxed text-[var(--foreground)]">{slot.summary}</p>
      <figure className="mt-5 border-l-2 border-[var(--primary)]/45 pl-4">
        <figcaption className="sr-only">{pushbackCaption}</figcaption>
        <blockquote className="font-editorial text-base italic leading-relaxed text-[var(--foreground)]">{slot.pushback}</blockquote>
      </figure>
    </li>
  );
}

export function AuditReportCard({ report, showShareButton = true, signedSharePath = null, onShared }: Props) {
  const t = useTranslations("auditReportCard");
  const tVoice = useTranslations("voice");
  const locale = useLocale();
  const pathname = usePathname();
  const announce = useAnnouncer();
  const [copied, setCopied] = useState(false);

  const speechText = useMemo(() => buildAuditReportSpeechText(report), [report]);
  const synth = useSpeechSynthesis({
    locale,
    onSpeakStarted: () => track("tts_started", { surface: "audit" }),
    onSpeakEnded: () => track("tts_stopped", { surface: "audit" }),
    onSpeakError: (message) => track("tts_error", { surface: "audit", message }),
  });

  const cancelRef = useRef(synth.cancel);
  useEffect(() => {
    cancelRef.current = synth.cancel;
  }, [synth]);
  useEffect(() => () => synth.cancel(), [synth]);
  useEffect(() => {
    cancelRef.current();
  }, [pathname]);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const path = signedSharePath?.trim();
    if (path?.startsWith("/")) {
      return `${window.location.origin}${path}`;
    }
    const encoded = encodeReport(report);
    return `${window.location.origin}/${locale}/audit/shared#${encoded}`;
  }, [report, locale, signedSharePath]);

  async function copyShareLink() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      onShared?.();
      announce(t("shareCopiedAnnouncement"));
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt(t("sharePromptMessage"), shareUrl);
      onShared?.();
      announce(t("shareCopiedAnnouncement"));
    }
  }

  const metaLine =
    report.auditType !== "general"
      ? `${report.documentType} · ${report.jurisdictionName} · ${t("metaAuditSuffix", { type: report.auditType })}`
      : `${report.documentType} · ${report.jurisdictionName}`;

  const pb = t("slotPushbackCaption");
  const suggested = t("suggestedAskCaption");

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[var(--card)]/95 shadow-paper backdrop-blur-sm">
      <div className="flex flex-col gap-6 border-b border-[var(--border)]/80 bg-[var(--muted)]/10 p-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8 sm:p-8">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted-foreground)]">{metaLine}</p>
          <h2 className="mt-3 font-editorial text-2xl leading-snug text-[var(--foreground)] sm:text-3xl">{report.oneLineSummary}</h2>
        </div>
        <div className="flex shrink-0 flex-col items-stretch gap-3 sm:items-end">
          <div
            className={`flex flex-col items-center justify-center rounded-2xl border-2 border-double px-6 py-5 text-center shadow-[inset_0_0_0_1px_oklch(0_0_0/0.06)] sm:min-w-[9.5rem] ${RISK_GRADE_COLOR[report.overallRiskGrade]}`}
          >
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] opacity-80">{t("gradeLabel")}</span>
            <span className="mt-1 flex items-center gap-2 font-editorial text-4xl sm:text-5xl">
              <Scale className="h-7 w-7 opacity-70" aria-hidden />
              {RISK_GRADE_LABEL[report.overallRiskGrade]}
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => {
              if (synth.isSpeaking) {
                synth.cancel();
                return;
              }
              if (!synth.isSupported) return;
              synth.speak(speechText, { dialectHints: [report.jurisdictionCode.toLowerCase()] });
            }}
            aria-label={tVoice("readSummaryAria")}
          >
            {synth.isSpeaking ? tVoice("stopSummary") : tVoice("readSummary")}
            <Volume2 className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </div>

      <div className="space-y-2 px-6 pb-8 pt-2 sm:px-8">
        {report.leaseStructured && (
          <Section icon={<Flag className="h-5 w-5 text-violet-500" aria-hidden />} title={t("leaseTitle")}>
            <ul className="space-y-3">
              <FocusSlotCard label={t("leaseDeposit")} slot={report.leaseStructured.deposit} pushbackCaption={pb} />
              <FocusSlotCard label={t("leaseNotice")} slot={report.leaseStructured.notice} pushbackCaption={pb} />
              <FocusSlotCard label={t("leaseRenewal")} slot={report.leaseStructured.renewal} pushbackCaption={pb} />
            </ul>
          </Section>
        )}

        {report.employmentStructured && (
          <Section icon={<Flag className="h-5 w-5 text-violet-500" aria-hidden />} title={t("employmentTitle")}>
            <ul className="space-y-3">
              <FocusSlotCard label={t("employmentIp")} slot={report.employmentStructured.intellectualProperty} pushbackCaption={pb} />
              <FocusSlotCard label={t("employmentNonCompete")} slot={report.employmentStructured.nonCompete} pushbackCaption={pb} />
              <FocusSlotCard label={t("employmentAtWill")} slot={report.employmentStructured.atWill} pushbackCaption={pb} />
            </ul>
          </Section>
        )}

        {report.termsStructured && (
          <Section icon={<Flag className="h-5 w-5 text-violet-500" aria-hidden />} title={t("termsTitle")}>
            <ul className="space-y-3">
              <FocusSlotCard label={t("termsData")} slot={report.termsStructured.dataRights} pushbackCaption={pb} />
              <FocusSlotCard label={t("termsArbitration")} slot={report.termsStructured.arbitration} pushbackCaption={pb} />
              <FocusSlotCard label={t("termsLiability")} slot={report.termsStructured.liabilityCap} pushbackCaption={pb} />
            </ul>
          </Section>
        )}

        {report.prenupStructured && (
          <Section icon={<Flag className="h-5 w-5 text-violet-500" aria-hidden />} title={t("prenupTitle")}>
            <ul className="space-y-3">
              <FocusSlotCard label={t("prenupDisclosure")} slot={report.prenupStructured.financialDisclosure} pushbackCaption={pb} />
              <FocusSlotCard label={t("prenupSupport")} slot={report.prenupStructured.spousalSupport} pushbackCaption={pb} />
              <FocusSlotCard label={t("prenupCounsel")} slot={report.prenupStructured.independentCounsel} pushbackCaption={pb} />
            </ul>
          </Section>
        )}

        {report.divorceStructured && (
          <Section icon={<Flag className="h-5 w-5 text-violet-500" aria-hidden />} title={t("divorceTitle")}>
            <ul className="space-y-3">
              <FocusSlotCard label={t("divorceAssets")} slot={report.divorceStructured.assetDivision} pushbackCaption={pb} />
              <FocusSlotCard label={t("divorceCustody")} slot={report.divorceStructured.custodyParenting} pushbackCaption={pb} />
              <FocusSlotCard label={t("divorceSupport")} slot={report.divorceStructured.supportAlimony} pushbackCaption={pb} />
            </ul>
          </Section>
        )}

        {report.demandLetterStructured && (
          <Section icon={<Flag className="h-5 w-5 text-violet-500" aria-hidden />} title={t("demandLetterTitle")}>
            <ul className="space-y-3">
              <FocusSlotCard label={t("demandFacts")} slot={report.demandLetterStructured.factsAndTimeline} pushbackCaption={pb} />
              <FocusSlotCard label={t("demandRelief")} slot={report.demandLetterStructured.reliefAndAmount} pushbackCaption={pb} />
              <FocusSlotCard label={t("demandDeadline")} slot={report.demandLetterStructured.deadlineAndTone} pushbackCaption={pb} />
            </ul>
          </Section>
        )}

        <Section icon={<ShieldAlert className="h-5 w-5 text-red-500" aria-hidden />} title={t("redFlagsTitle")}>
          {report.redFlags.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)]">{t("redFlagsNone")}</p>
          ) : (
            <ul className="space-y-4">
              {report.redFlags.map((flag, idx) => (
                <li key={`${flag.title}-${idx}`} className="rounded-2xl border border-[var(--border)]/60 p-4">
                  <p className="font-semibold text-[var(--foreground)]">{flag.title}</p>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">{flag.why}</p>
                  {flag.pushback && (
                    <figure className="mt-4 border-l-2 border-[var(--primary)]/40 pl-4">
                      <figcaption className="sr-only">{suggested}</figcaption>
                      <blockquote className="font-editorial text-sm italic leading-relaxed text-[var(--foreground)]">{flag.pushback}</blockquote>
                    </figure>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section icon={<ShieldCheck className="h-5 w-5 text-emerald-500" aria-hidden />} title={t("positivesTitle")}>
          {report.positives.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)]">{t("positivesNone")}</p>
          ) : (
            <ul className="space-y-3">
              {report.positives.map((p, idx) => (
                <li key={`${p.title}-${idx}`} className="text-sm">
                  <span className="font-medium text-[var(--foreground)]">{p.title}.</span>{" "}
                  <span className="text-[var(--muted-foreground)]">{p.why}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section icon={<Flag className="h-5 w-5 text-amber-500" aria-hidden />} title={t("keyClausesTitle")}>
          {report.keyClausesToPushBackOn.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)]">{t("keyClausesNone")}</p>
          ) : (
            <ul className="space-y-3">
              {report.keyClausesToPushBackOn.map((c, idx) => (
                <li key={`${c.clause}-${idx}`} className="rounded-2xl border border-[var(--border)]/60 p-4">
                  <p className="text-sm text-[var(--foreground)]">
                    <strong className="font-semibold">{t("clauseLabel")}</strong> {c.clause}
                  </p>
                  <figure className="mt-4 border-l-2 border-[var(--foreground)]/15 pl-4">
                    <figcaption className="sr-only">{pb}</figcaption>
                    <blockquote className="font-editorial text-sm italic leading-relaxed text-[var(--foreground)]">{c.pushback}</blockquote>
                  </figure>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section icon={<Lightbulb className="h-5 w-5 text-blue-500" aria-hidden />} title={t("askLawyerIfTitle")}>
          {report.askLawyerIfTriggers.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)]">{t("askLawyerIfNone")}</p>
          ) : (
            <ul className="space-y-2">
              {report.askLawyerIfTriggers.map((tr, idx) => (
                <li key={`${tr.trigger}-${idx}`} className="text-sm">
                  <span className="font-medium text-[var(--foreground)]">{tr.trigger}.</span>{" "}
                  <span className="text-[var(--muted-foreground)]">{tr.why}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <div className="mt-6 rounded-2xl border border-[var(--primary)]/25 bg-[var(--primary)]/5 p-4">
          <p className="text-sm font-medium text-[var(--foreground)] mb-2">{t("askLawyerTitle")}</p>
          <p className="text-xs text-[var(--muted-foreground)] mb-3">
            {t("askLawyerBody", { jurisdiction: report.jurisdictionName })}
          </p>
          <LawyerCtaLink
            href={`/find-a-lawyer?country=${report.jurisdictionCode.toLowerCase()}`}
            source="audit_result_panel"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)] hover:underline underline-offset-4"
          >
            {t("askLawyerCta")} <ArrowRight className="h-4 w-4" aria-hidden />
          </LawyerCtaLink>
        </div>

        <div className="mt-8 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-900 dark:text-amber-200">
          <strong className="font-semibold">{t("disclaimerLead")}</strong> {t("disclaimerBody", { jurisdiction: report.jurisdictionName })}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Button asChild className="gap-2">
            <Link href={`/chat?country=${report.jurisdictionCode.toLowerCase()}`}>
              {t("followUpCta")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          {showShareButton && (
            <Button type="button" onClick={() => void copyShareLink()} variant="outline" className="gap-2">
              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              {copied ? t("shareCopied") : t("shareButton")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section className="mt-6">
      <h3 className="flex items-center gap-2 text-sm uppercase tracking-wider text-[var(--muted-foreground)] mb-3">
        {icon}
        {title}
      </h3>
      {children}
    </section>
  );
}
