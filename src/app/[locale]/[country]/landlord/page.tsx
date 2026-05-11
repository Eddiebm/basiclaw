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
  const title = `Tenant Rights and Landlord Rules in ${country.name}`;
  const description = `Deposits, evictions, repairs, rent increases \u2014 the basic rules every tenant and landlord in ${country.name} should know.`;
  return {
    title,
    description,
    alternates: { canonical: `/${locale}/${country.code.toLowerCase()}/landlord` },
    openGraph: {
      title: `${country.flag} ${title}`,
      description,
      url: `/${locale}/${country.code.toLowerCase()}/landlord`,
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
