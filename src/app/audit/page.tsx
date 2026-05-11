import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Navigation } from "@/components/sections/Navigation";
import { Footer } from "@/components/sections/Footer";
import { AuditClient } from "./AuditClient";

export const metadata: Metadata = {
  title: "Audit my contract \u2014 free plain-language risk report",
  description:
    "Upload a contract, lease, or employment letter. Get a plain-language risk grade, top red flags, what's in your favour, and exactly how to push back \u2014 in under a minute.",
  alternates: { canonical: "/audit" },
  openGraph: {
    title: "Audit my contract \u2014 free plain-language risk report",
    description: "Upload your contract, get a plain-language risk grade and the exact pushback to put in writing.",
    url: "/audit",
    type: "website",
  },
};

export default function AuditPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <section className="pt-28 pb-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium mb-4">
            <Sparkles className="h-3.5 w-3.5" aria-hidden /> Free \u00b7 educational only
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--foreground)] leading-tight">
            Audit any contract before you sign it.
          </h1>
          <p className="mt-4 text-lg text-[var(--muted-foreground)]">
            Paste your lease, contract, employment letter, or terms. We&apos;ll return a plain-language risk grade,
            the top red flags, what&apos;s actually in your favour, and the exact wording to push back with.
          </p>
        </div>
      </section>
      <section className="pb-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <AuditClient />
          <div className="mt-10 grid sm:grid-cols-3 gap-3 text-center">
            <Step n={1} title="Paste or upload" body="PDF, text, or paste \u2014 5 MB max, never stored." />
            <Step n={2} title="Pick a jurisdiction" body="195 countries supported \u2014 the audit is country-aware." />
            <Step n={3} title="Get your report" body="Risk grade, red flags, push-back lines, and follow-up chat." />
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] underline-offset-4 hover:underline"
            >
              Need bulk audits or saved history? See Pro and Pro+ <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 text-left">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-sm font-semibold">
        {n}
      </span>
      <p className="mt-3 font-semibold text-[var(--foreground)]">{title}</p>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">{body}</p>
    </div>
  );
}
