import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Navigation } from "@/components/sections/Navigation";
import { Footer } from "@/components/sections/Footer";
import { LawyerLeadForm } from "./LawyerLeadForm";
import { getCountry } from "@/lib/jurisdictions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "lawyerPage" });
  return {
    title: `${t("title")} | BasicLaw`,
    description: t("subtitle"),
    alternates: { canonical: `/${locale}/find-a-lawyer` },
  };
}

export default async function FindLawyerPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ country?: string }>;
}) {
  type Search = { country?: string };
  const [{ locale }, query]: [{ locale: string }, Search] = await Promise.all([
    params,
    searchParams ?? Promise.resolve({} as Search),
  ]);
  const t = await getTranslations({ locale, namespace: "lawyerPage" });
  const raw = typeof query.country === "string" ? query.country : "";
  const prefCountry = getCountry(raw) ? raw.toLowerCase() : undefined;

  return (
    <main className="min-h-screen">
      <Navigation />
      <section className="pt-28 pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-8">
          <header className="text-center space-y-3">
            <h1 className="text-4xl font-bold text-[var(--foreground)]">{t("title")}</h1>
            <p className="text-lg text-[var(--muted-foreground)]">{t("subtitle")}</p>
          </header>
          <LawyerLeadForm prefCountry={prefCountry} />
        </div>
      </section>
      <Footer />
    </main>
  );
}
