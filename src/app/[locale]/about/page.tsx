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
  const t = await getTranslations({ locale, namespace: "aboutPage" });
  return {
    title: `${t("title")} | BasicLaw`,
    description: t("subtitle"),
    alternates: { canonical: `/${locale}/about` },
  };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "aboutPage" });

  return (
    <SimpleDocShell title={t("title")} subtitle={t("subtitle")}>
      <p>{t("p1")}</p>
      <p>{t("p2")}</p>
      <p>
        {t("explore")}{" "}
        <Link href="/chat" className="font-medium text-[var(--primary)] underline-offset-4 hover:underline">
          {t("chatLink")}
        </Link>
        ,{" "}
        <Link href="/learn" className="font-medium text-[var(--primary)] underline-offset-4 hover:underline">
          {t("learnLink")}
        </Link>
        , {t("or")}{" "}
        <Link href="/constitutions" className="font-medium text-[var(--primary)] underline-offset-4 hover:underline">
          {t("libraryLink")}
        </Link>
        .
      </p>
    </SimpleDocShell>
  );
}
