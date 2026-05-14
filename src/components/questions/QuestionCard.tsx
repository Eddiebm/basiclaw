"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AlertTriangle, MessageCircle } from "lucide-react";
import type { CitizenQuestion } from "@/data/questions/types";
import { cn } from "@/lib/utils";
import { answerAvailabilityForQuestion, buildChatPrefillHref } from "@/lib/question-routing";
import { DOMAIN_LABEL, RISK_LABEL, STAGE_LABEL } from "./labels";
import { track } from "@/lib/analytics";

interface QuestionCardProps {
  question: CitizenQuestion;
  activeCountryCodeLower: string;
}

export function QuestionCard({ question, activeCountryCodeLower }: QuestionCardProps) {
  const t = useTranslations("questionsLibrary");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const viewedRef = useRef(false);
  const availability = answerAvailabilityForQuestion(
    question,
    activeCountryCodeLower.toUpperCase()
  );

  const chatHref = buildChatPrefillHref({
    questionText: question.question,
    activeCountryCodeLower,
    stage: question.stage,
    domain: question.domain,
    risk: question.risk,
  });

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || viewedRef.current) continue;
          viewedRef.current = true;
          track("question_viewed", {
            stage: question.stage,
            domain: question.domain,
            risk: question.risk,
          });
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [question.domain, question.risk, question.stage]);

  return (
    <div
      ref={rootRef}
      role="article"
      id={question.id}
      className={cn(
        "rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm",
        question.disclaimerTier === "elevated" && "border-amber-500/40"
      )}
    >
      {question.disclaimerTier === "elevated" && (
        <div className="mb-3 flex items-start gap-2 rounded-xl bg-amber-500/10 px-3 py-2 text-xs text-amber-950 dark:text-amber-100">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p className="font-medium">{t("urgentDisclaimer")}</p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
        <span>{STAGE_LABEL[question.stage] ?? question.stage}</span>
        <span aria-hidden>·</span>
        <span>{DOMAIN_LABEL[question.domain]}</span>
        <span aria-hidden>·</span>
        <span>{RISK_LABEL[question.risk] ?? question.risk}</span>
        <span
          className={cn(
            "ml-auto rounded-full px-2 py-0.5 normal-case",
            availability === "full"
              ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-100"
              : "bg-muted text-muted-foreground"
          )}
        >
          {availability === "full" ? t("availabilityFull") : t("availabilityLimited")}
        </span>
      </div>

      <p className="mt-3 text-sm font-medium text-[var(--foreground)] leading-relaxed">{question.question}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <ButtonLink href={chatHref}>
          <MessageCircle className="h-4 w-4" aria-hidden />
          {t("askInChat")}
        </ButtonLink>
        <Link
          href={`/constitutions/${activeCountryCodeLower}`}
          className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-background px-3 py-1.5 text-xs font-medium hover:bg-[var(--accent)]/40"
        >
          {t("constitutionOverview")}
        </Link>
      </div>
      <p className="mt-4 text-xs text-[var(--muted-foreground)]">
        <span>{t("discussionLead")}</span>{" "}
        <Link href={chatHref} className="font-semibold text-[var(--primary)] hover:underline">
          {t("openInAskLink")}
        </Link>
      </p>
    </div>
  );
}

function ButtonLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-[var(--primary-foreground)] hover:opacity-95"
    >
      {children}
    </Link>
  );
}
