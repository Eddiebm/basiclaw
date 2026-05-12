import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import { getTranslations } from "next-intl/server";
import { buildOgImageUrl } from "@/lib/og-image-url";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  const title = t("signUpTitle");
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://basiclaw.app";
  const og = buildOgImageUrl(site, { kind: "default", title, subtitle: "BasicLaw" });
  return {
    title,
    robots: { index: false, follow: false },
    openGraph: { title, url: `${site}/${locale}/sign-up`, type: "website", images: [{ url: og, width: 1200, height: 630, alt: title }] },
    twitter: { card: "summary_large_image", title, images: [og] },
  };
}

export default async function SignUpPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const base = `/${locale}`;
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <SignUp
        routing="path"
        path={`${base}/sign-up`}
        signInUrl={`${base}/sign-in`}
        fallbackRedirectUrl={base}
        appearance={{ variables: { colorPrimary: "hsl(var(--primary))" } }}
      />
    </div>
  );
}
