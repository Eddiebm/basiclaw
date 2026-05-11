import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AuditToolPageShell } from "../AuditToolPageShell";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auditEmploymentPage" });
  const title = t("metaTitle");
  const description = t("metaDescription");
  return {
    title,
    description,
    alternates: { canonical: `/${locale}/audit/employment` },
    openGraph: { title, description, url: `/${locale}/audit/employment`, type: "website" },
  };
}

export default async function EmploymentAuditPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <AuditToolPageShell locale={locale} namespace="auditEmploymentPage" auditType="employment" />;
}
