import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Navigation } from "@/components/sections/Navigation";
import { Footer } from "@/components/sections/Footer";
import { VERIFIED_LAWYERS } from "@/data/verified-lawyers";
import { LawyersDirectory } from "./LawyersDirectory";
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
  const t = await getTranslations({ locale, namespace: "lawyersPage" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: `/${locale}/lawyers` },
  };
}

export default async function LawyersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "lawyersPage" });

  return (
    <main className="min-h-screen">
      <Navigation />
      <section className="pt-28 pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
          <header className="space-y-2">
            <h1 className="text-4xl font-bold">{t("title")}</h1>
            <p className="text-[var(--muted-foreground)]">{t("subtitle")}</p>
            <p>
              <Link href="/lawyers/apply" className="text-sm font-medium text-[var(--primary)] underline-offset-4 hover:underline">
                {t("applyCta")}
              </Link>
            </p>
          </header>
          <LawyersDirectory lawyers={VERIFIED_LAWYERS} />
        </div>
      </section>
      <Footer />
    </main>
  );
}
