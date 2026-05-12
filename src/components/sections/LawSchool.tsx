"use client";

import { Link } from "@/i18n/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Award, BookOpen, ChevronRight, PlayCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { fadeUpContainer, fadeUpItem } from "@/lib/motion-variants";

const LESSON_KEYS = ["l1", "l2", "l3", "l4", "l5", "l6"] as const;

/** Aligns homepage cards with course anchors on `/learn` */
const LESSON_COURSE_ANCHOR: Record<(typeof LESSON_KEYS)[number], string> = {
  l1: "rights",
  l2: "contracts",
  l3: "housing",
  l4: "family",
  l5: "rights",
  l6: "contracts",
};

export function LawSchool() {
  const t = useTranslations("lawSchoolSection");
  const reduce = useReducedMotion();

  return (
    <section className="py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeUpContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="text-center"
        >
          <motion.div variants={fadeUpItem} className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)]/70 px-4 py-1.5 text-xs font-medium text-[var(--muted-foreground)] backdrop-blur-sm">
            <BookOpen className="h-3.5 w-3.5 text-[var(--primary)]" aria-hidden />
            {t("eyebrow")}
          </motion.div>
          <motion.h2 variants={fadeUpItem} className="mt-4 font-editorial text-4xl text-[var(--foreground)] sm:text-5xl">
            {t("title")}
          </motion.h2>
          <motion.p variants={fadeUpItem} className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-[var(--muted-foreground)]">
            {t("subtitle")}
          </motion.p>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
          className="relative mt-14 overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[var(--primary)] text-[var(--primary-foreground)] shadow-paper"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,oklch(1_0_0/0.12),transparent_45%)]" aria-hidden />
          <div className="relative flex flex-col gap-8 p-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium">
                <Award className="h-3.5 w-3.5" aria-hidden />
                {t("featuredBadge")}
              </div>
              <h3 className="mt-4 font-editorial text-3xl leading-tight">{t("featuredTitle")}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/85">{t("featuredBody")}</p>
              <p className="mt-4 text-xs uppercase tracking-[0.18em] text-white/70">{t("featuredMeta")}</p>
            </div>
            <Button asChild size="lg" variant="secondary" className="shrink-0 gap-2 rounded-full bg-white text-[var(--foreground)] hover:bg-white/90">
              <Link href="/learn">
                <PlayCircle className="h-5 w-5" aria-hidden />
                {t("featuredCta")}
              </Link>
            </Button>
          </div>
        </motion.div>

        <p className="mt-6 text-center text-xs uppercase tracking-[0.2em] text-[var(--muted-foreground)]">{t("carouselHint")}</p>
        <div className="mt-4 flex gap-4 overflow-x-auto pb-4 pt-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory">
          {LESSON_KEYS.map((lessonKey, index) => {
            const title = t(`lessons.${lessonKey}.title` as "lessons.l1.title");
            const description = t(`lessons.${lessonKey}.description` as "lessons.l1.description");
            const meta = t(`lessons.${lessonKey}.meta` as "lessons.l1.meta");
            const level = t(`lessons.${lessonKey}.level` as "lessons.l1.level");
            const levelLabel = t(`levels.${level}` as "levels.Beginner");
            const courseId = LESSON_COURSE_ANCHOR[lessonKey];
            return (
              <motion.article
                key={lessonKey}
                initial={reduce ? false : { opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.04, type: "spring", stiffness: 200, damping: 22 }}
                className="relative w-[min(100%,280px)] shrink-0 snap-start rounded-2xl border border-[var(--border)] bg-[var(--card)]/95 p-6 shadow-paper backdrop-blur-sm"
              >
                <span className="inline-block rounded-full border border-[var(--border)] bg-[var(--muted)]/30 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  {levelLabel}
                </span>
                <h4 className="mt-4 font-editorial text-xl text-[var(--foreground)]">{title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">{description}</p>
                <p className="mt-4 text-xs text-[var(--ink-muted)]">{meta}</p>
                <Button asChild variant="ghost" className="mt-4 w-full justify-between rounded-xl px-0 text-[var(--primary)] hover:bg-transparent hover:underline">
                  <Link href={`/learn#course-${courseId}`} className="inline-flex w-full items-center justify-between">
                    {t("courseCta")}
                    <ChevronRight className="h-4 w-4" aria-hidden />
                  </Link>
                </Button>
              </motion.article>
            );
          })}
        </div>

        <div className="mt-10 flex justify-center">
          <Button asChild variant="outline" className="rounded-full border-[var(--border)] px-6">
            <Link href="/learn" className="inline-flex items-center gap-2">
              {t("exploreAll")} <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
