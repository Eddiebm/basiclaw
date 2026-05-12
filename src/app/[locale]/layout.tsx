import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { arSA, enUS, esES, frFR, hiIN, ptBR, zhCN } from "@clerk/localizations";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { LocaleDirection } from "@/components/i18n/LocaleDirection";
import { AnnouncerProvider } from "@/components/a11y/AnnouncerProvider";
import { isClerkEnabled } from "@/lib/auth-config";

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

function clerkLocalization(locale: string) {
  switch (locale) {
    case "es":
      return esES;
    case "fr":
      return frFR;
    case "ar":
      return arSA;
    case "pt":
      return ptBR;
    case "hi":
      return hiIN;
    case "zh":
      return zhCN;
    default:
      return enUS;
  }
}

export function generateStaticParams(): { locale: string }[] {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!(routing.locales as readonly string[]).includes(locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const tAuth = await getTranslations({ locale, namespace: "auth" });

  return (
    <>
      <LocaleDirection locale={locale} />
      <NextIntlClientProvider locale={locale} messages={messages}>
        <AnnouncerProvider>
        {!isClerkEnabled() && (
          <div
            role="status"
            className="bg-amber-500/15 text-amber-950 dark:text-amber-100 text-center text-xs py-2 px-4 border-b border-amber-500/25"
          >
            {tAuth("notConfiguredBanner")}
          </div>
        )}
        {isClerkEnabled() ? (
          <ClerkProvider
            publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
            localization={clerkLocalization(locale)}
            signInUrl={`/${locale}/sign-in`}
            signUpUrl={`/${locale}/sign-up`}
            afterSignOutUrl={`/${locale}`}
          >
            {children}
          </ClerkProvider>
        ) : (
          children
        )}
        </AnnouncerProvider>
      </NextIntlClientProvider>
    </>
  );
}
