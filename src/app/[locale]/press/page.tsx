import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Navigation } from "@/components/sections/Navigation";
import { Footer } from "@/components/sections/Footer";
import { COUNTRIES } from "@/data/countries";
import { getAllCitizenQuestions } from "@/data/questions/load-questions";
import { buildOgImagePath } from "@/lib/og-image-url";
import { routing } from "@/i18n/routing";
import { PressContactForm } from "./PressContactForm";

const AUDIT_TOOL_COUNT = 8;

export function generateStaticParams(): { locale: string }[] {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pressPage" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: `/${locale}/press` },
  };
}

export default async function PressPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pressPage" });
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://basiclaw.app";
  const pressEmail = process.env.PRESS_EMAIL?.trim();
  const questionCount = getAllCitizenQuestions().length;
  const stats = [
    { label: t("statCountries"), value: String(COUNTRIES.length) },
    { label: t("statConstitutions"), value: String(COUNTRIES.length) },
    { label: t("statQuestions"), value: String(questionCount) },
    { label: t("statLanguages"), value: String(routing.locales.length) },
    { label: t("statAudits"), value: String(AUDIT_TOOL_COUNT) },
  ];

  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "BasicLaw",
    url: site,
    logo: `${site}/press/logo-full-colour.svg`,
    sameAs: ["https://github.com/Eddiebm/basiclaw", "https://twitter.com"],
    contactPoint: pressEmail
      ? [
          {
            "@type": "ContactPoint",
            contactType: "public relations",
            email: pressEmail,
          },
        ]
      : undefined,
  };

  return (
    <main className="min-h-screen">
      <Navigation />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />
      <section className="pt-28 pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-10">
          <header className="space-y-3">
            <h1 className="text-4xl font-bold">{t("heroTitle")}</h1>
            <p className="text-lg text-[var(--muted-foreground)]">{t("heroSubtitle")}</p>
          </header>

          <div className="space-y-4 text-[var(--foreground)] leading-relaxed">
            <p className="text-sm font-medium text-[var(--muted-foreground)]">50 words</p>
            <p>{t("blurb50")}</p>
            <p className="text-sm font-medium text-[var(--muted-foreground)]">100 words</p>
            <p>{t("blurb100")}</p>
            <p className="text-sm font-medium text-[var(--muted-foreground)]">250 words</p>
            <p>{t("blurb250")}</p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/60 p-5 space-y-2">
            <h2 className="text-lg font-semibold">{t("founderTitle")}</h2>
            <p className="font-medium">{t("founderName")}</p>
            <p className="text-sm text-[var(--muted-foreground)]">{t("founderBio")}</p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">{t("logosTitle")}</h2>
            <p className="text-sm text-[var(--muted-foreground)]">{t("logosBody")}</p>
            <ul className="grid sm:grid-cols-2 gap-3 text-sm">
              <li>
                <a className="text-[var(--primary)] underline" href="/press/logo-ink-on-parchment.svg" download>
                  Ink on parchment (SVG)
                </a>
              </li>
              <li>
                <a className="text-[var(--primary)] underline" href="/press/logo-parchment-on-ink.svg" download>
                  Parchment on ink (SVG)
                </a>
              </li>
              <li>
                <a className="text-[var(--primary)] underline" href="/press/logo-full-colour.svg" download>
                  Full colour (SVG)
                </a>
              </li>
              <li>
                <a className="text-[var(--primary)] underline" href="/press/logo-monochrome.svg" download>
                  Monochrome (SVG)
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">{t("screensTitle")}</h2>
            <p className="text-sm text-[var(--muted-foreground)]">{t("screensBody")}</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <figure className="space-y-1">
                <figcaption className="text-xs text-[var(--muted-foreground)]">{t("ogChat")}</figcaption>
                <Image
                  src={buildOgImagePath({
                    kind: "default",
                    title: t("ogImageAskTitle"),
                    subtitle: t("ogImageChatSubtitle"),
                  })}
                  alt=""
                  width={1200}
                  height={630}
                  unoptimized
                  className="rounded-lg border border-[var(--border)] w-full h-auto"
                />
              </figure>
              <figure className="space-y-1">
                <figcaption className="text-xs text-[var(--muted-foreground)]">{t("ogAudit")}</figcaption>
                <Image
                  src={buildOgImagePath({
                    kind: "audit",
                    title: t("ogImageAuditTitle"),
                    subtitle: t("ogImageAuditSubtitle"),
                  })}
                  alt=""
                  width={1200}
                  height={630}
                  unoptimized
                  className="rounded-lg border border-[var(--border)] w-full h-auto"
                />
              </figure>
              <figure className="space-y-1">
                <figcaption className="text-xs text-[var(--muted-foreground)]">{t("ogConstitution")}</figcaption>
                <Image
                  src={buildOgImagePath({
                    kind: "constitution",
                    title: t("ogImageConstitutionTitle"),
                    subtitle: t("ogImageConstitutionSubtitle"),
                  })}
                  alt=""
                  width={1200}
                  height={630}
                  unoptimized
                  className="rounded-lg border border-[var(--border)] w-full h-auto"
                />
              </figure>
              <figure className="space-y-1">
                <figcaption className="text-xs text-[var(--muted-foreground)]">{t("ogQuestions")}</figcaption>
                <Image
                  src={buildOgImagePath({
                    kind: "questions",
                    title: t("ogImageQuestionsTitle"),
                    subtitle: t("ogImageQuestionsSubtitle"),
                  })}
                  alt=""
                  width={1200}
                  height={630}
                  unoptimized
                  className="rounded-lg border border-[var(--border)] w-full h-auto"
                />
              </figure>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold">{t("coverageTitle")}</h2>
            <p className="text-sm text-[var(--muted-foreground)]">{t("coveragePlaceholder")}</p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">{t("statsTitle")}</h2>
            <dl className="grid sm:grid-cols-2 gap-3">
              {stats.map((s) => (
                <div key={s.label} className="rounded-xl border border-[var(--border)] p-3">
                  <dt className="text-xs text-[var(--muted-foreground)]">{s.label}</dt>
                  <dd className="text-2xl font-semibold">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--card)]/60 p-5">
            <h2 className="text-lg font-semibold">{t("contactTitle")}</h2>
            {pressEmail ? (
              <p className="text-sm">
                {t("contactEmailLabel")}:{" "}
                <a className="text-[var(--primary)] underline" href={`mailto:${pressEmail}`}>
                  {pressEmail}
                </a>
              </p>
            ) : (
              <p className="text-sm text-[var(--muted-foreground)]">{t("contactFormHint")}</p>
            )}
            {pressEmail ? (
              <>
                <h3 className="text-sm font-medium pt-2">{t("contactFormTitle")}</h3>
                <p className="text-xs text-[var(--muted-foreground)]">{t("contactFormHint")}</p>
                <PressContactForm />
              </>
            ) : null}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
