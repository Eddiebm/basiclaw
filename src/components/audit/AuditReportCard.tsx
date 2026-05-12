"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Check, Copy, Flag, Lightbulb, Scale, ShieldAlert, ShieldCheck, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LawyerCtaLink } from "@/components/analytics/LawyerCtaLink";
import { RISK_GRADE_COLOR, RISK_GRADE_LABEL, type AuditFocusSlot, type AuditReport } from "@/lib/audit-types";
import { buildAuditReportSpeechText } from "@/lib/audit-report-speech";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { track } from "@/lib/analytics";

interface Props {
  report: AuditReport;
  showShareButton?: boolean;
  onShared?: () => void;
}

function encodeReport(report: AuditReport): string {
  const json = JSON.stringify(report);
  if (typeof window === "undefined") {
    return Buffer.from(json, "utf-8").toString("base64");
  }
  return btoa(unescape(encodeURIComponent(json)));
}

function FocusSlotCard({ label, slot }: { label: string; slot: AuditFocusSlot }) {
  return (
    <li className="rounded-2xl border border-[var(--border)]/70 bg-[var(--muted)]/15 p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">{label}</p>
      <p className="mt-2 text-sm leading-relaxed text-[var(--foreground)]">{slot.summary}</p>
      <figure className="mt-5 border-l-2 border-[var(--primary)]/45 pl-4">
        <figcaption className="sr-only">Push back</figcaption>
        <blockquote className="font-editorial text-base italic leading-relaxed text-[var(--foreground)]">{slot.pushback}</blockquote>
      </figure>
    </li>
  );
}

