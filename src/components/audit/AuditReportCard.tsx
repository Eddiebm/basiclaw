"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Copy, Flag, Lightbulb, Scale, ShieldAlert, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { RISK_GRADE_COLOR, RISK_GRADE_LABEL, type AuditReport } from "@/lib/audit-types";

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

export function AuditReportCard({ report, showShareButton = true, onShared }: Props) {
  const [copied, setCopied] = useState(false);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const encoded = encodeReport(report);
    return `${window.location.origin}/audit/shared#${encoded}`;
  }, [report]);

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
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8">
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <p className="text-xs uppercase tracking-wider text-[var(--muted-foreground)] mb-1">
            {report.documentType} \u00b7 {report.jurisdictionName}
          </p>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">{report.oneLineSummary}</h2>
        </div>
        <span
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold ${RISK_GRADE_COLOR[report.overallRiskGrade]}`}
        >
          <Scale className="h-4 w-4" aria-hidden />
          {RISK_GRADE_LABEL[report.overallRiskGrade]}
        </span>
      </div>

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
                  <p className="mt-2 text-sm text-[var(--foreground)]">
                    <strong className="font-medium">Ask for:</strong> {flag.pushback}
                  </p>
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
          <p className="text-sm text-[var(--muted-foreground)]">Nothing critical to renegotiate \u2014 still worth a careful read.</p>
        ) : (
          <ul className="space-y-3">
            {report.keyClausesToPushBackOn.map((c, idx) => (
              <li key={`${c.clause}-${idx}`} className="rounded-2xl border border-[var(--border)]/60 p-4">
                <p className="text-sm text-[var(--foreground)]">
                  <strong className="font-semibold">Clause:</strong> {c.clause}
                </p>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  <strong className="font-medium text-[var(--foreground)]">Push back:</strong> {c.pushback}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section
        icon={<Lightbulb className="h-5 w-5 text-blue-500" aria-hidden />}
        title="Ask a lawyer if\u2026"
      >
        {report.askLawyerIfTriggers.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">No obvious triggers \u2014 a quick phone consult is still cheap insurance.</p>
        ) : (
          <ul className="space-y-2">
            {report.askLawyerIfTriggers.map((t, idx) => (
              <li key={`${t.trigger}-${idx}`} className="text-sm">
                <span className="font-medium text-[var(--foreground)]">{t.trigger}.</span>{" "}
                <span className="text-[var(--muted-foreground)]">{t.why}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <div className="mt-8 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-900 dark:text-amber-200">
        <strong className="font-semibold">Educational only, not legal advice.</strong> This is an automated summary of the text you provided. Specific clauses, recent amendments, and your personal facts can flip the answer. For anything you have to sign, get a licensed lawyer in {report.jurisdictionName}.
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <Button asChild className="gap-2">
          <Link href={`/chat?country=${report.jurisdictionCode.toLowerCase()}`}>
            Ask the assistant a follow-up
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
