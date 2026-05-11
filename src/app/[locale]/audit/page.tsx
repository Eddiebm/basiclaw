import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { Navigation } from "@/components/sections/Navigation";
import { Footer } from "@/components/sections/Footer";
import { AuditClient } from "./AuditClient";
import { LawyerCtaLink } from "@/components/analytics/LawyerCtaLink";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auditPage" });
  const title = t("title");
  const description = t("subtitle");
  return {
    title,
    description,
    alternates: { canonical: `/${locale}/audit` },
    openGraph: {
      title,
      description,
      url: `/${locale}/audit`,
      type: "website",
    },
  };
}

export default async function AuditPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auditPage" });

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: t("faq1_q"),
        acceptedAnswer: { "@type": "Answer", text: t("faq1_a") },
      },
      {
        "@type": "Question",
        name: t("faq2_q"),
        acceptedAnswer: { "@type": "Answer", text: t("faq2_a") },
      },
      {
        "@type": "Question",
        name: t("faq3_q"),
        acceptedAnswer: { "@type": "Answer", text: t("faq3_a") },
      },
    ],
  };

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Navigation />
      <section className="pt-28 pb-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium mb-4">
            <Sparkles className="h-3.5 w-3.5" aria-hidden /> {t("badge")}
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--foreground)] leading-tight">
            {t("title")}
          </h1>
          <p className="mt-4 text-lg text-[var(--muted-foreground)]">{t("subtitle")}</p>
        </div>
      </section>
      <section className="pb-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">{t("specialtiesTitle")}</h2>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">{t("specialtiesIntro")}</p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2 text-sm">
              <li>
                <Link className="text-[var(--primary)] font-medium hover:underline" href="/audit/lease">
                  → {t("leaseLink")}
                </Link>
              </li>
              <li>
                <Link className="text-[var(--primary)] font-medium hover:underline" href="/audit/employment">
                  → {t("employmentLink")}
                </Link>
              </li>
              <li>
                <Link className="text-[var(--primary)] font-medium hover:underline" href="/audit/terms">
                  → {t("termsLink")}
                </Link>
              </li>
              <li>
                <Link className="text-[var(--primary)] font-medium hover:underline" href="/audit/prenup">
                  → {t("prenupLink")}
                </Link>
              </li>
              <li>
                <Link className="text-[var(--primary)] font-medium hover:underline" href="/audit/divorce">
                  → {t("divorceLink")}
                </Link>
              </li>
              <li>
                <Link className="text-[var(--primary)] font-medium hover:underline" href="/audit/demand-letter-generator">
                  → {t("demandLetterLink")}
                </Link>
              </li>
            </ul>
          </div>
          <AuditClient presetAuditType="general" />
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
              source="audit_page"
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
