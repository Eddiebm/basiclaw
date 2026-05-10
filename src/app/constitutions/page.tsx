import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BookText, Globe2, Library } from "lucide-react";
import { Navigation } from "@/components/sections/Navigation";
import { Footer } from "@/components/sections/Footer";
import { CountryBrowser } from "@/components/constitutions/CountryBrowser";
import { COUNTRIES } from "@/data/countries";
import { countryStats, getPopularCountries } from "@/lib/jurisdictions";

export const metadata: Metadata = {
  title: "Every Country's Constitution \u2014 Searchable Library | BasicLaw",
  description:
    "Browse the constitutions of all 195 countries in plain language. Compare legal systems, key principles, and amendment history side by side.",
  alternates: { canonical: "/constitutions" },
  openGraph: {
    title: "Every Country's Constitution \u2014 BasicLaw",
    description:
      "Browse the constitutions of all 195 countries in plain language. Compare legal systems, key principles, and amendment history.",
    url: "/constitutions",
    type: "website",
  },
};

export default function ConstitutionsPage() {
  const stats = countryStats();
  const popular = getPopularCountries();

  return (
    <main className="min-h-screen">
      <Navigation />
      <header className="pt-28 pb-12 border-b border-[var(--border)] bg-gradient-to-b from-[var(--accent)]/40 to-transparent">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to BasicLaw
          </Link>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium mb-4">
                <Library className="h-3.5 w-3.5" aria-hidden />
                The Constitution Library
              </span>
              <h1 className="text-4xl sm:text-5xl font-bold text-[var(--foreground)] mb-4 leading-tight">
                Every country&apos;s constitution, in one place.
              </h1>
              <p className="text-lg text-[var(--muted-foreground)]">
                Search {stats.total} jurisdictions. Filter by region or legal system. Read a plain-language summary, the key principles, and link straight to the official text.
              </p>
            </div>
            <dl className="grid grid-cols-3 gap-3 text-center sm:text-left">
              <Stat label="Countries" value={stats.total} icon={<Globe2 className="h-4 w-4" aria-hidden />} />
              <Stat label="Live now" value={stats.active} />
              <Stat label="Preview" value={stats.preview} />
            </dl>
          </div>
        </div>
      </header>

      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <CountryBrowser countries={COUNTRIES} popular={popular} />
        </div>
      </section>

      <section className="py-16 bg-[var(--accent)]/30">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <BookText className="mx-auto h-8 w-8 text-[var(--primary)]" aria-hidden />
          <h2 className="mt-4 text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
            About this library
          </h2>
          <p className="mt-3 text-[var(--muted-foreground)]">
            Constitutional summaries on BasicLaw are educational. Where possible, we link to the official primary source and to the Comparative Constitutions Project for the full English text. Always verify against the official version before relying on a constitutional provision.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function Stat({ label, value, icon }: { label: string; value: number; icon?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3">
      <dt className="text-xs uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-1.5">
        {icon}
        {label}
      </dt>
      <dd className="text-2xl font-bold text-[var(--foreground)]">{value}</dd>
    </div>
  );
}
