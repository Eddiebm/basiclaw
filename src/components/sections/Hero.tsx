"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { ArrowRight, BookOpen, FileText, Globe, MessageCircle, Search, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { COUNTRIES } from "@/data/countries";
import { countryStats, getPopularCountries, searchCountries } from "@/lib/jurisdictions";
import { LEGAL_SYSTEM_LABELS } from "@/data/types";
import { RightOfDaySubscribe } from "@/components/sections/RightOfDaySubscribe";
import { fadeUpContainer, fadeUpItem, snappySpring } from "@/lib/motion-variants";
import { track } from "@/lib/analytics";

function HeroPaperMark() {
  return (
    <svg
      className="pointer-events-none absolute right-0 top-1/2 h-[min(420px,55vw)] w-[min(420px,55vw)] -translate-y-1/2 text-[var(--primary)]/12 dark:text-[var(--primary)]/20"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M48 36h88c8 0 14 6 14 14v108c0 8-6 14-14 14H48c-8 0-14-6-14-14V50c0-8 6-14 14-14Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path d="M62 58h60M62 74h44M62 90h52M62 106h36" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M118 148c12-8 22-20 28-36" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <circle cx="154" cy="46" r="6" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

export function Hero() {
  const t = useTranslations("hero");
  const router = useRouter();
  const stats = countryStats();
  const reduceMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const atlasRef = useRef<HTMLDivElement>(null);
  const [atlasOpen, setAtlasOpen] = useState(false);
  const [atlasQuery, setAtlasQuery] = useState("");
  const [askDraft, setAskDraft] = useState("");
  const [askCountry, setAskCountry] = useState("us");

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [0, 80]);
  const parallaxOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.35]);

  const popular = useMemo(() => getPopularCountries().slice(0, 5), []);
  const atlasMatches = useMemo(() => {
    if (!atlasQuery.trim()) return [];
    return searchCountries(atlasQuery).slice(0, 6);
  }, [atlasQuery]);
  const featured = popular[0] ?? COUNTRIES[0];

  useEffect(() => {
    if (!atlasOpen) return;
    function onDoc(e: MouseEvent) {
      if (atlasRef.current && !atlasRef.current.contains(e.target as Node)) {
        setAtlasOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [atlasOpen]);

  function submitAsk(e: React.FormEvent) {
    e.preventDefault();
    const q = askDraft.trim();
    if (!q) return;
    track("hero_ask_prefill_submit", { country: askCountry });
    const params = new URLSearchParams({ prefill: q, country: askCountry });
    router.push(`/chat?${params.toString()}`);
  }

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const magneticBg = useMotionTemplate`radial-gradient(120px 120px at ${mx}px ${my}px, oklch(0.45 0.12 262 / 0.12), transparent 70%)`;

  function onMagneticMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - rect.left);
    my.set(e.clientY - rect.top);
  }

  return (
    <section ref={heroRef} className="relative overflow-hidden border-b border-[var(--border)]/80 pt-28 pb-16 sm:pb-24">
      <motion.div style={{ y: parallaxY, opacity: parallaxOpacity }} className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,oklch(0.45_0.12_262/0.08),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,oklch(0.99_0.01_85/0.4),transparent_40%)] dark:bg-[linear-gradient(to_bottom,oklch(0.2_0.03_260/0.5),transparent_45%)]" />
        <div
          className="absolute inset-0 opacity-[0.35] dark:opacity-[0.2]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E")`,
          }}
        />
      </motion.div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12">
          <motion.div
            variants={fadeUpContainer}
            initial="hidden"
            animate="visible"
            viewport={{ once: true }}
            className="relative z-[1]"
          >
            <motion.div variants={fadeUpItem} className="mb-6 inline-flex items-center gap-2">
              <span className="rounded-full border border-[var(--border)] bg-[var(--surface-glass)] px-3 py-1 text-xs font-medium text-[var(--muted-foreground)] backdrop-blur-md">
                <Sparkles className="mr-1 inline h-3.5 w-3.5 text-[var(--primary)]" aria-hidden />
                {t("badge", { count: stats.total })}
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUpItem}
              className="font-editorial text-[clamp(2.5rem,6vw,4.25rem)] leading-[1.05] tracking-[-0.02em] text-[var(--foreground)]"
            >
              <span className="block text-[0.42em] font-medium tracking-normal text-[var(--muted-foreground)] [font-family:var(--font-sans),system-ui,sans-serif]">
                {t("titleLead")}
              </span>
              <span className="mt-1 block text-balance">{t("titleAccent")}</span>
              <span className="text-[0.35em] font-normal text-[var(--primary)] [font-family:var(--font-sans),system-ui,sans-serif]">.</span>
            </motion.h1>

            <motion.p
              variants={fadeUpItem}
              className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-[var(--muted-foreground)] sm:text-xl"
            >
              {t("subtitle")}
            </motion.p>

            <motion.div variants={fadeUpItem} className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="outline" className="gap-2 rounded-full border-[var(--border)] bg-transparent px-6 shadow-none hover:bg-[var(--accent)]/40">
                <Link href="/audit">
                  {t("ctaAudit")} <FileText className="h-4 w-4" aria-hidden />
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="gap-2 rounded-full px-6 text-[var(--foreground)] hover:bg-[var(--accent)]/50">
                <Link href="/chat">
                  {t("ctaAsk")} <MessageCircle className="h-4 w-4" aria-hidden />
                </Link>
              </Button>
            </motion.div>

            <motion.form
              variants={fadeUpItem}
              onSubmit={submitAsk}
              className="mt-10 max-w-xl rounded-2xl border border-[var(--border)] bg-[var(--card)]/90 p-4 shadow-paper backdrop-blur-md"
            >
              <label htmlFor="hero-ask" className="text-xs font-medium text-[var(--muted-foreground)]">
                {t("askHint")}
              </label>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-stretch">
                <input
                  id="hero-ask"
                  value={askDraft}
                  onChange={(e) => setAskDraft(e.target.value)}
                  placeholder={t("askPlaceholder")}
                  className="min-h-12 flex-1 rounded-xl border border-[var(--border)] bg-[var(--background)]/80 px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                />
                <select
                  value={askCountry}
                  onChange={(e) => setAskCountry(e.target.value)}
                  aria-label={t("newsletterJurisdiction")}
                  className="rounded-xl border border-[var(--border)] bg-[var(--background)]/80 px-3 py-3 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] sm:w-36"
                >
                  {popular.map((c) => (
                    <option key={c.code} value={c.code.toLowerCase()}>
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>
                <Button type="submit" className="rounded-xl sm:w-auto">
                  {t("askSubmit")} <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
              </div>
            </motion.form>

            <motion.div variants={fadeUpItem} className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm text-[var(--muted-foreground)]">
              <Link href="/questions" className="font-medium text-[var(--primary)] underline-offset-4 hover:underline">
                {t("ctaQuestions")}
              </Link>
              <span className="text-[var(--border)]" aria-hidden>
                ·
              </span>
              {t.rich("browseRich", {
                count: stats.total,
                link: (chunks) => (
                  <Link href="/constitutions" className="font-medium underline-offset-4 hover:underline">
                    {chunks}
                  </Link>
                ),
              })}
            </motion.div>

            <motion.div variants={fadeUpItem} className="mt-4 text-xs leading-relaxed text-[var(--muted-foreground)]">
              <span>{t("auditToolsLead")} </span>
              <Link href="/audit/lease" className="text-[var(--foreground)] underline-offset-2 hover:underline">
                {t("auditToolsLease")}
              </Link>
              <span aria-hidden> · </span>
              <Link href="/audit/employment" className="text-[var(--foreground)] underline-offset-2 hover:underline">
                {t("auditToolsEmployment")}
              </Link>
              <span aria-hidden> · </span>
              <Link href="/audit/terms" className="text-[var(--foreground)] underline-offset-2 hover:underline">
                {t("auditToolsTerms")}
              </Link>
            </motion.div>

            <motion.p variants={fadeUpItem} className="mt-4 text-xs text-[var(--muted-foreground)]">
              {t("extensionLead")}{" "}
              <Link href="/extension" className="font-medium text-[var(--primary)] underline-offset-4 hover:underline">
                {t("extensionCta")}
              </Link>
            </motion.p>

            <motion.p variants={fadeUpItem} className="mt-3 text-xs text-[var(--ink-muted)]">
              {t("tinyDisclaimer")}
            </motion.p>

            <motion.div variants={fadeUpItem} className="mt-8">
              <RightOfDaySubscribe />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={snappySpring}
            className="relative"
          >
            <HeroPaperMark />
            <div
              ref={atlasRef}
              onMouseMove={onMagneticMove}
              className="relative overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[var(--surface-glass)] shadow-paper backdrop-blur-xl"
            >
              <motion.div className="pointer-events-none absolute inset-0 opacity-70" style={{ background: magneticBg }} />
              <div className="relative space-y-5 p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
                      {t("atlasEyebrow")}
                    </p>
                    <h2 className="mt-1 font-editorial text-2xl text-[var(--foreground)] sm:text-3xl">{t("atlasTitle")}</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAtlasOpen((o) => !o)}
                    className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--background)]/70 px-4 py-2 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--primary)]/40"
                    aria-expanded={atlasOpen}
                    aria-haspopup="dialog"
                  >
                    <Globe className="h-4 w-4 text-[var(--primary)]" aria-hidden />
                    {t("browseConstitutionsLink")}
                  </button>
                </div>

                <div className="rounded-2xl border border-[var(--border)]/80 bg-[var(--background)]/50 p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                    {t("snapshotLabel")}
                  </p>
                  <div className="mt-3 flex items-start gap-4">
                    <span className="text-4xl leading-none" aria-hidden>
                      {featured.flag}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-editorial text-xl text-[var(--foreground)]">{featured.name}</p>
                      <p className="mt-1 text-sm text-[var(--muted-foreground)]">{LEGAL_SYSTEM_LABELS[featured.legalSystem]}</p>
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--foreground)]/90">
                        {featured.constitution.summary}
                      </p>
                      <Button asChild variant="link" className="mt-3 h-auto p-0 text-[var(--primary)]">
                        <Link href={`/constitutions/${featured.code.toLowerCase()}`}>
                          {t("cardLibrary_link")} <ArrowRight className="h-4 w-4" aria-hidden />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {atlasOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      role="dialog"
                      aria-label={t("atlasTitle")}
                      className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]"
                    >
                      <div className="border-b border-[var(--border)] p-3">
                        <div className="relative">
                          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" aria-hidden />
                          <input
                            type="search"
                            value={atlasQuery}
                            onChange={(e) => setAtlasQuery(e.target.value)}
                            placeholder={t("atlasSearchPlaceholder")}
                            className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                          />
                        </div>
                      </div>
                      <ul className="max-h-64 overflow-y-auto divide-y divide-[var(--border)]/60">
                        {(atlasMatches.length > 0 ? atlasMatches : popular).map((country) => (
                          <li key={country.code}>
                            <Link
                              href={`/constitutions/${country.code.toLowerCase()}`}
                              onClick={() => {
                                setAtlasOpen(false);
                                track("country_selected", { country_code: country.code, country: country.name, source: "hero_atlas" });
                              }}
                              className="flex items-center gap-3 px-4 py-3 text-sm transition hover:bg-[var(--accent)]/50"
                            >
                              <span className="text-xl" aria-hidden>
                                {country.flag}
                              </span>
                              <span className="text-[var(--foreground)]">{country.name}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <div className="border-t border-[var(--border)] p-2">
                        <Link
                          href="/constitutions"
                          className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-[var(--primary)] hover:bg-[var(--accent)]/40"
                          onClick={() => setAtlasOpen(false)}
                        >
                          {t("cardLibrary_link")}
                          <BookOpen className="h-4 w-4" aria-hidden />
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={snappySpring}
          className="mt-16 grid gap-6 border-t border-[var(--border)]/80 pt-10 sm:grid-cols-3"
        >
          {[
            { label: t("trustStripCountries", { count: stats.total }), sub: t("trustCard1Body") },
            { label: t("trustStripConstitutions", { count: stats.total }), sub: t("trustCard2Body") },
            { label: t("trustStripQuestions"), sub: t("trustCard3Body") },
          ].map((item) => (
            <motion.div
              key={item.label}
              whileHover={{ y: -3 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="rounded-2xl border border-[var(--border)]/70 bg-[var(--card)]/60 px-5 py-6 text-left shadow-[0_1px_0_oklch(0_0_0/0.04)] backdrop-blur-sm"
            >
              <p className="font-editorial text-2xl text-[var(--foreground)]">{item.label}</p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">{item.sub}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
