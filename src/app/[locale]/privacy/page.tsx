import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Navigation } from "@/components/sections/Navigation";
import { Footer } from "@/components/sections/Footer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacyPage" });
  return {
    title: `${t("title")} | BasicLaw`,
    description: t("subtitle"),
    alternates: { canonical: `/${locale}/privacy` },
  };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacyPage" });

  return (
    <main className="min-h-screen">
      <Navigation />
      <article className="pt-28 pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-8">
          <header>
            <h1 className="text-4xl font-bold text-[var(--foreground)]">{t("title")}</h1>
            <p className="mt-2 text-lg text-[var(--muted-foreground)]">{t("subtitle")}</p>
          </header>
          <section id="voice-browser" className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-3">
            <h2 className="text-xl font-semibold text-[var(--foreground)]">{t("voiceTitle")}</h2>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{t("voiceBody")}</p>
          </section>
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-3">
            <h2 className="text-xl font-semibold text-[var(--foreground)]">{t("generalTitle")}</h2>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{t("generalBody")}</p>
          </section>
        </div>
      </article>
      <Footer />
    </main>
  );
}
