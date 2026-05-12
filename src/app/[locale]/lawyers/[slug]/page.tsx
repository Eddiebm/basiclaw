import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Navigation } from "@/components/sections/Navigation";
import { Footer } from "@/components/sections/Footer";
import { getVerifiedLawyerBySlug, VERIFIED_LAWYERS } from "@/data/verified-lawyers";
import { getPartnerLawyerBySlug } from "@/lib/partner-storage";
import { mapPartnerToDirectoryRow, mapVerifiedToDirectoryRow } from "@/lib/lawyer-directory";
import { LawyerConsultForm } from "./LawyerConsultForm";
import { routing } from "@/i18n/routing";

function withUtm(href: string): string {
  try {
    const u = new URL(href, href.startsWith("http") ? undefined : "https://basiclaw.app");
    u.searchParams.set("utm_source", "basiclaw");
    u.searchParams.set("utm_medium", "lawyer_profile");
    u.searchParams.set("utm_campaign", "directory");
    return u.toString();
  } catch {
    return href;
  }
}

export function generateStaticParams(): { locale: string; slug: string }[] {
  return routing.locales.flatMap((locale) => VERIFIED_LAWYERS.map((l) => ({ locale, slug: l.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "lawyerDetail" });
  const verified = getVerifiedLawyerBySlug(slug);
  if (verified) {
    return {
      title: `${verified.name} — ${t("metaTitleSuffix")}`,
      description: verified.statement ?? t("metaFallback", { name: verified.name, jurisdiction: verified.jurisdiction }),
      alternates: { canonical: `/${locale}/lawyers/${verified.slug}` },
    };
  }
  const partner = await getPartnerLawyerBySlug(slug);
  if (partner) {
    return {
      title: `${partner.name} — ${t("metaTitleSuffix")}`,
      description: partner.bio?.trim() || t("metaFallback", { name: partner.name, jurisdiction: partner.jurisdiction }),
      alternates: { canonical: `/${locale}/lawyers/${partner.slug}` },
    };
  }
  return { title: t("notFoundTitle") };
}

export const dynamicParams = true;

export default async function LawyerProfilePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "lawyerDetail" });
  const tfee = await getTranslations({ locale, namespace: "lawyersPage" });
  const verified = getVerifiedLawyerBySlug(slug);
  const partner = verified ? null : await getPartnerLawyerBySlug(slug);
  if (!verified && !partner) notFound();

  const row = verified ? mapVerifiedToDirectoryRow(verified) : mapPartnerToDirectoryRow(partner!);
  const absoluteSite = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://basiclaw.app";
  const pageUrl = `${absoluteSite}/${locale}/lawyers/${row.slug}`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "LegalService",
      name: `${row.name} — BasicLaw directory`,
      url: pageUrl,
      areaServed: row.country,
      description: row.statement ?? row.jurisdiction,
    },
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name: row.name,
      jobTitle: "Lawyer",
      url: pageUrl,
      worksFor: row.firmName ? { "@type": "Organization", name: row.firmName } : undefined,
    },
  ];

  return (
    <main className="min-h-screen">
      <Navigation />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="pt-28 pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-8">
          <Link href="/lawyers" className="text-sm text-[var(--primary)] underline-offset-4 hover:underline">
            {t("backToDirectory")}
          </Link>

          <header className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="h-24 w-24 rounded-full overflow-hidden border border-[var(--border)] bg-[var(--muted)] shrink-0">
              {row.headshotUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={row.headshotUrl} alt="" className="h-full w-full object-cover" width={96} height={96} />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-2xl font-semibold text-[var(--muted-foreground)]">
                  {row.name.slice(0, 1)}
                </div>
              )}
            </div>
            <div className="space-y-2 min-w-0">
              <p className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">{row.jurisdiction}</p>
              <h1 className="text-3xl font-bold text-[var(--foreground)]">{row.name}</h1>
              {row.firmName ? <p className="text-sm text-[var(--muted-foreground)]">{row.firmName}</p> : null}
              <div className="flex flex-wrap gap-2">
                <span className="text-[10px] px-2 py-1 rounded-full border border-[var(--border)]">{row.country}</span>
                <span className="text-[10px] px-2 py-1 rounded-full border border-[var(--primary)]/30 text-[var(--primary)]">
                  {row.kind === "verified" ? t("badgeVerified") : t("badgePartner")}
                </span>
              </div>
            </div>
          </header>

          <div className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">{tfee("practiceAreas")}</h2>
            <div className="flex flex-wrap gap-2">
              {row.practiceAreas.map((a) => (
                <span key={a} className="text-xs px-2 py-1 rounded-md bg-[var(--accent)] text-[var(--foreground)]">
                  {a}
                </span>
              ))}
            </div>
          </div>

          {row.statement ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-[var(--foreground)] leading-relaxed whitespace-pre-wrap">{row.statement}</p>
            </div>
          ) : null}

          <div className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">{t("languages")}</h2>
            <p className="text-sm">{row.languages.join(", ")}</p>
          </div>

          {row.feeStructure ? (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">{t("feeLabel")}</h2>
              <p className="text-sm">{tfee(`fee.${row.feeStructure}`)}</p>
            </div>
          ) : null}

          <p className="text-sm text-[var(--muted-foreground)]">
            {row.acceptsRemoteClients ? t("remoteYes") : t("remoteNo")}
          </p>

          {row.notableReviews && row.notableReviews.length > 0 ? (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">{t("notableTitle")}</h2>
              <ul className="space-y-3">
                {row.notableReviews.map((r, i) => (
                  <li key={i} className="rounded-xl border border-[var(--border)] p-3 text-sm">
                    <p className="italic text-[var(--foreground)]">&ldquo;{r.quote}&rdquo;</p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-2">— {r.attribution}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">{t("contactTitle")}</h2>
            <div className="flex flex-wrap gap-3 text-sm">
              {row.phone ? (
                <a className="text-[var(--primary)] underline-offset-4 hover:underline" href={`tel:${row.phone.replace(/\s+/g, "")}`} rel="nofollow">
                  {t("callCta")}
                </a>
              ) : null}
              {row.email ? (
                <a className="text-[var(--primary)] underline-offset-4 hover:underline" href={`mailto:${row.email}`} rel="nofollow">
                  {t("emailCta")}
                </a>
              ) : null}
              {row.websiteUrl ? (
                <a
                  className="text-[var(--primary)] underline-offset-4 hover:underline"
                  href={withUtm(row.websiteUrl)}
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                >
                  {t("websiteCta")}
                </a>
              ) : null}
            </div>
          </div>

          <LawyerConsultForm slug={row.slug} />
        </div>
      </section>
      <Footer />
    </main>
  );
}
