import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Navigation } from "@/components/sections/Navigation";
import { Footer } from "@/components/sections/Footer";
import { HomeFAQ } from "@/components/sections/HomeFAQ";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faqPage" });
  return {
    title: `${t("title")} | BasicLaw`,
    description: t("metaDescription"),
    alternates: { canonical: `/${locale}/faq` },
  };
}

export default async function FAQPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faqPage" });

  return (
    <main className="min-h-screen">
      <Navigation />
      <section className="pt-28 pb-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--foreground)] leading-tight">{t("title")}</h1>
          <p className="mt-3 text-lg text-[var(--muted-foreground)]">{t("subtitle")}</p>
        </div>
      </section>
      <HomeFAQ />
      <Footer />
    </main>
  );
}
