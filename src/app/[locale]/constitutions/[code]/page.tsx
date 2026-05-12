import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ArrowRightLeft,
  BookText,
  CalendarClock,
  ExternalLink,
  FileText,
  Globe2,
  Home,
  Languages,
  Library,
  MapPin,
  Scale,
  ShieldAlert,
  Sparkles,
  BadgeCheck,
} from "lucide-react";
import { Navigation } from "@/components/sections/Navigation";
import { Footer } from "@/components/sections/Footer";
import { routing } from "@/i18n/routing";
import { Button } from "@/components/ui/Button";
import { EventTracker } from "@/components/analytics/EventTracker";
import { LawyerCtaLink } from "@/components/analytics/LawyerCtaLink";
import { COUNTRIES } from "@/data/countries";
import { LEGAL_SYSTEM_DESCRIPTIONS, LEGAL_SYSTEM_LABELS } from "@/data/types";
import { getCountry, getLastVerified, getSources } from "@/lib/jurisdictions";
import { buildOgImageUrl } from "@/lib/og-image-url";
import { ConstitutionPlainSummaryBody } from "@/components/constitution/ConstitutionPlainSummaryBody";
import { findVerifierForConstitution } from "@/lib/verified-lawyers-ui";

type RouteParams = { locale: string; code: string };

