"use client";

import { useCallback, useEffect, useMemo, useState, type MouseEvent } from "react";
import { Loader2, Send } from "lucide-react";
import { COUNTRIES } from "@/data/countries";
import { getCountry } from "@/lib/jurisdictions";
import type { EmbedBorderParam, EmbedThemeParam } from "@/lib/embed-params";
import { sendEmbedTelemetry } from "@/lib/embed-telemetry-client";
import { MarkdownContent } from "@/components/markdown/MarkdownContent";
import { Button } from "@/components/ui/Button";
import { EmbedVisualShell } from "@/components/embed/EmbedVisualShell";
import { EmbedPoweredBy } from "@/components/embed/EmbedPoweredBy";
import { routing } from "@/i18n/routing";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://basiclaw.app";

interface CitationLite {
  id: string;
  title: string;
  source: string;
  url?: string;
  snippet: string;
}

function normaliseLocale(raw: string | null | undefined): string {
  const v = (raw ?? "en").toLowerCase().split("-")[0] ?? "en";
  return (routing.locales as readonly string[]).includes(v) ? v : "en";
}

export function EmbedAskClient({
  theme,
  accentCss,
  border,
  initialCountry,
  localeParam,
}: {
  theme: EmbedThemeParam;
  accentCss: string | null;
  border: EmbedBorderParam;
  initialCountry: string;
  localeParam: string | null;
}) {
  const locale = useMemo(() => normaliseLocale(localeParam), [localeParam]);
  const sortedCountries = useMemo(
    () => [...COUNTRIES].sort((a, b) => a.name.localeCompare(b.name)),
    []
  );
  const defaultCode = (getCountry(initialCountry)?.code ?? "us").toLowerCase();
  const [jurisdiction, setJurisdiction] = useState(defaultCode);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [citations, setCitations] = useState<CitationLite[] | null>(null);
  const [error, setError] = useState<{ message: string; upgradeUrl?: string | null } | null>(null);

  useEffect(() => {
    sendEmbedTelemetry("embed_loaded", { variant: "ask", jurisdiction: defaultCode });
  }, [defaultCode]);

  const onResultClick = useCallback((event: MouseEvent<HTMLDivElement>) => {
    const t = event.target as HTMLElement;
    const a = t.closest("a");
    if (!a?.href) return;
    sendEmbedTelemetry("embed_link_clicked", { target: "answer_markdown", href: a.href });
  }, []);

  async function submit() {
    const message = input.trim();
    if (!message || loading) return;
    setError(null);
    setAnswer(null);
    setCitations(null);
    setLoading(true);
    sendEmbedTelemetry("embed_question_asked", { jurisdiction, length: message.length });
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-basiclaw-locale": locale,
        },
        body: JSON.stringify({ message, jurisdiction }),
      });
      if (res.status === 429) {
        const j = (await res.json().catch(() => null)) as {
          message?: string;
          upgradeUrl?: string;
        } | null;
        setError({
          message: j?.message ?? "Usage limit reached. Try again later or upgrade on BasicLaw.",
          upgradeUrl: j?.upgradeUrl ?? `/${locale}/pricing`,
        });
        return;
      }
      if (!res.ok) {
        setError({ message: "Something went wrong. Please try again." });
        return;
      }
      const data = (await res.json()) as { response?: string; citations?: CitationLite[] };
      setAnswer(typeof data.response === "string" ? data.response : "");
      setCitations(Array.isArray(data.citations) ? data.citations : null);
      sendEmbedTelemetry("embed_answer_received", { jurisdiction, ok: true });
    } catch {
      setError({ message: "Network error. Check your connection and try again." });
    } finally {
      setLoading(false);
    }
  }

  const upgradeHref =
    error?.upgradeUrl?.startsWith("/") === true ? `${SITE}${error.upgradeUrl}` : error?.upgradeUrl ?? `${SITE}/${locale}/pricing`;

  return (
    <EmbedVisualShell theme={theme} accentCss={accentCss} border={border}>
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Ask a plain-language legal question for the selected country. Educational information only — not legal advice.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="basiclaw-embed-country" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Jurisdiction
          </label>
          <select
            id="basiclaw-embed-country"
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
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
          placeholder="e.g. What are my rights if my landlord enters without notice?"
          className="w-full resize-y rounded-lg border border-[var(--border)] bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
        <Button type="button" className="w-full gap-2 sm:w-auto" disabled={loading || !input.trim()} onClick={() => void submit()}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
          Ask BasicLaw
        </Button>
        {error && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-foreground">
            <p>{error.message}</p>
            <a
              href={upgradeHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block font-medium text-primary underline-offset-2 hover:underline"
              onClick={() => sendEmbedTelemetry("embed_link_clicked", { target: "upgrade", href: upgradeHref })}
            >
              View plans on BasicLaw
            </a>
          </div>
        )}
        {answer !== null && (
          <div className="space-y-3 rounded-lg border border-[var(--border)] bg-muted/20 p-3" onClick={onResultClick} role="presentation">
            <MarkdownContent markdown={answer} />
            {citations && citations.length > 0 && (
              <div className="border-t border-[var(--border)] pt-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Sources & snippets</p>
                <ul className="mt-2 space-y-2 text-xs text-muted-foreground">
                  {citations.slice(0, 8).map((c) => (
                    <li key={c.id}>
                      <span className="font-medium text-foreground">{c.title}</span>
                      {c.url ? (
                        <>
                          {" "}
                          <a
                            href={c.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline-offset-2 hover:underline"
                            onClick={() => sendEmbedTelemetry("embed_link_clicked", { target: "citation", href: c.url ?? "" })}
                          >
                            Link
                          </a>
                        </>
                      ) : null}
                      <span className="block text-[11px] leading-snug">{c.snippet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
      <EmbedPoweredBy />
    </EmbedVisualShell>
  );
}
