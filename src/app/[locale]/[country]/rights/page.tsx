import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { TopicPage } from "@/components/topics/TopicPage";
import { COUNTRIES } from "@/data/countries";
import { routing } from "@/i18n/routing";
import { getCountry } from "@/lib/jurisdictions";
import { getTopicContent } from "@/lib/topic-content";
import { buildOgImageUrl } from "@/lib/og-image-url";
import { listVerifiersForCountryTopic } from "@/lib/verified-lawyers-ui";

type RouteParams = { locale: string; country: string };

export const dynamicParams = false;

export function generateStaticParams(): RouteParams[] {
  return routing.locales.flatMap((locale) =>
    COUNTRIES.map((country) => ({ locale, country: country.code.toLowerCase() }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { locale, country: code } = await params;
  const country = getCountry(code);
  if (!country) return { title: "Not found" };
  const t = await getTranslations({ locale, namespace: "topicPage" });
  const topicLabel = t("labels.rights");
  const title = `Your Rights in ${country.name} \u2014 plain-language guide`;
  const description = `What rights you have in ${country.name}, where they come from, and how to enforce them. Written for non-lawyers.`;
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://basiclaw.app";
  const og = buildOgImageUrl(site, {
    kind: "topic",
    title: `${country.flag} ${country.name}`.slice(0, 80),
    subtitle: topicLabel,
  });
  return {
    title,
    description,
    alternates: { canonical: `/${locale}/${country.code.toLowerCase()}/rights` },
    openGraph: {
      title: `${country.flag} Your Rights in ${country.name}`,
      description,
      url: `/${locale}/${country.code.toLowerCase()}/rights`,
      type: "article",
      images: [{ url: og, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${country.flag} ${topicLabel} · ${country.name}`,
      description,
      images: [og],
    },
  };
}

export default async function CountryRightsPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { locale, country: code } = await params;
  const country = getCountry(code);
  if (!country) notFound();
  const content = getTopicContent(country, "rights");
  const verifiers = listVerifiersForCountryTopic(country.code, "rights");
  return (
    <TopicPage
      country={country}
      topic="rights"
      content={content}
      pageLocale={locale}
      verifiedByLawyers={verifiers.map((v) => ({ name: v.name, jurisdiction: v.jurisdiction }))}
    />
  );
}
