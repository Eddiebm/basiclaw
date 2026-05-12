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
      <section className="relative border-b border-[var(--border)]/60 pb-20 pt-20 sm:pt-24">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[linear-gradient(to_bottom,oklch(0.45_0.12_262/0.06),transparent)] dark:bg-[linear-gradient(to_bottom,oklch(0.72_0.12_250/0.08),transparent)]" aria-hidden />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--muted-foreground)]">{t("issueLine")}</p>
          <div className="mt-8 rounded-[1.75rem] border border-[var(--border)] bg-[var(--card)]/80 px-6 py-10 text-center shadow-paper backdrop-blur-md sm:px-12 sm:py-12">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-glass)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted-foreground)] backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-[var(--primary)]" aria-hidden /> {t("badge")}
            </span>
            <h1 className="font-editorial text-4xl leading-[1.08] text-[var(--foreground)] sm:text-5xl lg:text-6xl">{t("title")}</h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-[var(--muted-foreground)]">
              {t("subtitle", { count: stats.total })}
            </p>
          </div>
        </div>
      </section>

      <section className="-mt-6 pb-24 sm:-mt-8">
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
