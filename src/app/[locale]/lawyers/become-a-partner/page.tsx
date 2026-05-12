import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Navigation } from "@/components/sections/Navigation";
import { Footer } from "@/components/sections/Footer";
import { LawyerLeadForm } from "@/app/[locale]/find-a-lawyer/LawyerLeadForm";
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
  const t = await getTranslations({ locale, namespace: "lawyersBecomePartner" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: `/${locale}/lawyers/become-a-partner` },
  };
}

export default async function BecomePartnerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "lawyersBecomePartner" });

  return (
    <main className="min-h-screen">
      <Navigation />
      <section className="pt-28 pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-8">
          <header className="space-y-3">
            <h1 className="text-4xl font-bold">{t("title")}</h1>
            <p className="text-[var(--muted-foreground)]">{t("subtitle")}</p>
            <p className="text-sm text-[var(--muted-foreground)]">{t("body")}</p>
            <p className="text-sm">
              <Link href="/lawyers/apply" className="font-medium text-[var(--primary)] underline-offset-4 hover:underline">
                {t("secondaryLink")}
              </Link>
            </p>
          </header>
          <LawyerLeadForm />
        </div>
      </section>
      <Footer />
    </main>
  );
}
