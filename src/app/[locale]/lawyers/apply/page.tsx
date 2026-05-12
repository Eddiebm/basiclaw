import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Navigation } from "@/components/sections/Navigation";
import { Footer } from "@/components/sections/Footer";
import { LawyerApplyForm } from "./LawyerApplyForm";
import { routing } from "@/i18n/routing";

export function generateStaticParams(): { locale: string }[] {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "lawyersApplyPage" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: `/${locale}/lawyers/apply` },
    robots: { index: true, follow: true },
  };
}

export default async function LawyersApplyPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ country?: string }>;
}) {
  const [{ locale }, sp] = await Promise.all([params, searchParams ?? Promise.resolve({})]);
  const t = await getTranslations({ locale, namespace: "lawyersApplyPage" });
  const spObj = sp as { country?: string };
  const pref = typeof spObj.country === "string" ? spObj.country : undefined;

  return (
    <main className="min-h-screen">
      <Navigation />
      <section className="pt-28 pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-8">
          <header>
            <h1 className="text-4xl font-bold">{t("title")}</h1>
            <p className="text-[var(--muted-foreground)] mt-2">{t("subtitle")}</p>
          </header>
          <LawyerApplyForm defaultCountry={pref} />
        </div>
      </section>
      <Footer />
    </main>
  );
}
