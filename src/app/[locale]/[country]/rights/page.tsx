import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TopicPage } from "@/components/topics/TopicPage";
import { COUNTRIES } from "@/data/countries";
import { routing } from "@/i18n/routing";
import { getCountry } from "@/lib/jurisdictions";
import { getTopicContent } from "@/lib/topic-content";

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
  const title = `Your Rights in ${country.name} \u2014 plain-language guide`;
  const description = `What rights you have in ${country.name}, where they come from, and how to enforce them. Written for non-lawyers.`;
  return {
    title,
    description,
    alternates: { canonical: `/${locale}/${country.code.toLowerCase()}/rights` },
    openGraph: {
      title: `${country.flag} Your Rights in ${country.name}`,
      description,
      url: `/${locale}/${country.code.toLowerCase()}/rights`,
      type: "article",
    },
  };
}

export default async function CountryRightsPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { country: code } = await params;
  const country = getCountry(code);
  if (!country) notFound();
  const content = getTopicContent(country, "rights");
  return <TopicPage country={country} topic="rights" content={content} />;
}
