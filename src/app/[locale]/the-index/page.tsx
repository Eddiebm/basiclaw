import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { COUNTRIES } from "@/data/countries";
import { routing } from "@/i18n/routing";
import { LegalIndexLandingClient } from "@/components/legal-index/LegalIndexLandingClient";
import { getAllLegalIndexEntries, LEGAL_INDEX_DATA } from "@/lib/legal-index-data";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://basiclaw.app";

export function generateStaticParams(): { locale: string }[] {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legalIndex" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: `/${locale}/the-index` },
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      url: `/${locale}/the-index`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("metaTitle"),
      description: t("metaDescription"),
    },
  };
}

export default async function LegalIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legalIndex" });
  const entries = getAllLegalIndexEntries();
  const topTen = entries.slice(0, 10);
  const languageOptions = Array.from(new Set(COUNTRIES.flatMap((c) => c.languages))).sort((a, b) => a.localeCompare(b));

  const site = SITE.replace(/\/$/, "");
  const indexUrl = `${site}/${locale}/the-index`;
  const datasetId = `${indexUrl}#legal-literacy-index`;

  const itemList = topTen.map((row, i) => ({
    "@type": "ListItem" as const,
    position: i + 1,
    url: `${site}/${locale}/the-index/${row.code.toLowerCase()}`,
    name: `${row.name} — ${row.grade} (${row.overall})`,
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Dataset",
        "@id": datasetId,
        name: t("jsonLdDatasetName"),
        description: t("jsonLdDatasetDesc"),
        inLanguage: locale,
        temporalCoverage: String(LEGAL_INDEX_DATA.referenceYear),
        variableMeasured: [
          { "@type": "PropertyValue", name: "Accessibility", minValue: 0, maxValue: 100 },
          { "@type": "PropertyValue", name: "Plain-language constitution", minValue: 0, maxValue: 100 },
          { "@type": "PropertyValue", name: "Rights protection", minValue: 0, maxValue: 100 },
          { "@type": "PropertyValue", name: "Judicial independence", minValue: 0, maxValue: 100 },
          { "@type": "PropertyValue", name: "Citizen empowerment", minValue: 0, maxValue: 100 },
          { "@type": "PropertyValue", name: "Constitutional clarity", minValue: 0, maxValue: 100 },
          { "@type": "PropertyValue", name: "Cross-jurisdiction interoperability", minValue: 0, maxValue: 100 },
        ],
        distribution: { "@type": "DataDownload", encodingFormat: "application/json", contentUrl: `${site}/` },
      },
      {
        "@type": "ItemList",
        name: `${t("jsonLdDatasetName")} — top overall scores`,
        numberOfItems: topTen.length,
        itemListElement: itemList,
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LegalIndexLandingClient entries={entries} topTen={topTen} languageOptions={languageOptions} />
    </>
  );
}
