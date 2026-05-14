import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buildOgImageUrl } from "@/lib/og-image-url";
import { isClerkEnabled } from "@/lib/auth-config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  const title = t("signInTitle");
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://basiclaw.app";
  const og = buildOgImageUrl(site, { kind: "default", title, subtitle: "BasicLaw" });
  return {
    title,
    robots: { index: false, follow: false },
    openGraph: { title, url: `${site}/${locale}/sign-in`, type: "website", images: [{ url: og, width: 1200, height: 630, alt: title }] },
    twitter: { card: "summary_large_image", title, images: [og] },
  };
}

export default async function SignInPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  const base = `/${locale}`;

  if (!isClerkEnabled()) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center max-w-md mx-auto">
        <h1 className="text-xl font-semibold text-foreground">{t("clerkUnavailableTitle")}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{t("clerkUnavailableBody")}</p>
        <Link href="/" className="mt-8 text-sm font-medium text-primary underline-offset-4 hover:underline">
          {t("backHome")}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <SignIn
        routing="path"
        path={`${base}/sign-in`}
        signUpUrl={`${base}/sign-up`}
        fallbackRedirectUrl={base}
        appearance={{ variables: { colorPrimary: "hsl(var(--primary))" } }}
      />
    </div>
  );
}
