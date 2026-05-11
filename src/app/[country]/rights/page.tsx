import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TopicPage } from "@/components/topics/TopicPage";
import { COUNTRIES } from "@/data/countries";
import { getCountry } from "@/lib/jurisdictions";
import { getTopicContent } from "@/lib/topic-content";

type RouteParams = { country: string };

export const dynamicParams = false;

export function generateStaticParams(): RouteParams[] {
  return COUNTRIES.map((country) => ({ country: country.code.toLowerCase() }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { country: code } = await params;
  const country = getCountry(code);
  if (!country) return { title: "Not found" };
  const title = `Your Rights in ${country.name} \u2014 plain-language guide`;
  const description = `What rights you have in ${country.name}, where they come from, and how to enforce them. Written for non-lawyers.`;
  return {
    title,
    description,
    alternates: { canonical: `/${country.code.toLowerCase()}/rights` },
    openGraph: {
      title: `${country.flag} Your Rights in ${country.name}`,
      description,
      url: `/${country.code.toLowerCase()}/rights`,
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
