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
  const title = `What to Do When Police Stop You in ${country.name}`;
  const description = `A calm, plain-language guide to police stops in ${country.name} \u2014 what you must do, what you can refuse, and how to document it.`;
  return {
    title,
    description,
    alternates: { canonical: `/${locale}/${country.code.toLowerCase()}/police-stop` },
    openGraph: {
      title: `${country.flag} ${title}`,
      description,
      url: `/${locale}/${country.code.toLowerCase()}/police-stop`,
      type: "article",
    },
  };
}

export default async function CountryPoliceStopPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { country: code } = await params;
  const country = getCountry(code);
  if (!country) notFound();
  const content = getTopicContent(country, "police-stop");
  return <TopicPage country={country} topic="police-stop" content={content} />;
}
