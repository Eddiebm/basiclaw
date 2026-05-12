import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { Navigation } from "@/components/sections/Navigation";
import { Footer } from "@/components/sections/Footer";
import { LawyerCtaLink } from "@/components/analytics/LawyerCtaLink";
import { DemandLetterGeneratorClient } from "./DemandLetterGeneratorClient";
import { buildOgImageUrl } from "@/lib/og-image-url";

function faqJsonLd(items: { question: string; answer: string }[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 text-left">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-sm font-semibold">
        {n}
      </span>
      <p className="mt-3 font-semibold text-[var(--foreground)]">{title}</p>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">{body}</p>
    </div>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auditDemandLetterPage" });
  const title = t("metaTitle");
  const description = t("metaDescription");
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://basiclaw.app";
  const og = buildOgImageUrl(site, { kind: "audit", title, subtitle: description });
  return {
    title,
    description,
    alternates: { canonical: `/${locale}/audit/demand-letter-generator` },
    openGraph: {
      title,
      description,
      url: `/${locale}/audit/demand-letter-generator`,
      type: "website",
      images: [{ url: og, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [og] },
  };
}

export default async function DemandLetterGeneratorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auditDemandLetterPage" });
  const faqItems = [
    { question: t("faq1_q"), answer: t("faq1_a") },
    { question: t("faq2_q"), answer: t("faq2_a") },
    { question: t("faq3_q"), answer: t("faq3_a") },
  ];
  const jsonLd = faqJsonLd(faqItems);

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navigation />
      <section className="pt-28 pb-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium mb-4">
            <Sparkles className="h-3.5 w-3.5" aria-hidden /> {t("badge")}
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--foreground)] leading-tight">{t("title")}</h1>
          <p className="mt-4 text-lg text-[var(--muted-foreground)]">{t("subtitle")}</p>
        </div>
      </section>
      <section className="pb-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <DemandLetterGeneratorClient />
          <div className="mt-10 grid sm:grid-cols-3 gap-3 text-center">
            <Step n={1} title={t("step1_title")} body={t("step1_body")} />
            <Step n={2} title={t("step2_title")} body={t("step2_body")} />
            <Step n={3} title={t("step3_title")} body={t("step3_body")} />
          </div>
          <div className="mt-10 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 text-center space-y-3">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">{t("lawyerSection_title")}</h2>
            <p className="text-sm text-[var(--muted-foreground)]">{t("lawyerSection_body")}</p>
            <LawyerCtaLink
              href="/find-a-lawyer"
              source="audit_demand_letter_page"
              className="inline-flex items-center gap-2 text-sm font-medium text-[var(--primary)] underline-offset-4 hover:underline"
            >
              {t("lawyerSection_cta")}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </LawyerCtaLink>
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] underline-offset-4 hover:underline"
            >
              {t("proLink")} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
