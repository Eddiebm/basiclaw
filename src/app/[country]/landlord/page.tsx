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
  const title = `Tenant Rights and Landlord Rules in ${country.name}`;
  const description = `Deposits, evictions, repairs, rent increases \u2014 the basic rules every tenant and landlord in ${country.name} should know.`;
  return {
    title,
    description,
    alternates: { canonical: `/${country.code.toLowerCase()}/landlord` },
    openGraph: {
      title: `${country.flag} ${title}`,
      description,
      url: `/${country.code.toLowerCase()}/landlord`,
      type: "article",
    },
  };
}

export default async function CountryLandlordPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { country: code } = await params;
  const country = getCountry(code);
  if (!country) notFound();
  const content = getTopicContent(country, "landlord");
  return <TopicPage country={country} topic="landlord" content={content} />;
}
