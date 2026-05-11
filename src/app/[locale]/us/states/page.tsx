import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import { Navigation } from "@/components/sections/Navigation";
import { Footer } from "@/components/sections/Footer";
import { UsStatesGrid } from "@/components/us-states/UsStatesGrid";
import { US_STATES } from "@/data/us-states";
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
  const t = await getTranslations({ locale, namespace: "usStatesIndex" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: `/${locale}/us/states` },
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      url: `/${locale}/us/states`,
      type: "website",
    },
  };
}

export default async function UsStatesIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "usStatesIndex" });

  return (
    <main className="min-h-screen">
      <Navigation />
      <section className="pt-28 pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/constitutions/us"
            className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-8"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {t("backToUsConstitution")}
          </Link>
          <header className="mb-10 max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium mb-3">
              <MapPin className="h-3.5 w-3.5" aria-hidden />
              {t("badge")}
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] leading-tight">{t("title")}</h1>
            <p className="mt-4 text-lg text-[var(--muted-foreground)]">{t("subtitle")}</p>
            <p className="mt-3 text-sm text-[var(--muted-foreground)]">{t("topicsLead")}</p>
          </header>
          <UsStatesGrid states={US_STATES} />
        </div>
      </section>
      <Footer />
    </main>
  );
}
