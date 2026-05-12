"use client";

import { useCallback, useEffect, useMemo, useState, type MouseEvent } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import { COUNTRIES } from "@/data/countries";
import { getCountry } from "@/lib/jurisdictions";
import { MIN_TEXT_CHARS, normaliseAuditType } from "@/lib/audit-engine";
import type { AuditReport, RiskGrade } from "@/lib/audit-types";
import { RISK_GRADE_COLOR, RISK_GRADE_LABEL } from "@/lib/audit-types";
import type { EmbedBorderParam, EmbedThemeParam } from "@/lib/embed-params";
import type { EmbedTelemetryOpts } from "@/lib/embed-telemetry-client";
import { sendEmbedTelemetry } from "@/lib/embed-telemetry-client";
import { MarkdownContent } from "@/components/markdown/MarkdownContent";
import { Button } from "@/components/ui/Button";
import { EmbedVisualShell } from "@/components/embed/EmbedVisualShell";
import { EmbedPoweredBy } from "@/components/embed/EmbedPoweredBy";
import { routing } from "@/i18n/routing";
import type { EmbedTenantPlan } from "@/lib/embed-tenants";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://basiclaw.app";

function normaliseLocale(raw: string | null | undefined): string {
  const v = (raw ?? "en").toLowerCase().split("-")[0] ?? "en";
  return (routing.locales as readonly string[]).includes(v) ? v : "en";
}

