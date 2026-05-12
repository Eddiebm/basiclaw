"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Copy, Check } from "lucide-react";
import { COUNTRIES } from "@/data/countries";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type Variant = "ask" | "audit";

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://basiclaw.app").replace(/\/$/, "");

const AUDIT_TYPES = ["general", "lease", "employment", "terms"] as const;

export function EmbedDeveloperPageClient() {
  const t = useTranslations("embedPage");
  const locale = useLocale();
  const [variant, setVariant] = useState<Variant>("ask");
  const [country, setCountry] = useState("us");
  const [theme, setTheme] = useState<"light" | "dark" | "auto">("auto");
  const [accent, setAccent] = useState("");
  const [border, setBorder] = useState<"rounded" | "square">("rounded");
  const [auditType, setAuditType] = useState<(typeof AUDIT_TYPES)[number]>("general");
  const [copied, setCopied] = useState<"iframe" | "loader" | null>(null);

  const sortedCountries = useMemo(
    () => [...COUNTRIES].sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  const query = useMemo(() => {
    const p = new URLSearchParams();
    p.set("country", country);
    p.set("theme", theme);
    if (accent.trim() && /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(accent.trim())) {
      p.set("accent", accent.trim());
    }
    p.set("border", border);
    p.set("locale", locale);
    if (variant === "audit") {
      p.set("auditType", auditType);
    }
    return p.toString();
  }, [accent, auditType, border, country, locale, theme, variant]);

  const iframePath = variant === "audit" ? "/embed/audit" : "/embed/ask";
  const previewSrc = `${SITE}${iframePath}?${query}`;

  const iframeSnippet = `<iframe src="${previewSrc}"\n  style="width:100%;height:560px;border:0"\n  loading="lazy"\n  title="BasicLaw"></iframe>`;

  const loaderAttrs = [
    "async",
    `src="${SITE}/embed/loader.js"`,
    `data-variant="${variant}"`,
    `data-country="${country}"`,
    `data-theme="${theme}"`,
    `data-border="${border}"`,
    `data-locale="${locale}"`,
  ];
  if (accent.trim() && /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(accent.trim())) {
    loaderAttrs.push(`data-accent="${accent.trim()}"`);
  }
  if (variant === "audit") {
    loaderAttrs.push(`data-audit-type="${auditType}"`);
  }
  const loaderSnippet = `<script ${loaderAttrs.join("\n  ")}></script>\n<div data-basiclaw-embed></div>`;

  async function copy(kind: "iframe" | "loader") {
    const text = kind === "iframe" ? iframeSnippet : loaderSnippet;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      window.prompt("Copy:", text);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-10 text-center">
        <h1 className="font-editorial text-3xl tracking-tight text-foreground sm:text-4xl">{t("heroTitle")}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">{t("heroSubtitle")}</p>
      </header>

      <div className="grid gap-10 lg:grid-cols-2">
        <section className="rounded-2xl border border-[var(--border)] bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">{t("configTitle")}</h2>
          <div className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("variant")}</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {(["ask", "audit"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVariant(v)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm transition",
                      variant === v
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-[var(--border)] text-muted-foreground hover:border-primary/40"
                    )}
                  >
                    {v === "ask" ? t("variantAsk") : t("variantAudit")}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="embed-country" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("country")}
              </label>
              <select
                id="embed-country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="mt-2 w-full rounded-lg border border-[var(--border)] bg-background px-3 py-2 text-sm"
              >
                {sortedCountries.map((c) => (
                  <option key={c.code} value={c.code.toLowerCase()}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>
            {variant === "audit" && (
              <div>
                <label htmlFor="embed-audit-type" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("auditType")}
                </label>
                <select
                  id="embed-audit-type"
                  value={auditType}
                  onChange={(e) => setAuditType(e.target.value as (typeof AUDIT_TYPES)[number])}
                  className="mt-2 w-full rounded-lg border border-[var(--border)] bg-background px-3 py-2 text-sm"
                >
                  {AUDIT_TYPES.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("theme")}</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {(["light", "dark", "auto"] as const).map((th) => (
                  <button
                    key={th}
                    type="button"
                    onClick={() => setTheme(th)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm transition",
                      theme === th
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-[var(--border)] text-muted-foreground hover:border-primary/40"
                    )}
                  >
                    {th === "light" ? t("themeLight") : th === "dark" ? t("themeDark") : t("themeAuto")}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="embed-accent" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("accent")}
              </label>
              <input
                id="embed-accent"
                value={accent}
                onChange={(e) => setAccent(e.target.value)}
                placeholder={t("accentPlaceholder")}
                className="mt-2 w-full rounded-lg border border-[var(--border)] bg-background px-3 py-2 font-mono text-sm"
              />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("border")}</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {(["rounded", "square"] as const).map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBorder(b)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm transition",
                      border === b
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-[var(--border)] text-muted-foreground hover:border-primary/40"
                    )}
                  >
                    {b === "rounded" ? t("borderRounded") : t("borderSquare")}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-2xl border border-[var(--border)] bg-card p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">{t("previewTitle")}</h2>
            <div className="mt-4 overflow-hidden rounded-xl border border-[var(--border)] bg-muted/20">
              <iframe src={previewSrc} title="BasicLaw embed preview" className="h-[560px] w-full border-0" loading="lazy" />
            </div>
          </div>
        </section>
      </div>

      <div className="mt-12 space-y-8">
        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-semibold">{t("iframeTitle")}</h3>
            <Button type="button" variant="secondary" size="sm" className="gap-2" onClick={() => void copy("iframe")}>
              {copied === "iframe" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              Copy
            </Button>
          </div>
          <pre className="max-h-64 overflow-auto rounded-xl border border-[var(--border)] bg-muted/30 p-4 text-xs leading-relaxed">{iframeSnippet}</pre>
        </div>
        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-semibold">{t("loaderTitle")}</h3>
            <Button type="button" variant="secondary" size="sm" className="gap-2" onClick={() => void copy("loader")}>
              {copied === "loader" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              Copy
            </Button>
          </div>
          <pre className="max-h-64 overflow-auto rounded-xl border border-[var(--border)] bg-muted/30 p-4 text-xs leading-relaxed">{loaderSnippet}</pre>
        </div>
        <p className="text-sm text-muted-foreground">{t("copyHint")}</p>
        <p className="text-sm text-muted-foreground">
          {t("healthLink")}
          <a className="font-medium text-primary underline-offset-2 hover:underline" href={`${SITE}/api/embed/health`}>
            {SITE}/api/embed/health
          </a>
        </p>
      </div>

      <section className="mt-16 rounded-2xl border border-[var(--border)] bg-muted/15 p-6">
        <h2 className="text-lg font-semibold text-foreground">{t("useCasesTitle")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t("useCasesIntro")}</p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-foreground">
          <li>{t("useCase1")}</li>
          <li>{t("useCase2")}</li>
          <li>{t("useCase3")}</li>
        </ul>
        <p className="mt-4 text-xs text-muted-foreground">{t("limitsNote")}</p>
      </section>
    </div>
  );
}
