import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Library,
  MessageCircle,
  Scale,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { Navigation } from "@/components/sections/Navigation";
import { Footer } from "@/components/sections/Footer";
import { Button } from "@/components/ui/Button";
import { EventTracker } from "@/components/analytics/EventTracker";
import type { Country } from "@/data/types";
import { LEGAL_SYSTEM_LABELS } from "@/data/types";
import { getLastVerified } from "@/lib/jurisdictions";

export type TopicSlug = "rights" | "police-stop" | "landlord";

export interface TopicSection {
  heading: string;
  body: string;
  bullets?: string[];
}

export interface TopicFAQ {
  q: string;
  a: string;
}

export interface TopicContent {
  slug: TopicSlug;
  countryCode: string;
  title: string;
  intro: string;
  sections: TopicSection[];
  faqs: TopicFAQ[];
  prefilledQuestion: string;
}

const TOPIC_LABELS: Record<TopicSlug, string> = {
  rights: "Your rights",
  "police-stop": "Police stops",
  landlord: "Tenant & landlord",
};

const TOPIC_SUBTITLE: Record<TopicSlug, string> = {
  rights: "Plain-language guide to your constitutional rights",
  "police-stop": "What to say, what to show, what you must do",
  landlord: "Deposits, evictions, repairs, and what your lease can't override",
};

const TOPIC_ICON: Record<TopicSlug, React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>> = {
  rights: Sparkles,
  "police-stop": ShieldAlert,
  landlord: Scale,
};

export function TopicPage({
  country,
  topic,
  content,
}: {
  country: Country;
  topic: TopicSlug;
  content: TopicContent;
}) {
  const lastVerified = getLastVerified(country);
  const formattedLastVerified = new Date(lastVerified).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const Icon = TOPIC_ICON[topic];

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "BasicLaw", item: "/" },
      {
        "@type": "ListItem",
        position: 2,
        name: country.name,
        item: `/constitutions/${country.code.toLowerCase()}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: TOPIC_LABELS[topic],
        item: `/${country.code.toLowerCase()}/${topic}`,
      },
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

  return (
    <main className="min-h-screen">
      <Navigation />
      <EventTracker
        event="topic_page_viewed"
        properties={{ topic, country_code: country.code, country: country.name }}
      />
      <article className="pt-28 pb-16">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1fr_320px] gap-10">
          <div>
            <nav aria-label="Breadcrumb" className="text-xs text-[var(--muted-foreground)] mb-4 flex items-center gap-2">
              <Link href="/" className="hover:text-[var(--foreground)]">BasicLaw</Link>
              <span aria-hidden>/</span>
              <Link href="/constitutions" className="hover:text-[var(--foreground)]">Constitutions</Link>
              <span aria-hidden>/</span>
              <Link
                href={`/constitutions/${country.code.toLowerCase()}`}
                className="hover:text-[var(--foreground)]"
              >
                {country.flag} {country.name}
              </Link>
              <span aria-hidden>/</span>
              <span className="text-[var(--foreground)]">{TOPIC_LABELS[topic]}</span>
            </nav>

            <header className="mb-8">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium mb-3">
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {TOPIC_SUBTITLE[topic]}
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] leading-tight">
                {content.title}
              </h1>
              <p className="mt-4 text-lg text-[var(--muted-foreground)]">{content.intro}</p>
            </header>

            <div
              role="note"
              className="mb-8 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-200"
            >
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden />
              <p>
                <strong className="font-semibold">Educational only.</strong> Local rules, recent amendments, and case-law nuance can change the answer for your specific situation. Use this page to understand the landscape, then talk to a licensed lawyer in {country.name} for advice you can act on.
              </p>
            </div>

            <div className="space-y-8">
              {content.sections.map((section) => (
                <section key={section.heading} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8">
                  <h2 className="text-xl font-semibold text-[var(--foreground)] mb-3">{section.heading}</h2>
                  <p className="text-[var(--muted-foreground)] leading-relaxed">{section.body}</p>
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
                Frequently asked questions
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

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Button asChild className="gap-2">
                <Link
                  href={`/chat?country=${country.code.toLowerCase()}&q=${encodeURIComponent(content.prefilledQuestion)}`}
                >
                  <MessageCircle className="h-4 w-4" />
                  Ask a question about {country.name}
                </Link>
              </Button>
              <Button asChild variant="outline" className="gap-2">
                <Link href={`/constitutions/${country.code.toLowerCase()}`}>
                  <Library className="h-4 w-4" />
                  Read {country.name}&apos;s constitution
                </Link>
              </Button>
            </div>

            <p className="mt-6 text-xs text-[var(--muted-foreground)]">
              Last verified <time dateTime={lastVerified}>{formattedLastVerified}</time>. Spotted something wrong? Email <a href={`mailto:corrections@basiclaw.app?subject=Correction%3A%20${encodeURIComponent(country.name)}%20${encodeURIComponent(TOPIC_LABELS[topic])}`} className="underline underline-offset-2">corrections@basiclaw.app</a>.
            </p>
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 sticky top-24">
              <p className="text-xs uppercase tracking-wider text-[var(--muted-foreground)] mb-2">Jurisdiction</p>
              <p className="text-2xl mb-1" aria-hidden>{country.flag}</p>
              <p className="font-semibold text-[var(--foreground)]">{country.name}</p>
              <p className="text-sm text-[var(--muted-foreground)] mb-4">
                {LEGAL_SYSTEM_LABELS[country.legalSystem]}
              </p>
              <div className="space-y-2 border-t border-[var(--border)]/60 pt-4">
                <Link
                  href={`/constitutions/${country.code.toLowerCase()}`}
                  className="flex items-center justify-between text-sm hover:text-[var(--primary)]"
                >
                  Constitution overview <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
                <Link
                  href={`/${country.code.toLowerCase()}/rights`}
                  className="flex items-center justify-between text-sm hover:text-[var(--primary)]"
                >
                  Your rights <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
                <Link
                  href={`/${country.code.toLowerCase()}/police-stop`}
                  className="flex items-center justify-between text-sm hover:text-[var(--primary)]"
                >
                  Police stops <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
                <Link
                  href={`/${country.code.toLowerCase()}/landlord`}
                  className="flex items-center justify-between text-sm hover:text-[var(--primary)]"
                >
                  Tenant &amp; landlord <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </div>
            </div>
          </aside>
        </div>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mt-12">
          <Link
            href={`/constitutions/${country.code.toLowerCase()}`}
            className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to {country.name}&apos;s constitution
          </Link>
        </div>
      </article>
      <Footer />
    </main>
  );
}
