import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Navigation } from "@/components/sections/Navigation";
import { Footer } from "@/components/sections/Footer";
import { EmbedDeveloperPageClient } from "@/components/embed/EmbedDeveloperPageClient";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "embedPage" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default function EmbedDocsPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <EmbedDeveloperPageClient />
      <Footer />
    </main>
  );
}
