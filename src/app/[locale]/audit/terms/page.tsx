import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AuditToolPageShell } from "../AuditToolPageShell";
import { buildOgImageUrl } from "@/lib/og-image-url";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auditTermsPage" });
  const title = t("metaTitle");
  const description = t("metaDescription");
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://basiclaw.app";
  const og = buildOgImageUrl(site, { kind: "audit", title, subtitle: description });
  return {
    title,
    description,
    alternates: { canonical: `/${locale}/audit/terms` },
    openGraph: {
      title,
      description,
      url: `/${locale}/audit/terms`,
      type: "website",
      images: [{ url: og, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [og] },
  };
}

export default async function TermsAuditPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <AuditToolPageShell locale={locale} namespace="auditTermsPage" auditType="terms" />;
}
