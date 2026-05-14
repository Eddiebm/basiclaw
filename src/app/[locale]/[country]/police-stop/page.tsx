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
  const topicLabel = t("labels.police-stop");
  const title = `What to Do When Police Stop You in ${country.name}`;
  const description = `A calm, plain-language guide to police stops in ${country.name} \u2014 what you must do, what you can refuse, and how to document it.`;
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://basiclaw.app";
  const og = buildOgImageUrl(site, {
    kind: "topic",
    title: `${country.flag} ${country.name}`.slice(0, 80),
    subtitle: topicLabel,
  });
  return {
    title,
    description,
    alternates: { canonical: `/${locale}/${country.code.toLowerCase()}/police-stop` },
    openGraph: {
      title: `${country.flag} ${title}`,
      description,
      url: `/${locale}/${country.code.toLowerCase()}/police-stop`,
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

export default async function CountryPoliceStopPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { locale, country: code } = await params;
  const country = getCountry(code);
  if (!country) notFound();
  const content = getTopicContent(country, "police-stop");
  const verifiers = listVerifiersForCountryTopic(country.code, "police-stop");
  return (
    <TopicPage
      country={country}
      topic="police-stop"
      content={content}
      pageLocale={locale}
      verifiedByLawyers={verifiers.map((v) => ({ name: v.name, jurisdiction: v.jurisdiction }))}
    />
  );
}