export function EmbedAuditClient({
  theme,
  accentCss,
  border,
  initialCountry,
  auditTypeParam,
  localeParam,
  embedApiKey = null,
  embedEventToken = null,
  tenantPlan = null,
  logoUrl = null,
}: {
  theme: EmbedThemeParam;
  accentCss: string | null;
  border: EmbedBorderParam;
  initialCountry: string;
  auditTypeParam: string | null;
  localeParam: string | null;
  embedApiKey?: string | null;
  embedEventToken?: string | null;
  tenantPlan?: EmbedTenantPlan | null;
  logoUrl?: string | null;
}) {
  const locale = useMemo(() => normaliseLocale(localeParam), [localeParam]);
  const telOpts = useMemo<EmbedTelemetryOpts>(() => ({ authToken: embedEventToken }), [embedEventToken]);
  const auditType = normaliseAuditType(auditTypeParam);
  const sortedCountries = useMemo(
    () => [...COUNTRIES].sort((a, b) => a.name.localeCompare(b.name)),
    []
  );
  const safeCountry = (getCountry(initialCountry)?.code ?? "us").toLowerCase();
  const [jurisdiction, setJurisdiction] = useState(safeCountry);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AuditReport | null>(null);
  const [error, setError] = useState<{ message: string; upgradeUrl?: string | null } | null>(null);

  useEffect(() => {
    sendEmbedTelemetry("embed_loaded", { variant: "audit", jurisdiction: initialCountry.toLowerCase(), auditType }, telOpts);
  }, [auditType, initialCountry, telOpts]);

  const onSummaryClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      const t = event.target as HTMLElement;
      const a = t.closest("a");
      if (!a?.href) return;
      sendEmbedTelemetry("embed_link_clicked", { target: "audit_summary", href: a.href }, telOpts);
    },
    [telOpts]
  );

  async function runAudit() {
    const trimmed = text.trim();
    if (trimmed.length < MIN_TEXT_CHARS || loading) {
      setError({
        message: `Paste at least ${MIN_TEXT_CHARS} characters of contract text (about one solid paragraph).`,
      });
      return;
    }
    setError(null);
    setReport(null);
    setLoading(true);
    sendEmbedTelemetry("embed_audit_run", { jurisdiction, auditType, length: trimmed.length }, telOpts);
    try {
      const refer = typeof document !== "undefined" ? document.referrer || "" : "";
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-basiclaw-locale": locale,
          ...(embedApiKey ? { "x-basiclaw-embed-key": embedApiKey } : {}),
        },
        body: JSON.stringify({
          text: trimmed,
          jurisdiction,
          auditType,
          embedReferrer: refer,
          ...(embedApiKey ? { embedApiKey } : {}),
        }),
      });
      if (res.status === 429) {
        const j = (await res.json().catch(() => null)) as {
          message?: string;
          upgradeUrl?: string;
        } | null;
        setError({
          message: j?.message ?? "Usage limit reached. See BasicLaw pricing to continue.",
          upgradeUrl: j?.upgradeUrl ?? `/${locale}/pricing`,
        });
        return;
      }
      if (res.status === 401 || res.status === 403) {
        setError({ message: "This embed key is not valid for this site, or the parent origin is not allow-listed." });
        return;
      }
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { message?: string } | null;
        setError({ message: j?.message ?? "Audit failed. Try again with clearer text." });
        return;
      }
      const data = (await res.json()) as { report?: AuditReport };
      if (!data.report) {
        setError({ message: "Unexpected response from the audit service." });
        return;
      }
      setReport(data.report);
      sendEmbedTelemetry("embed_answer_received", { variant: "audit", jurisdiction, ok: true }, telOpts);
    } catch {
      setError({ message: "Network error. Check your connection and try again." });
    } finally {
      setLoading(false);
    }
  }

  const upgradeHref =
    error?.upgradeUrl?.startsWith("/") === true ? `${SITE}${error.upgradeUrl}` : error?.upgradeUrl ?? `${SITE}/${locale}/pricing`;

  const grade = report?.overallRiskGrade as RiskGrade | undefined;
  const gradeClass = grade ? RISK_GRADE_COLOR[grade] : "";
  const poweredByCompact = tenantPlan === "pro" && Boolean(logoUrl);

  return (
    <EmbedVisualShell theme={theme} accentCss={accentCss} border={border}>
      <div className="space-y-3">
        {logoUrl ? (
          <div className="flex justify-center border-b border-[var(--border)] pb-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- tenant-supplied arbitrary HTTPS URL */}
            <img src={logoUrl} alt="" className="h-9 max-w-[min(100%,12rem)] object-contain" />
          </div>
        ) : null}
        <p className="text-sm text-muted-foreground">
          Paste a clause or short contract excerpt. BasicLaw returns an educational risk read — not legal advice.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="basiclaw-embed-audit-country" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Jurisdiction
          </label>
          <select
            id="basiclaw-embed-audit-country"
            value={jurisdiction}
            onChange={(e) => setJurisdiction(e.target.value)}
            className="min-w-[10rem] flex-1 rounded-lg border border-[var(--border)] bg-background px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          >
            {sortedCountries.map((c) => (
              <option key={c.code} value={c.code.toLowerCase()}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          placeholder={`Paste at least ${MIN_TEXT_CHARS} characters of contract language…`}
          className="w-full resize-y rounded-lg border border-[var(--border)] bg-background px-3 py-2 font-mono text-xs leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
        <Button type="button" className="w-full gap-2 sm:w-auto" disabled={loading} onClick={() => void runAudit()}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <ShieldAlert className="h-4 w-4" aria-hidden />}
          Run quick audit
        </Button>
        {error && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-foreground">
            <p>{error.message}</p>
            {error.upgradeUrl !== undefined && (
              <a
                href={upgradeHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block font-medium text-primary underline-offset-2 hover:underline"
                onClick={() => sendEmbedTelemetry("embed_link_clicked", { target: "upgrade", href: upgradeHref }, telOpts)}
              >
                View plans on BasicLaw
              </a>
            )}
          </div>
        )}
        {report && grade && (
          <div className="space-y-3 rounded-lg border border-[var(--border)] bg-muted/20 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${gradeClass}`}>{RISK_GRADE_LABEL[grade]}</span>
              <span className="text-xs text-muted-foreground">{report.jurisdictionName}</span>
            </div>
            <div onClick={onSummaryClick} role="presentation">
              <MarkdownContent markdown={report.oneLineSummary} />
            </div>
            {report.redFlags?.length ? (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Watch-outs</p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-foreground">
                  {report.redFlags.slice(0, 4).map((f) => (
                    <li key={f.title}>{f.title}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            <p className="text-[11px] text-muted-foreground">
              For a full checklist and shareable report, open the{" "}
              <a
                href={`${SITE}/${locale}/audit`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary underline-offset-2 hover:underline"
                onClick={() =>
                  sendEmbedTelemetry("embed_link_clicked", { target: "full_audit", href: `${SITE}/${locale}/audit` }, telOpts)
                }
              >
                audit suite on BasicLaw
              </a>
              .
            </p>
          </div>
        )}
      </div>
      <EmbedPoweredBy compact={poweredByCompact} authToken={embedEventToken} />
    </EmbedVisualShell>
  );
}