export function generateStaticParams(): RouteParams[] {
  return routing.locales.flatMap((locale) =>
    COUNTRIES.map((country) => ({ locale, code: country.code.toLowerCase() }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { locale, code } = await params;
  const country = getCountry(code);
  if (!country) return { title: "Not found \u2014 BasicLaw" };
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://basiclaw.app";
  const og = buildOgImageUrl(site, {
    kind: "constitution",
    title: `${country.flag} ${country.name}`,
    subtitle: country.constitution.title,
  });
  const title = `${country.constitution.title} \u2014 ${country.name} | BasicLaw`;
  const description = country.constitution.summary;
  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/constitutions/${country.code.toLowerCase()}`,
    },
    openGraph: {
      title: `${country.flag} ${country.name} \u2014 Constitution overview`,
      description,
      url: `/${locale}/constitutions/${country.code.toLowerCase()}`,
      type: "article",
      images: [{ url: og, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${country.flag} ${country.name} \u2014 Constitution overview`,
      description,
      images: [og],
    },
  };
}

export default async function ConstitutionDetailPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { locale, code } = await params;
  const country = getCountry(code);
  if (!country) notFound();

  const t = await getTranslations({ locale, namespace: "constitutionDetail" });
  const { constitution } = country;
  const sources = getSources(country);
  const lastVerified = getLastVerified(country);
  const constitutionVerifier = findVerifierForConstitution(country.code);
  const lastVerifiedDate = new Date(lastVerified);
  const formattedLastVerified = lastVerifiedDate.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${country.name} \u2014 ${constitution.title}`,
    description: constitution.summary,
    inLanguage: locale,
    dateModified: lastVerified,
    about: {
      "@type": "Country",
      name: country.name,
    },
    isBasedOn: constitution.officialUrl ?? constitution.fullTextUrl,
    citation: sources.map((source) => ({
      "@type": "CreativeWork",
      name: source.label,
      url: source.url,
    })),
    publisher: { "@type": "Organization", name: "BasicLaw" },
  };

  const TOPIC_PAGES = [
    { slug: "rights" as const, icon: Sparkles, title: t("topic_rights_title"), blurb: t("topic_rights_blurb") },
    {
      slug: "police-stop" as const,
      icon: ShieldAlert,
      title: t("topic_police_title"),
      blurb: t("topic_police_blurb"),
    },
    {
      slug: "landlord" as const,
      icon: Home,
      title: t("topic_landlord_title"),
      blurb: t("topic_landlord_blurb"),
    },
  ];

  const sortedSiblings = COUNTRIES.slice().sort((a, b) => a.name.localeCompare(b.name));
  const indexInList = sortedSiblings.findIndex((c) => c.code === country.code);
  const previous = sortedSiblings[(indexInList - 1 + sortedSiblings.length) % sortedSiblings.length];
  const next = sortedSiblings[(indexInList + 1) % sortedSiblings.length];

  return (
    <main className="min-h-screen">
      <Navigation />
      <EventTracker
        event="constitution_viewed"
        properties={{
          country_code: country.code,
          country: country.name,
          region: country.region,
          legal_system: country.legalSystem,
        }}
      />
      <article className="pb-20 pt-24 sm:pt-28">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[11.5rem_minmax(0,1fr)] xl:grid-cols-[13rem_minmax(0,1fr)]">
            <aside className="hidden lg:block">
              <nav aria-label={t("tocNav")} className="sticky top-28 space-y-1 border-l border-[var(--border)] pl-4 text-sm">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted-foreground)]">{t("tocNav")}</p>
                <a href="#overview" className="block py-1 text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]">
                  {t("tocOverview")}
                </a>
                <a href="#summary" className="block py-1 text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]">
                  {t("tocSummary")}
                </a>
                <a href="#principles" className="block py-1 text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]">
                  {t("tocPrinciples")}
                </a>
                <a href="#guides" className="block py-1 text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]">
                  {t("tocGuides")}
                </a>
                <a href="#sources" className="block py-1 text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]">
                  {t("tocSources")}
                </a>
              </nav>
            </aside>
            <div className="min-w-0">
              <nav
                aria-label={t("tocNav")}
                className="lg:hidden -mx-1 mb-8 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]"
              >
                {(
                  [
                    ["#overview", t("tocOverview")],
                    ["#summary", t("tocSummary")],
                    ["#principles", t("tocPrinciples")],
                    ["#guides", t("tocGuides")],
                    ["#sources", t("tocSources")],
                  ] as const
                ).map(([href, label]) => (
                  <a
                    key={href}
                    href={href}
                    className="shrink-0 rounded-full border border-[var(--border)] bg-[var(--card)]/90 px-3 py-1.5 text-xs font-medium text-[var(--muted-foreground)] transition hover:border-[var(--primary)]/35 hover:text-[var(--foreground)]"
                  >
                    {label}
                  </a>
                ))}
              </nav>
        <div className="max-w-[min(42rem,100%)]">
          <Link
            href="/constitutions"
            className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] transition hover:text-[var(--foreground)] mb-8"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {t("backAll")}
          </Link>

          <div
            id="overview"
            role="note"
            className="mb-10 flex items-start gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/[0.07] p-4 text-sm text-amber-950 dark:text-amber-100"
          >
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden />
            <p>
              <strong className="font-semibold">{t("eduSummaryLead")}</strong> {t("eduSummaryBody")}
            </p>
          </div>

          {constitutionVerifier ? (
            <p className="mb-10 flex items-start gap-2 text-sm text-[var(--muted-foreground)]">
              <BadgeCheck className="h-4 w-4 mt-0.5 text-[var(--primary)] shrink-0" aria-hidden />
              <span>{t("verifiedByLawyer", { name: constitutionVerifier.name, jurisdiction: constitutionVerifier.jurisdiction })}</span>
            </p>
          ) : null}

          <header className="mb-12 flex flex-col gap-8 border-b border-[var(--border)]/80 pb-12 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <span className="text-6xl sm:text-7xl block leading-none mb-4" aria-hidden>{country.flag}</span>
              <p className="text-xs font-medium tracking-[0.18em] text-[var(--muted-foreground)] mb-2 [font-family:var(--font-sans),system-ui,sans-serif]">
                {country.region} · {country.subregion}
              </p>
              <h1 className="font-editorial text-4xl sm:text-5xl text-[var(--foreground)] leading-[1.08] tracking-tight">
                {country.officialName ?? country.name}
              </h1>
              <p className="mt-4 text-xl leading-relaxed text-[var(--muted-foreground)]">
                {constitution.title}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:items-end text-sm">
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1.5">
                <Scale className="h-4 w-4 text-[var(--primary)]" aria-hidden />
                {LEGAL_SYSTEM_LABELS[country.legalSystem]}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1.5">
                <CalendarClock className="h-4 w-4 text-[var(--primary)]" aria-hidden />
                {t("adopted")} {constitution.yearAdopted}
                {constitution.yearLatestAmendment && constitution.yearLatestAmendment !== constitution.yearAdopted
                  ? ` · ${t("amended")} ${constitution.yearLatestAmendment}`
                  : null}
              </span>
            </div>
          </header>

          <section id="summary" className="scroll-mt-28 mb-14">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted-foreground)] mb-4">
              {t("plainLanguage")}
            </h2>
            <ConstitutionPlainSummaryBody summary={constitution.summary} jurisdictionCode={country.code} />
          </section>

          <div id="principles" className="grid scroll-mt-28 lg:grid-cols-[2fr_1fr] gap-8 mb-14">
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/90 p-6 sm:p-8 shadow-[0_1px_0_oklch(0_0_0/0.04)] backdrop-blur-sm">
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted-foreground)] mb-5 flex items-center gap-2">
                <Sparkles className="h-4 w-4" aria-hidden />
                {t("keyPrinciples")}
              </h2>
              <ul className="grid sm:grid-cols-2 gap-3">
                {constitution.keyPrinciples.map((principle) => (
                  <li
                    key={principle}
                    className="flex items-start gap-2 rounded-xl border border-[var(--border)]/60 bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--primary)] flex-shrink-0" aria-hidden />
                    {principle}
                  </li>
                ))}
              </ul>
              <div className="mt-6 rounded-xl border border-[var(--border)]/60 bg-[var(--background)] p-4">
                <p className="text-xs uppercase tracking-wider text-[var(--muted-foreground)] mb-1">
                  {t("howLegalWorks", { system: LEGAL_SYSTEM_LABELS[country.legalSystem] })}
                </p>
                <p className="text-sm text-[var(--foreground)]">
                  {LEGAL_SYSTEM_DESCRIPTIONS[country.legalSystem]}
                </p>
              </div>
            </section>

            <aside className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8 space-y-4">
              <h2 className="text-sm uppercase tracking-wider text-[var(--muted-foreground)]">{t("atAGlance")}</h2>
              <FactRow icon={<MapPin className="h-4 w-4" aria-hidden />} label={t("capital")} value={country.capital} />
              <FactRow icon={<Globe2 className="h-4 w-4" aria-hidden />} label={t("region")} value={`${country.region} · ${country.subregion}`} />
              <FactRow icon={<Languages className="h-4 w-4" aria-hidden />} label={t("languages")} value={country.languages.join(", ")} />
              <FactRow
                icon={<BookText className="h-4 w-4" aria-hidden />}
                label={t("statusLabel")}
                value={
                  country.status === "active"
                    ? t("status_active")
                    : country.status === "preview"
                      ? t("status_preview")
                      : t("status_planned")
                }
              />

              <div className="space-y-2 pt-2 border-t border-[var(--border)]/60">
                {constitution.officialUrl && (
                  <Button asChild variant="outline" className="w-full justify-between">
                    <a href={constitution.officialUrl} target="_blank" rel="noreferrer">
                      {t("officialSource")} <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                {constitution.fullTextUrl && (
                  <Button asChild className="w-full justify-between">
                    <a href={constitution.fullTextUrl} target="_blank" rel="noreferrer">
                      {t("readFullText")} <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                <Button asChild variant="ghost" className="w-full justify-between">
                  <Link href={`/chat?country=${country.code.toLowerCase()}`}>
                    {t("askQuestion", { country: country.name })} <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <LawyerCtaLink
                  href={`/find-a-lawyer?country=${country.code.toLowerCase()}`}
                  source="constitution_detail_sidebar"
                  className="inline-flex h-10 w-full items-center justify-between rounded-md border border-[var(--border)] bg-transparent px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors"
                >
                  {t("findLawyerCta", { country: country.name })}
                  <ArrowRight className="h-4 w-4" />
                </LawyerCtaLink>
                <div className="rounded-xl border border-[var(--primary)]/20 bg-[var(--primary)]/5 p-4">
                  <p className="text-xs font-semibold text-[var(--foreground)] mb-1 flex items-center gap-2">
                    <ArrowRightLeft className="h-3.5 w-3.5 text-[var(--primary)]" aria-hidden />
                    {t("compareAsideTitle")}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed mb-3">{t("compareAsideBody", { country: country.name })}</p>
                  <Button asChild variant="outline" size="sm" className="w-full justify-between">
                    <Link
                      href={`/compare?a=${country.code}&b=${country.code === "US" ? "GH" : "US"}&topic=rights`}
                    >
                      {t("compareAsideCta")}
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </Button>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--background)]/80 p-4">
                  <p className="text-xs font-semibold text-[var(--foreground)] mb-1">{t("sidebarIndexTitle")}</p>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed mb-3">{t("sidebarIndexBody")}</p>
                  <Button asChild variant="ghost" size="sm" className="w-full justify-between px-0 h-auto text-[var(--primary)]">
                    <Link href={`/the-index/${country.code.toLowerCase()}`}>
                      {t("sidebarIndexCta")}
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </Button>
                </div>
              </div>
            </aside>
          </div>

          <section
            id="guides"
            aria-labelledby="topics-heading"
            className="mb-12 scroll-mt-28 rounded-2xl border border-[var(--border)] bg-[var(--card)]/90 p-6 sm:p-8 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between flex-wrap gap-2 mb-5">
              <h2 id="topics-heading" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted-foreground)] flex items-center gap-2">
                <Library className="h-4 w-4" aria-hidden />
                {t("guidesHeading", { country: country.name })}
              </h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {TOPIC_PAGES.map(({ slug, icon: Icon, title, blurb }) => (
                <Link
                  key={slug}
                  href={`/${country.code.toLowerCase()}/${slug}`}
                  className="group flex flex-col gap-2 rounded-2xl border border-[var(--border)]/60 bg-[var(--background)] p-4 hover:border-[var(--primary)] hover:shadow-md transition-all"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <p className="font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                    {title}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">{blurb}</p>
                  <span className="mt-auto text-xs text-[var(--muted-foreground)] flex items-center gap-1">
                    {t("readGuide")}{" "}
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden />
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {country.code === "US" && (
            <section className="mb-10 rounded-3xl border border-[var(--primary)]/25 bg-[var(--primary)]/5 p-6 sm:p-8">
              <h2 className="text-sm uppercase tracking-wider text-[var(--muted-foreground)] mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4" aria-hidden />
                {t("usStatesTitle")}
              </h2>
              <p className="text-sm text-[var(--foreground)] leading-relaxed mb-4 max-w-3xl">{t("usStatesBody")}</p>
              <Button asChild>
                <Link href="/us/states">
                  {t("usStatesCta")}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </Button>
            </section>
          )}

          <section
            id="sources"
            aria-labelledby="sources-heading"
            className="mb-12 scroll-mt-28 rounded-2xl border border-[var(--border)] bg-[var(--card)]/90 p-6 sm:p-8 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
              <h2 id="sources-heading" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted-foreground)] flex items-center gap-2">
                <FileText className="h-4 w-4" aria-hidden />
                {t("sources")}
              </h2>
              <p className="text-xs text-[var(--muted-foreground)]">
                {t("lastVerifiedIntro")}{" "}
                <time dateTime={lastVerified}>{formattedLastVerified}</time>
              </p>
            </div>
            {sources.length > 0 ? (
              <ul className="space-y-2">
                {sources.map((source) => (
                  <li key={source.url}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-start gap-2 text-sm text-[var(--foreground)] hover:text-[var(--primary)] underline-offset-4 hover:underline"
                    >
                      <ExternalLink className="h-4 w-4 mt-0.5 flex-shrink-0 text-[var(--muted-foreground)]" aria-hidden />
                      <span>{source.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[var(--muted-foreground)]">{t("sourcesMissing")}</p>
            )}
            <p className="mt-4 text-xs text-[var(--muted-foreground)] leading-relaxed">{t("corrections")}</p>
          </section>

          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--accent)]/30 p-5 text-sm text-[var(--muted-foreground)] mb-10">
            {t("bottomDisclaimer")}
          </div>

          <nav aria-label="Adjacent constitutions" className="flex items-center justify-between gap-4">
            <Link
              href={`/constitutions/${previous.code.toLowerCase()}`}
              className="group inline-flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm text-[var(--foreground)] hover:border-[var(--primary)] transition-colors"
            >
              <ArrowLeft className="h-4 w-4 text-[var(--muted-foreground)] group-hover:-translate-x-0.5 transition-transform" aria-hidden />
              <span>
                <span className="block text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">{t("previous")}</span>
                <span className="font-semibold">{previous.flag} {previous.name}</span>
              </span>
            </Link>
            <Link
              href={`/constitutions/${next.code.toLowerCase()}`}
              className="group inline-flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm text-[var(--foreground)] hover:border-[var(--primary)] transition-colors text-right"
            >
              <span>
                <span className="block text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">{t("next")}</span>
                <span className="font-semibold">{next.flag} {next.name}</span>
              </span>
              <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)] group-hover:translate-x-0.5 transition-transform" aria-hidden />
            </Link>
          </nav>
        </div>
            </div>
          </div>
        </div>
      </article>
      <Footer />
    </main>
  );
}

function FactRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
        {icon}
      </span>
      <div className="text-sm">
        <p className="text-[var(--muted-foreground)] text-xs font-medium tracking-wide">{label}</p>
        <p className="text-[var(--foreground)] font-medium">{value}</p>
      </div>
    </div>
  );
}

