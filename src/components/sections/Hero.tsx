"use client";

import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  FileText,
  Globe,
  Library,
  MessageCircle,
  Shield,
  Sparkles,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { countryStats } from "@/lib/jurisdictions";
import { RightOfDaySubscribe } from "@/components/sections/RightOfDaySubscribe";

export function Hero() {
  const t = useTranslations("hero");
  const stats = countryStats();

  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 via-transparent to-[var(--primary)]/10" />
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.04]"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        <div className="absolute -top-32 -right-24 h-96 w-96 rounded-full bg-[var(--primary)]/15 blur-3xl" />
        <div className="absolute top-1/3 -left-24 h-72 w-72 rounded-full bg-[var(--primary)]/10 blur-3xl" />
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4" aria-hidden />
                {t("badge", { count: stats.total })}
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--foreground)] leading-[1.05] mb-6">
                {t("titleLead")}{" "}
                <span className="text-[var(--primary)]">{t("titleAccent")}</span>.
              </h1>
              <p className="text-lg sm:text-xl text-[var(--muted-foreground)] mb-8 max-w-xl mx-auto lg:mx-0">
                {t("subtitle")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button asChild size="lg" className="gap-2">
                  <Link href="/audit">
                    {t("ctaAudit")} <FileText className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="gap-2">
                  <Link href="/chat">
                    {t("ctaAsk")} <MessageCircle className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <RightOfDaySubscribe />
              <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                <Link href="/questions" className="font-medium text-[var(--primary)] hover:underline">
                  {t("ctaQuestions")}
                </Link>
              </p>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                {t.rich("browseRich", {
                  count: stats.total,
                  link: (chunks) => (
                    <Link href="/constitutions" className="underline underline-offset-4 hover:text-[var(--foreground)]">
                      {chunks}
                    </Link>
                  ),
                })}
              </p>
              <p className="mt-2 text-sm text-[var(--muted-foreground)] flex flex-wrap items-center justify-center lg:justify-start gap-x-2 gap-y-1">
                <span>{t("auditToolsLead")}</span>
                <Link href="/audit/lease" className="underline underline-offset-4 hover:text-[var(--foreground)]">
                  {t("auditToolsLease")}
                </Link>
                <span aria-hidden className="text-[var(--muted-foreground)]">
                  ·
                </span>
                <Link href="/audit/employment" className="underline underline-offset-4 hover:text-[var(--foreground)]">
                  {t("auditToolsEmployment")}
                </Link>
                <span aria-hidden className="text-[var(--muted-foreground)]">
                  ·
                </span>
                <Link href="/audit/terms" className="underline underline-offset-4 hover:text-[var(--foreground)]">
                  {t("auditToolsTerms")}
                </Link>
              </p>
              <p className="mt-3 text-sm text-[var(--muted-foreground)] flex flex-wrap items-center justify-center lg:justify-start gap-x-2 gap-y-1">
                <span>{t("extensionLead")}</span>
                <Link
                  href="/extension"
                  className="inline-flex items-center gap-1 font-medium text-[var(--primary)] underline underline-offset-4 hover:opacity-80"
                >
                  {t("extensionCta")} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </p>
              <p className="mt-4 text-xs text-[var(--muted-foreground)]">{t("tinyDisclaimer")}</p>
            </motion.div>
          </div>
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="col-span-2 sm:col-span-1 p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-lg"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-[var(--primary)]/10">
                    <MessageCircle className="h-5 w-5 text-[var(--primary)]" />
                  </div>
                  <span className="font-semibold text-[var(--foreground)]">{t("cardQA_title")}</span>
                </div>
                <p className="text-sm text-[var(--muted-foreground)]">{t("cardQA_body")}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="col-span-2 sm:col-span-1 p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-lg"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-[var(--secondary)]/30">
                    <FileText className="h-5 w-5 text-[var(--secondary-foreground)]" />
                  </div>
                  <span className="font-semibold text-[var(--foreground)]">{t("cardAudit_title")}</span>
                </div>
                <p className="text-sm text-[var(--muted-foreground)]">{t("cardAudit_body")}</p>
                <Link
                  href="/audit"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[var(--primary)] hover:underline"
                >
                  {t("cardAudit_link")} <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="col-span-2 p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-lg"
              >
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[var(--accent)]">
                      <Library className="h-5 w-5 text-[var(--accent-foreground)]" />
                    </div>
                    <div>
                      <span className="block font-semibold text-[var(--foreground)]">{t("cardLibrary_title")}</span>
                      <span className="text-sm text-[var(--muted-foreground)]">{t("cardLibrary_body")}</span>
                    </div>
                  </div>
                  <Link
                    href="/constitutions"
                    className="inline-flex items-center gap-1 text-sm font-medium text-[var(--primary)] hover:underline"
                  >
                    {t("cardLibrary_link")} <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-16 pt-8 border-t border-[var(--border)]"
        >
          <div className="flex flex-wrap items-center justify-center gap-8 text-[var(--muted-foreground)]">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" aria-hidden />
              <span className="text-sm">{t("statsEducational")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5" aria-hidden />
              <span className="text-sm">{t("statsJurisdictions", { count: stats.total })}</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" aria-hidden />
              <span className="text-sm">{t("statsPlainLanguage")}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
