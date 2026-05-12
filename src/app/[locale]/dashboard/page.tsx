import type { Metadata } from "next";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Navigation } from "@/components/sections/Navigation";
import { Footer } from "@/components/sections/Footer";
import { DashboardClient } from "./DashboardClient";
import { isClerkEnabled } from "@/lib/auth-config";
import { getUserPlanForUserId } from "@/lib/entitlements";
import { limitsForPlan } from "@/lib/limits";
import { hashIpForUsage, clientIpFromHeaders } from "@/lib/request-ip";
import { buildSharedAuditHref, createSharedAuditToken } from "@/lib/shared-audit-url";
import { getUsage, listAuditsForUser, listChatsForUser } from "@/lib/storage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboardPage" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    robots: { index: false, follow: false },
  };
}

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboardPage" });

  if (!isClerkEnabled()) {
    return (
      <main className="min-h-screen">
        <Navigation />
        <section className="pt-28 pb-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-[var(--foreground)]">{t("disabledTitle")}</h1>
            <p className="mt-3 text-[var(--muted-foreground)]">{t("disabledBody")}</p>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  const { userId } = await auth();
  if (!userId) {
    redirect(`/${locale}/sign-in?redirect_url=/${locale}/dashboard`);
  }

  const hdrs = await headers();
  const ipHash = hashIpForUsage(clientIpFromHeaders(hdrs));

  const [chats, audits, plan, usage] = await Promise.all([
    listChatsForUser(userId),
    listAuditsForUser(userId),
    getUserPlanForUserId(userId),
    getUsage(userId, ipHash),
  ]);

  const limits = limitsForPlan(plan);
  const auditsForClient = audits.map((a) => ({
    id: a.id,
    title: a.title,
    auditType: a.auditType,
    jurisdiction: a.jurisdiction,
    updatedAt: a.updatedAt,
    shareHref: buildSharedAuditHref(locale, createSharedAuditToken(userId, a.id)),
  }));

  return (
    <main className="min-h-screen">
      <Navigation />
      <section className="pt-28 pb-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)]">{t("title")}</h1>
          <p className="mt-3 text-[var(--muted-foreground)]">{t("subtitle")}</p>
          <Suspense fallback={null}>
            <DashboardClient
              initialChats={chats}
              initialAudits={auditsForClient}
              usageSnapshot={{ plan, usage, limits }}
            />
          </Suspense>
          <div className="mt-10 grid gap-3">
            <Link href="/chat" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] underline underline-offset-4">
              → {t("linkChat")}
            </Link>
            <Link href="/constitutions" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] underline underline-offset-4">
              → {t("linkConstitutions")}
            </Link>
            <Link href="/audit" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] underline underline-offset-4">
              → {t("linkAudit")}
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
