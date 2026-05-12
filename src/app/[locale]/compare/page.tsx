import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { Navigation } from "@/components/sections/Navigation";
import { Footer } from "@/components/sections/Footer";
import { COUNTRIES } from "@/data/countries";
import { getCountry } from "@/lib/jurisdictions";
import { buildCompareNarrativeFacts, buildCompareSide, isCompareTopic, type CompareTopic } from "@/lib/compare-highlights";
import { CompareClient } from "@/components/compare/CompareClient";
import { routing } from "@/i18n/routing";
import { loadSnippetsForCountry } from "@/lib/constitution-snippets";
import { buildOgImageUrl } from "@/lib/og-image-url";

type CompareSearch = { a?: string; b?: string; topic?: string };

export function generateStaticParams(): { locale: string }[] {
  return routing.locales.map((locale) => ({ locale }));
}

function normaliseCode(value: string | undefined, fallback: string): string {
  const v = (value ?? fallback).trim().toLowerCase();
  return getCountry(v)?.code.toLowerCase() ?? fallback;
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<CompareSearch>;
}): Promise<Metadata> {
  const [{ locale }, sp] = await Promise.all([params, searchParams ?? Promise.resolve({} as CompareSearch)]);
  const a = normaliseCode(sp.a, "us");
  const b = normaliseCode(sp.b, "gh");
  const topic: CompareTopic = isCompareTopic(sp.topic) ? sp.topic : "rights";
  const ca = getCountry(a);
  const cb = getCountry(b);
  const t = await getTranslations({ locale, namespace: "comparePage" });
  const topicLabel = t(`topics.${topic}`);
  const title = ca && cb ? `${ca.name} vs ${cb.name} — ${topicLabel}` : t("metaTitle");
  const description =
    ca && cb
      ? t("metaDescriptionRich", {
          a: ca.name,
          b: cb.name,
          topic: topicLabel,
        })
      : t("metaDescription");
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://basiclaw.app";
  const og = buildOgImageUrl(site, {
    kind: "compare",
    title: title.slice(0, 80),
    subtitle: topicLabel,
    flagA: ca?.flag,
    flagB: cb?.flag,
    topic: topicLabel,
  });
  return {
    title,
    description,
    alternates: { canonical: `/${locale}/compare?a=${ca?.code ?? "US"}&b=${cb?.code ?? "GH"}&topic=${topic}` },
    openGraph: { title, description, url: `/${locale}/compare`, type: "website", images: [{ url: og, width: 1200, height: 630, alt: title }] },
    twitter: { card: "summary_large_image", title, description, images: [og] },
  };
}

export default async function ComparePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<CompareSearch>;
}) {
  const [{ locale }, sp] = await Promise.all([params, searchParams ?? Promise.resolve({} as CompareSearch)]);
  const a = normaliseCode(sp.a, "us");
  const b = normaliseCode(sp.b, "gh");
  const topic: CompareTopic = isCompareTopic(sp.topic) ? sp.topic : "rights";

  const countryA = getCountry(a)!;
  const countryB = getCountry(b)!;

  const [snippetsA, snippetsB] = await Promise.all([
    loadSnippetsForCountry(countryA.code),
    loadSnippetsForCountry(countryB.code),
  ]);

  const t = await getTranslations({ locale, namespace: "comparePage" });
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://basiclaw.app";

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: t("jsonLdName", { a: countryA.name, b: countryB.name, topic: t(`topics.${topic}`) }),
    description: t("jsonLdDescription"),
    inLanguage: locale,
    url: `${site}/${locale}/compare?a=${countryA.code}&b=${countryB.code}&topic=${topic}`,
    isPartOf: { "@type": "WebSite", name: "BasicLaw", url: site },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "BasicLaw", item: site },
      { "@type": "ListItem", position: 2, name: t("breadcrumbConstitutions"), item: `${site}/${locale}/constitutions` },
      { "@type": "ListItem", position: 3, name: t("breadcrumbCompare"), item: `${site}/${locale}/compare` },
    ],
  };

  const [aPanel, bPanel] = await Promise.all([
    buildCompareSide(countryA, topic, snippetsA),
    buildCompareSide(countryB, topic, snippetsB),
  ]);
  const panels = { a: aPanel, b: bPanel };

  const narrativeFacts = buildCompareNarrativeFacts(countryA, countryB, topic, t(`topics.${topic}`));

  const countrySummaries = COUNTRIES.map((c) => ({
    code: c.code,
    name: c.name,
    flag: c.flag,
    region: c.region,
    legalSystem: c.legalSystem,
  }));

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <Navigation />
      <section className="pt-28 pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/constitutions"
            className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-8"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {t("back")}
          </Link>
          <header className="max-w-3xl mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] leading-tight">{t("title")}</h1>
            <p className="mt-4 text-lg text-[var(--muted-foreground)]">{t("subtitle")}</p>
          </header>

          <CompareClient
            initialA={countryA.code}
            initialB={countryB.code}
            initialTopic={topic}
            countries={countrySummaries}
            panels={panels}
            narrativeFacts={narrativeFacts}
          />
        </div>
      </section>
      <Footer />
    </main>
  );
}
