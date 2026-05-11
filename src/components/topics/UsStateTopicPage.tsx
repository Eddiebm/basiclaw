"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Briefcase,
  Library,
  MessageCircle,
  Scale,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { LawyerCtaLink } from "@/components/analytics/LawyerCtaLink";
import { Navigation } from "@/components/sections/Navigation";
import { Footer } from "@/components/sections/Footer";
import { Button } from "@/components/ui/Button";
import { EventTracker } from "@/components/analytics/EventTracker";
import type { UsState } from "@/data/us-states";
import type { UsStateTopicContent } from "@/lib/us-state-topic-content";
import type { UsStateTopicSlug } from "@/data/us-states";

const TOPIC_ICON: Record<
  UsStateTopicSlug,
  React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>
> = {
  rights: Sparkles,
  "police-stop": ShieldAlert,
  landlord: Scale,
  employment: Briefcase,
};

export function UsStateTopicPage({
  state,
  topic,
  content,
  showPendingCta,
}: {
  state: UsState;
  topic: UsStateTopicSlug;
  content: UsStateTopicContent;
  showPendingCta: boolean;
}) {
  const t = useTranslations("usStateTopicPage");
  const Icon = TOPIC_ICON[topic];
  const topicLabel = t(`labels.${topic}`);
  const topicSubtitle = t(`subtitles.${topic}`, { state: state.name });
  const pageHeading = t(`headings.${topic}`, { state: state.name });

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "BasicLaw", item: "https://basiclaw.app/" },
      { "@type": "ListItem", position: 2, name: t("breadcrumbStates"), item: "/us/states" },
      { "@type": "ListItem", position: 3, name: state.name, item: `/us/states#${state.slug}` },
      { "@type": "ListItem", position: 4, name: topicLabel, item: `/us/${state.slug}/${topic}` },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: content.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };

  const chatHref = `/chat?jurisdiction=us&country=us&state=${encodeURIComponent(state.code)}`;

  return (
    <main className="min-h-screen">
      <Navigation />
      <EventTracker
        event="us_state_topic_viewed"
        properties={{ topic, state: state.code, state_name: state.name }}
      />
      <article className="pt-28 pb-16">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1fr_320px] gap-10">
          <div>
            <nav aria-label="Breadcrumb" className="text-xs text-[var(--muted-foreground)] mb-4 flex flex-wrap items-center gap-2">
              <Link href="/" className="hover:text-[var(--foreground)]">
                {t("breadcrumbHome")}
              </Link>
              <span aria-hidden>/</span>
              <Link href="/constitutions/us" className="hover:text-[var(--foreground)]">
                {t("breadcrumbUs")}
              </Link>
              <span aria-hidden>/</span>
              <Link href="/us/states" className="hover:text-[var(--foreground)]">
                {t("breadcrumbStates")}
              </Link>
              <span aria-hidden>/</span>
              <Link href={`/us/states#${state.slug}`} className="hover:text-[var(--foreground)]">
                {state.name}
              </Link>
              <span aria-hidden>/</span>
              <span className="text-[var(--foreground)]">{topicLabel}</span>
            </nav>

            <header className="mb-8">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium mb-3">
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {topicSubtitle}
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] leading-tight">{pageHeading}</h1>
              <p className="mt-4 text-lg text-[var(--muted-foreground)]">{content.intro}</p>
            </header>

            {showPendingCta && (
              <div
                role="note"
                className="mb-8 rounded-2xl border border-[var(--primary)]/30 bg-[var(--primary)]/5 p-4 text-sm text-[var(--foreground)]"
              >
                <p className="font-medium mb-1">{t("pendingTitle")}</p>
                <p className="text-[var(--muted-foreground)] mb-3">{t("pendingBody", { state: state.name })}</p>
                <Button asChild size="sm" className="gap-2">
                  <Link href={`${chatHref}&q=${encodeURIComponent(content.prefilledQuestion)}`}>
                    <MessageCircle className="h-4 w-4" />
                    {t("pendingCta")}
                  </Link>
                </Button>
              </div>
            )}

            <div
              role="note"
              className="mb-8 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-200"
            >
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden />
              <p>
                <strong className="font-semibold">{t("eduOnlyStrong")}</strong> {t("eduOnlyBody", { state: state.name })}
              </p>
            </div>

            <div className="space-y-8">
              {content.sections.map((section) => (
                <section key={section.heading} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8">
                  <h2 className="text-xl font-semibold text-[var(--foreground)] mb-3">{section.heading}</h2>
                  <p className="text-[var(--muted-foreground)] leading-relaxed whitespace-pre-line">{section.body}</p>
                  {section.bullets && section.bullets.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {section.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-start gap-2 text-sm text-[var(--foreground)]">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--primary)] flex-shrink-0" aria-hidden />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>

            <section className="mt-10 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-5 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-[var(--primary)]" aria-hidden />
                {t("faqHeading")}
              </h2>
              <dl className="divide-y divide-[var(--border)]/60">
                {content.faqs.map((faq) => (
                  <div key={faq.q} className="py-4 first:pt-0 last:pb-0">
                    <dt className="font-medium text-[var(--foreground)]">{faq.q}</dt>
                    <dd className="mt-1 text-sm text-[var(--muted-foreground)] leading-relaxed">{faq.a}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <div className="mt-10 flex flex-col sm:flex-row gap-3 flex-wrap">
              <Button asChild className="gap-2">
                <Link href={`${chatHref}&q=${encodeURIComponent(content.prefilledQuestion)}`}>
                  <MessageCircle className="h-4 w-4" />
                  {t("askPrefill", { state: state.name })}
                </Link>
              </Button>
              <Button asChild variant="outline" className="gap-2">
                <Link href="/constitutions/us">
                  <Library className="h-4 w-4" />
                  {t("readUsConstitution")}
                </Link>
              </Button>
              <LawyerCtaLink
                href={`/find-a-lawyer?country=us&state=${state.code.toLowerCase()}`}
                source="us_state_topic"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-transparent px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors"
              >
                <Scale className="h-4 w-4" />
                {t("findLawyerCta")}
              </LawyerCtaLink>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 sticky top-24">
              <p className="text-xs uppercase tracking-wider text-[var(--muted-foreground)] mb-2">{t("jurisdiction")}</p>
              <p className="text-2xl mb-1" aria-hidden>
                🇺🇸
              </p>
              <p className="font-semibold text-[var(--foreground)]">{state.name}</p>
              <p className="text-sm text-[var(--muted-foreground)] mb-4">
                {t("capitalLabel")}: {state.capital}
              </p>
              <div className="space-y-2 border-t border-[var(--border)]/60 pt-4">
                <Link href="/constitutions/us" className="flex items-center justify-between text-sm hover:text-[var(--primary)]">
                  {t("usConstitution")} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
                <Link href="/us/states" className="flex items-center justify-between text-sm hover:text-[var(--primary)]">
                  {t("allStates")} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
                {(["rights", "police-stop", "landlord", "employment"] as const).map((slug) => (
                  <Link
                    key={slug}
                    href={`/us/${state.slug}/${slug}`}
                    className="flex items-center justify-between text-sm hover:text-[var(--primary)]"
                  >
                    {t(`labels.${slug}`)}
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mt-12">
          <Link
            href="/us/states"
            className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {t("backToStates")}
          </Link>
        </div>
      </article>
      <Footer />
    </main>
  );
}
