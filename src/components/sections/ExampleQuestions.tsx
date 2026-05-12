"use client";

import { Link } from "@/i18n/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { fadeUpContainer, fadeUpItem } from "@/lib/motion-variants";

const ITEM_KEYS = ["q1", "q2", "q3", "q4", "q5", "q6"] as const;

export function ExampleQuestions() {
  const t = useTranslations("exampleQuestionsSection");
  const reduce = useReducedMotion();

  return (
    <section className="border-b border-[var(--border)]/60 bg-[var(--accent)]/20 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeUpContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.h2 variants={fadeUpItem} className="font-editorial text-4xl text-[var(--foreground)] sm:text-5xl">
            {t("title")}
          </motion.h2>
          <motion.p variants={fadeUpItem} className="mt-4 text-lg leading-relaxed text-[var(--muted-foreground)]">
            {t("subtitle")}
          </motion.p>
        </motion.div>

        <motion.div
          variants={fadeUpItem}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mx-auto mt-12 max-w-2xl"
        >
          <div className="relative rounded-2xl border border-[var(--border)] bg-[var(--card)]/80 p-1 shadow-paper backdrop-blur-sm">
            <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--muted-foreground)]" aria-hidden />
            <input
              type="search"
              readOnly
              placeholder={t("searchPlaceholder")}
              aria-label={t("searchPlaceholder")}
              className="h-14 w-full cursor-not-allowed rounded-[1.1rem] bg-transparent pl-12 pr-28 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none"
            />
            <Button type="button" variant="secondary" className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded-xl">
              {t("searchButton")}
            </Button>
          </div>
        </motion.div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ITEM_KEYS.map((key, index) => {
            const category = t(`items.${key}.category` as "items.q1.category");
            const text = t(`items.${key}.text` as "items.q1.text");
            return (
              <motion.div
                key={key}
                initial={reduce ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: index * 0.05, type: "spring", stiffness: 120, damping: 18 }}
              >
                <Link
                  href={`/chat?prefill=${encodeURIComponent(text)}&country=us`}
                  className="group flex h-full flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)]/90 p-6 shadow-[0_1px_0_oklch(0_0_0/0.04)] transition hover:-translate-y-1 hover:border-[var(--primary)]/35 hover:shadow-lift"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--oxblood)]">
                    {t(`categories.${category}` as "categories.police")}
                  </p>
                  <p className="mt-4 font-editorial text-xl leading-snug text-[var(--foreground)] group-hover:text-[var(--primary)]">
                    {text}
                  </p>
                  <span className="mt-auto flex items-center gap-2 pt-6 text-sm text-[var(--muted-foreground)]">
                    {t("askThis")}
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-14 flex justify-center"
        >
          <Button asChild variant="outline" className="rounded-full border-[var(--border)] bg-[var(--surface-glass)] px-6 backdrop-blur-sm">
            <Link href="/questions" className="gap-2">
              {t("browseTopics")} <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
