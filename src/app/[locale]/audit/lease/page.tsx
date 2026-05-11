import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AuditToolPageShell } from "../AuditToolPageShell";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auditLeasePage" });
  const title = t("metaTitle");
  const description = t("metaDescription");
  return {
    title,
    description,
    alternates: { canonical: `/${locale}/audit/lease` },
    openGraph: { title, description, url: `/${locale}/audit/lease`, type: "website" },
  };
}

export default async function LeaseAuditPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <AuditToolPageShell locale={locale} namespace="auditLeasePage" auditType="lease" />;
}
