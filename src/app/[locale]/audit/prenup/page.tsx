import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { getTranslations } from "next-intl/server";
import { AuditToolPageShell } from "../AuditToolPageShell";
import { buildOgImageUrl } from "@/lib/og-image-url";
import { getUserPlanForUserId } from "@/lib/entitlements";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auditPrenupPage" });
  const title = t("metaTitle");
  const description = t("metaDescription");
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://basiclaw.app";
  const og = buildOgImageUrl(site, { kind: "audit", title, subtitle: description });
  return {
    title,
    description,
    alternates: { canonical: `/${locale}/audit/prenup` },
    openGraph: { title, description, url: `/${locale}/audit/prenup`, type: "website", images: [{ url: og, width: 1200, height: 630, alt: title }] },
    twitter: { card: "summary_large_image", title, description, images: [og] },
  };
}

export default async function PrenupAuditPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { userId } = await auth();
  const plan = await getUserPlanForUserId(userId);
  const advancedPaywall = plan === "free";
  return (
    <AuditToolPageShell
      locale={locale}
      namespace="auditPrenupPage"
      auditType="prenup"
      advancedPaywall={advancedPaywall}
    />
  );
}
