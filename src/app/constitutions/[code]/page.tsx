import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookText,
  CalendarClock,
  ExternalLink,
  Globe2,
  Languages,
  MapPin,
  Scale,
  Sparkles,
} from "lucide-react";
import { Navigation } from "@/components/sections/Navigation";
import { Footer } from "@/components/sections/Footer";
import { Button } from "@/components/ui/Button";
import { COUNTRIES } from "@/data/countries";
import { LEGAL_SYSTEM_DESCRIPTIONS, LEGAL_SYSTEM_LABELS } from "@/data/types";
import { getCountry } from "@/lib/jurisdictions";

type RouteParams = { code: string };

export function generateStaticParams(): RouteParams[] {
  return COUNTRIES.map((country) => ({ code: country.code.toLowerCase() }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { code } = await params;
  const country = getCountry(code);
  if (!country) return { title: "Not found \u2014 BasicLaw" };
  const title = `${country.constitution.title} \u2014 ${country.name} | BasicLaw`;
  const description = country.constitution.summary;
  return {
    title,
    description,
    alternates: { canonical: `/constitutions/${country.code.toLowerCase()}` },
    openGraph: {
      title: `${country.flag} ${country.name} \u2014 Constitution overview`,
      description,
      url: `/constitutions/${country.code.toLowerCase()}`,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${country.flag} ${country.name} \u2014 Constitution overview`,
      description,
    },
  };
}

export default async function ConstitutionDetailPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { code } = await params;
  const country = getCountry(code);
  if (!country) notFound();

  const { constitution } = country;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${country.name} \u2014 ${constitution.title}`,
    description: constitution.summary,
    inLanguage: "en",
    about: {
      "@type": "Country",
      name: country.name,
    },
    isBasedOn: constitution.officialUrl ?? constitution.fullTextUrl,
    publisher: { "@type": "Organization", name: "BasicLaw" },
  };

  const sortedSiblings = COUNTRIES.slice().sort((a, b) => a.name.localeCompare(b.name));
  const indexInList = sortedSiblings.findIndex((c) => c.code === country.code);
  const previous = sortedSiblings[(indexInList - 1 + sortedSiblings.length) % sortedSiblings.length];
  const next = sortedSiblings[(indexInList + 1) % sortedSiblings.length];

  return (
    <main className="min-h-screen">
      <Navigation />
      <article className="pt-28 pb-16">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/constitutions"
            className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            All constitutions
          </Link>

          <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-10">
            <div>
              <span className="text-6xl sm:text-7xl block leading-none mb-4" aria-hidden>{country.flag}</span>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted-foreground)] mb-2">
                {country.region} · {country.subregion}
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] leading-tight">
                {country.officialName ?? country.name}
              </h1>
              <p className="mt-3 text-lg text-[var(--muted-foreground)]">
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
                Adopted {constitution.yearAdopted}
                {constitution.yearLatestAmendment && constitution.yearLatestAmendment !== constitution.yearAdopted
                  ? ` · amended ${constitution.yearLatestAmendment}`
                  : null}
              </span>
            </div>
          </header>

          <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8 mb-8 shadow-sm">
            <h2 className="text-sm uppercase tracking-wider text-[var(--muted-foreground)] mb-3">In plain language</h2>
            <p className="text-lg text-[var(--foreground)] leading-relaxed">{constitution.summary}</p>
          </section>

          <div className="grid lg:grid-cols-[2fr_1fr] gap-6 mb-12">
            <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8">
              <h2 className="text-sm uppercase tracking-wider text-[var(--muted-foreground)] mb-4 flex items-center gap-2">
                <Sparkles className="h-4 w-4" aria-hidden />
                Key principles
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
                  How {LEGAL_SYSTEM_LABELS[country.legalSystem]} works
                </p>
                <p className="text-sm text-[var(--foreground)]">
                  {LEGAL_SYSTEM_DESCRIPTIONS[country.legalSystem]}
                </p>
              </div>
            </section>

            <aside className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8 space-y-4">
              <h2 className="text-sm uppercase tracking-wider text-[var(--muted-foreground)]">At a glance</h2>
              <FactRow icon={<MapPin className="h-4 w-4" aria-hidden />} label="Capital" value={country.capital} />
              <FactRow icon={<Globe2 className="h-4 w-4" aria-hidden />} label="Region" value={`${country.region} · ${country.subregion}`} />
              <FactRow icon={<Languages className="h-4 w-4" aria-hidden />} label="Languages" value={country.languages.join(", ")} />
              <FactRow icon={<BookText className="h-4 w-4" aria-hidden />} label="Status on BasicLaw" value={statusLabel(country.status)} />

              <div className="space-y-2 pt-2 border-t border-[var(--border)]/60">
                {constitution.officialUrl && (
                  <Button asChild variant="outline" className="w-full justify-between">
                    <a href={constitution.officialUrl} target="_blank" rel="noreferrer">
                      Official source <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                {constitution.fullTextUrl && (
                  <Button asChild className="w-full justify-between">
                    <a href={constitution.fullTextUrl} target="_blank" rel="noreferrer">
                      Read full text <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                <Button asChild variant="ghost" className="w-full justify-between">
                  <Link href={`/chat?country=${country.code.toLowerCase()}`}>
                    Ask a question about {country.name} <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </aside>
          </div>

          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--accent)]/30 p-5 text-sm text-[var(--muted-foreground)] mb-10">
            <strong className="text-[var(--foreground)]">Educational only.</strong> BasicLaw is not a law firm. Constitutional provisions can be amended, suspended, or interpreted differently by domestic courts. Verify with the official source before relying on any provision.
          </div>

          <nav aria-label="Adjacent constitutions" className="flex items-center justify-between gap-4">
            <Link
              href={`/constitutions/${previous.code.toLowerCase()}`}
              className="group inline-flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm text-[var(--foreground)] hover:border-[var(--primary)] transition-colors"
            >
              <ArrowLeft className="h-4 w-4 text-[var(--muted-foreground)] group-hover:-translate-x-0.5 transition-transform" aria-hidden />
              <span>
                <span className="block text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">Previous</span>
                <span className="font-semibold">{previous.flag} {previous.name}</span>
              </span>
            </Link>
            <Link
              href={`/constitutions/${next.code.toLowerCase()}`}
              className="group inline-flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm text-[var(--foreground)] hover:border-[var(--primary)] transition-colors text-right"
            >
              <span>
                <span className="block text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">Next</span>
                <span className="font-semibold">{next.flag} {next.name}</span>
              </span>
              <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)] group-hover:translate-x-0.5 transition-transform" aria-hidden />
            </Link>
          </nav>
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
        <p className="text-[var(--muted-foreground)] text-xs uppercase tracking-wider">{label}</p>
        <p className="text-[var(--foreground)] font-medium">{value}</p>
      </div>
    </div>
  );
}

function statusLabel(status: "active" | "preview" | "planned"): string {
  switch (status) {
    case "active":
      return "Live with full assistant support";
    case "preview":
      return "Constitutional summary ready · assistant in preview";
    case "planned":
      return "Planned — join the waitlist";
  }
}
