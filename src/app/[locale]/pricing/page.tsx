import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Sparkles } from "lucide-react";
import { Navigation } from "@/components/sections/Navigation";
import { Footer } from "@/components/sections/Footer";
import { countryStats } from "@/lib/jurisdictions";
import { PricingClient } from "./PricingClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const stats = countryStats();
  const t = await getTranslations({ locale, namespace: "pricingPage" });
  const title = t("title");
  const description = t("subtitle", { count: stats.total });
  return {
    title,
    description,
    alternates: { canonical: `/${locale}/pricing` },
  };
}

export default async function PricingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const stats = countryStats();
  const t = await getTranslations({ locale, namespace: "pricingPage" });

  return (
    <main className="min-h-screen">
      <Navigation />
      <section className="pt-28 pb-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium mb-4">
            <Sparkles className="h-3.5 w-3.5" aria-hidden /> {t("badge")}
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--foreground)] leading-tight">{t("title")}</h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-[var(--muted-foreground)]">
            {t("subtitle", { count: stats.total })}
          </p>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <PricingClient />
          <p className="mt-10 text-center text-sm text-[var(--muted-foreground)]">
            {t("teamPlan")}{" "}
            <a href="mailto:hello@basiclaw.app" className="underline underline-offset-4 hover:text-[var(--foreground)]">
              {t("getInTouch")}
            </a>
            .
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
