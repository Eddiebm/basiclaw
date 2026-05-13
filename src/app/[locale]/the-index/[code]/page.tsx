import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Navigation } from "@/components/sections/Navigation";
import { Footer } from "@/components/sections/Footer";
import { LegalIndexCountryBody } from "@/components/legal-index/LegalIndexCountryBody";
import { COUNTRIES } from "@/data/countries";
import { getCountry } from "@/lib/jurisdictions";
import { getLegalIndexEntry } from "@/lib/legal-index-data";
import { LEGAL_INDEX_DIMENSION_ORDER, type LegalIndexDimensionId } from "@/lib/legal-index";
import { buildOgImageUrl } from "@/lib/og-image-url";
import { routing } from "@/i18n/routing";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://basiclaw.app";

const DIMENSION_JSON_LD_KEY: Record<
  LegalIndexDimensionId,
  | "jsonLdPropAccessibility"
  | "jsonLdPropPlainLanguageConstitution"
  | "jsonLdPropRightsProtection"
  | "jsonLdPropJudicialIndependence"
  | "jsonLdPropCitizenEmpowerment"
  | "jsonLdPropConstitutionalClarity"
  | "jsonLdPropCrossJurisdictionInterop"
> = {
  accessibility: "jsonLdPropAccessibility",
  plainLanguage: "jsonLdPropPlainLanguageConstitution",
  rightsProtection: "jsonLdPropRightsProtection",
  judicialIndependence: "jsonLdPropJudicialIndependence",
  citizenEmpowerment: "jsonLdPropCitizenEmpowerment",
  constitutionalClarity: "jsonLdPropConstitutionalClarity",
  crossJurisdiction: "jsonLdPropCrossJurisdictionInterop",
};

type Params = { locale: string; code: string };

export function generateStaticParams(): Params[] {
  return routing.locales.flatMap((locale) =>
    COUNTRIES.map((country) => ({ locale, code: country.code.toLowerCase() }))
  );
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, code } = await params;
  const t = await getTranslations({ locale, namespace: "legalIndex" });
  const country = getCountry(code);
  const entry = getLegalIndexEntry(code);
  if (!country || !entry) {
    return { title: t("notFoundMetaTitle"), robots: { index: false, follow: false } };
  }
  const site = SITE.replace(/\/$/, "");
  const title = t("detailMetaTitle", { country: country.name });
  const description = t("detailMetaDescription", { country: country.name });
  const og = buildOgImageUrl(site, {
    kind: "index",
    title: country.name,
    subtitle: t("ogSubtitleEducational"),
    flag: country.flag,
    grade: entry.grade,
    overall: String(entry.overall),
  });
  return {
    title,
    description,
    alternates: { canonical: `/${locale}/the-index/${country.code.toLowerCase()}` },
    openGraph: {
      title,
      description,
      url: `/${locale}/the-index/${country.code.toLowerCase()}`,
      type: "article",
      images: [{ url: og, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [og] },
  };
}

export default async function LegalIndexCountryPage({ params }: { params: Promise<Params> }) {
  const { locale, code } = await params;
  const country = getCountry(code);
  const entry = getLegalIndexEntry(code);
  if (!country || !entry) notFound();

  const t = await getTranslations({ locale, namespace: "legalIndex" });
  const site = SITE.replace(/\/$/, "");
  const path = `/${locale}/the-index/${country.code.toLowerCase()}`;
  const shareUrl = `${site}${path}`;
  const shareTitle = t("detailShareCardTitle", {
    country: country.name,
    grade: entry.grade,
    overall: entry.overall,
  });
  const compareB = country.code === "US" ? "GH" : "US";
  const compareHref = `/compare?a=${country.code}&b=${compareB}&topic=rights`;
  const constitutionHref = `/constitutions/${country.code.toLowerCase()}`;
  const datasetId = `${site}/${routing.defaultLocale}/the-index#legal-literacy-index`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: t("detailMetaTitle", { country: country.name }),
        description: t("detailMetaDescription", { country: country.name }),
        inLanguage: locale,
        about: { "@type": "Country", name: country.name },
        isPartOf: { "@id": datasetId },
        url: shareUrl,
      },
      {
        "@type": "Dataset",
        "@id": `${shareUrl}#row`,
        name: t("detailJsonLdDatasetRowName", { country: country.name }),
        description: entry.rationales.accessibility.slice(0, 200),
        isPartOf: { "@id": datasetId },
        spatialCoverage: { "@type": "Country", name: country.name },
        variableMeasured: LEGAL_INDEX_DIMENSION_ORDER.map((id) => ({
          "@type": "PropertyValue" as const,
          name: t(DIMENSION_JSON_LD_KEY[id]),
          value: entry.dimensions[id],
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main id="main-content" className="flex-1 pt-24 sm:pt-28 pb-20">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/the-index"
            className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-8"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {t("backToIndex")}
          </Link>

          <header className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between border-b border-[var(--border)] pb-10">
            <div>
              <span className="text-6xl sm:text-7xl block leading-none mb-4" aria-hidden>
                {country.flag}
              </span>
              <p className="text-xs font-medium tracking-[0.18em] text-[var(--muted-foreground)] mb-2">
                {country.region} · {country.subregion}
              </p>
              <h1 className="font-editorial text-4xl sm:text-5xl text-[var(--foreground)] tracking-tight">{country.name}</h1>
              <p className="mt-3 text-[var(--muted-foreground)] max-w-2xl">{t("detailMetaDescription", { country: country.name })}</p>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-2">
              <span className="text-5xl font-bold text-[var(--foreground)] tabular-nums">{entry.grade}</span>
              <span className="text-lg text-[var(--muted-foreground)] tabular-nums">
                {t("detailOverallLabel")}{" "}
                <strong className="text-[var(--foreground)]">{entry.overall}</strong>
                {t("detailOverallSuffix")}
              </span>
            </div>
          </header>

          <LegalIndexCountryBody
            entry={entry}
            shareUrl={shareUrl}
            shareTitle={shareTitle}
            compareHref={compareHref}
            constitutionHref={constitutionHref}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
