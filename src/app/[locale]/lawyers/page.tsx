import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Navigation } from "@/components/sections/Navigation";
import { Footer } from "@/components/sections/Footer";
import { COUNTRIES } from "@/data/countries";
import { VERIFIED_LAWYERS } from "@/data/verified-lawyers";
import { mergeDirectoryLawyers } from "@/lib/lawyer-directory";
import { listApprovedPartnerLawyers } from "@/lib/partner-storage";
import { LawyersDirectory, type DirectoryLawyerWithRegion } from "./LawyersDirectory";
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
  const partners = await listApprovedPartnerLawyers();
  const merged = mergeDirectoryLawyers(VERIFIED_LAWYERS, partners);
  const countryMeta = new Map(COUNTRIES.map((c) => [c.code.toUpperCase(), c]));
  const lawyers: DirectoryLawyerWithRegion[] = merged.map((row) => ({
    ...row,
    region: countryMeta.get(row.country.toUpperCase())?.region,
  }));
  const absoluteSite = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://basiclaw.app";

  return (
    <main className="min-h-screen">
      <Navigation />
      <section className="pt-28 pb-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
          <header className="space-y-2">
            <h1 className="text-4xl font-bold">{t("title")}</h1>
            <p className="text-[var(--muted-foreground)]">{t("subtitle")}</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <Link href="/lawyers/apply" className="font-medium text-[var(--primary)] underline-offset-4 hover:underline">
                {t("applyCta")}
              </Link>
              <Link href="/lawyers/become-a-partner" className="font-medium text-[var(--primary)] underline-offset-4 hover:underline">
                {t("partnerCta")}
              </Link>
            </div>
          </header>
          <LawyersDirectory lawyers={lawyers} absoluteSite={absoluteSite} locale={locale} />
        </div>
      </section>
      <Footer />
    </main>
  );
}
