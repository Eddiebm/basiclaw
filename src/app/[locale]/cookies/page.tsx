import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SimpleDocShell } from "@/components/legal/SimpleDocShell";
import { Link } from "@/i18n/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cookiesPage" });
  return {
    title: `${t("title")} | BasicLaw`,
    description: t("subtitle"),
    alternates: { canonical: `/${locale}/cookies` },
  };
}

export default async function CookiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cookiesPage" });

  return (
    <SimpleDocShell title={t("title")} subtitle={t("subtitle")}>
      <p>{t("p1")}</p>
      <p>{t("p2")}</p>
      <p>
        <Link href="/privacy" className="font-medium text-[var(--primary)] underline-offset-4 hover:underline">
          {t("privacyLink")}
        </Link>
      </p>
    </SimpleDocShell>
  );
}
