import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SimpleDocShell } from "@/components/legal/SimpleDocShell";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "termsPage" });
  return {
    title: `${t("title")} | BasicLaw`,
    description: t("subtitle"),
    alternates: { canonical: `/${locale}/terms` },
  };
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "termsPage" });

  return (
    <SimpleDocShell title={t("title")} subtitle={t("subtitle")}>
      <p>{t("p1")}</p>
      <p>{t("p2")}</p>
      <p>{t("p3")}</p>
    </SimpleDocShell>
  );
}