export function AuditReportCard({ report, showShareButton = true, onShared }: Props) {
  const t = useTranslations("auditReportCard");
  const tVoice = useTranslations("voice");
  const locale = useLocale();
  const [copied, setCopied] = useState(false);

  const speechText = useMemo(() => buildAuditReportSpeechText(report), [report]);
  const synth = useSpeechSynthesis({
    locale,
    onSpeakStarted: () => track("tts_started", { surface: "audit" }),
    onSpeakEnded: () => track("tts_stopped", { surface: "audit" }),
    onSpeakError: (message) => track("tts_error", { surface: "audit", message }),
  });

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const encoded = encodeReport(report);
    return `${window.location.origin}/${locale}/audit/shared#${encoded}`;
  }, [report, locale]);

  async function copyShareLink() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      onShared?.();
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copy this share link", shareUrl);
      onShared?.();
    }
  }

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[var(--card)]/95 shadow-paper backdrop-blur-sm">
      <div className="flex flex-col gap-6 border-b border-[var(--border)]/80 bg-[var(--muted)]/10 p-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8 sm:p-8">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
            {report.documentType} · {report.jurisdictionName}
            {report.auditType !== "general" ? ` · ${report.auditType} audit` : ""}
          </p>
          <h2 className="mt-3 font-editorial text-2xl leading-snug text-[var(--foreground)] sm:text-3xl">{report.oneLineSummary}</h2>
        </div>
        <div className="flex shrink-0 flex-col items-stretch gap-3 sm:items-end">
          <div
            className={`flex flex-col items-center justify-center rounded-2xl border-2 border-double px-6 py-5 text-center shadow-[inset_0_0_0_1px_oklch(0_0_0/0.06)] sm:min-w-[9.5rem] ${RISK_GRADE_COLOR[report.overallRiskGrade]}`}
          >
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] opacity-80">Grade</span>
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
        <Section icon={<Flag className="h-5 w-5 text-violet-500" aria-hidden />} title="Lease checklist (deposit, notice, renewal)">
          <ul className="space-y-3">
            <FocusSlotCard label="Deposit" slot={report.leaseStructured.deposit} />
            <FocusSlotCard label="Notice" slot={report.leaseStructured.notice} />
            <FocusSlotCard label="Renewal" slot={report.leaseStructured.renewal} />
          </ul>
        </Section>
      )}

      {report.employmentStructured && (
        <Section icon={<Flag className="h-5 w-5 text-violet-500" aria-hidden />} title="Employment checklist (IP, non-compete, at-will)">
          <ul className="space-y-3">
            <FocusSlotCard label="IP / inventions" slot={report.employmentStructured.intellectualProperty} />
            <FocusSlotCard label="Non-compete / solicitation" slot={report.employmentStructured.nonCompete} />
            <FocusSlotCard label="At-will / termination" slot={report.employmentStructured.atWill} />
          </ul>
        </Section>
      )}

      {report.termsStructured && (
        <Section icon={<Flag className="h-5 w-5 text-violet-500" aria-hidden />} title="Terms checklist (data, arbitration, liability)">
          <ul className="space-y-3">
            <FocusSlotCard label="Data rights" slot={report.termsStructured.dataRights} />
            <FocusSlotCard label="Arbitration / disputes" slot={report.termsStructured.arbitration} />
            <FocusSlotCard label="Liability cap" slot={report.termsStructured.liabilityCap} />
          </ul>
        </Section>
      )}

      {report.prenupStructured && (
        <Section icon={<Flag className="h-5 w-5 text-violet-500" aria-hidden />} title="Prenup checklist (disclosure, support, counsel)">
          <ul className="space-y-3">
            <FocusSlotCard label="Financial disclosure" slot={report.prenupStructured.financialDisclosure} />
            <FocusSlotCard label="Spousal support" slot={report.prenupStructured.spousalSupport} />
            <FocusSlotCard label="Independent counsel" slot={report.prenupStructured.independentCounsel} />
          </ul>
        </Section>
      )}

      {report.divorceStructured && (
        <Section icon={<Flag className="h-5 w-5 text-violet-500" aria-hidden />} title="Divorce settlement checklist (assets, parenting, support)">
          <ul className="space-y-3">
            <FocusSlotCard label="Asset & debt division" slot={report.divorceStructured.assetDivision} />
            <FocusSlotCard label="Custody / parenting" slot={report.divorceStructured.custodyParenting} />
            <FocusSlotCard label="Support / alimony" slot={report.divorceStructured.supportAlimony} />
          </ul>
        </Section>
      )}

      {report.demandLetterStructured && (
        <Section icon={<Flag className="h-5 w-5 text-violet-500" aria-hidden />} title="Demand letter checklist (facts, relief, deadline)">
          <ul className="space-y-3">
            <FocusSlotCard label="Facts & timeline" slot={report.demandLetterStructured.factsAndTimeline} />
            <FocusSlotCard label="Relief & amount" slot={report.demandLetterStructured.reliefAndAmount} />
            <FocusSlotCard label="Deadline & tone" slot={report.demandLetterStructured.deadlineAndTone} />
          </ul>
        </Section>
      )}

      <Section
        icon={<ShieldAlert className="h-5 w-5 text-red-500" aria-hidden />}
        title="Top red flags"
      >
        {report.redFlags.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">None of significance found.</p>
        ) : (
          <ul className="space-y-4">
            {report.redFlags.map((flag, idx) => (
              <li key={`${flag.title}-${idx}`} className="rounded-2xl border border-[var(--border)]/60 p-4">
                <p className="font-semibold text-[var(--foreground)]">{flag.title}</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">{flag.why}</p>
                {flag.pushback && (
                  <figure className="mt-4 border-l-2 border-[var(--primary)]/40 pl-4">
                    <figcaption className="sr-only">Suggested ask</figcaption>
                    <blockquote className="font-editorial text-sm italic leading-relaxed text-[var(--foreground)]">{flag.pushback}</blockquote>
                  </figure>
                )}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section
        icon={<ShieldCheck className="h-5 w-5 text-emerald-500" aria-hidden />}
        title="In your favour"
      >
        {report.positives.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">No standout positives identified.</p>
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

      <Section
        icon={<Flag className="h-5 w-5 text-amber-500" aria-hidden />}
        title="Key clauses to push back on"
      >
        {report.keyClausesToPushBackOn.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">Nothing critical to renegotiate — still worth a careful read.</p>
        ) : (
          <ul className="space-y-3">
            {report.keyClausesToPushBackOn.map((c, idx) => (
              <li key={`${c.clause}-${idx}`} className="rounded-2xl border border-[var(--border)]/60 p-4">
                <p className="text-sm text-[var(--foreground)]">
                  <strong className="font-semibold">Clause:</strong> {c.clause}
                </p>
                <figure className="mt-4 border-l-2 border-[var(--foreground)]/15 pl-4">
                  <figcaption className="sr-only">Push back</figcaption>
                  <blockquote className="font-editorial text-sm italic leading-relaxed text-[var(--foreground)]">{c.pushback}</blockquote>
                </figure>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section
        icon={<Lightbulb className="h-5 w-5 text-blue-500" aria-hidden />}
        title="Ask a lawyer if…"
      >
        {report.askLawyerIfTriggers.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">No obvious triggers — a quick phone consult is still cheap insurance.</p>
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
        <strong className="font-semibold">Educational only, not legal advice.</strong> This is an automated summary of the text you provided. Specific clauses, recent amendments, and your personal facts can flip the answer. For anything you have to sign, get a licensed lawyer in {report.jurisdictionName}.
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <Button asChild className="gap-2">
          <Link href={`/chat?country=${report.jurisdictionCode.toLowerCase()}`}>
            {t("followUpCta")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        {showShareButton && (
          <Button onClick={copyShareLink} variant="outline" className="gap-2">
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            {copied ? "Link copied" : "Share this audit"}
          </Button>
        )}
      </div>
      </div>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
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
