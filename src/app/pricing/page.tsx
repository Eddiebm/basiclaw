import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Navigation } from "@/components/sections/Navigation";
import { Footer } from "@/components/sections/Footer";
import { countryStats } from "@/lib/jurisdictions";
import { PricingClient } from "./PricingClient";

export const metadata: Metadata = {
  title: "Pricing \u2014 Plain-language law you can actually afford",
  description:
    "Start free. Upgrade when you need document analysis, multi-jurisdiction comparison, saved chats, or higher-tier models.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  const stats = countryStats();
  return (
    <main className="min-h-screen">
      <Navigation />
      <section className="pt-28 pb-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium mb-4">
            <Sparkles className="h-3.5 w-3.5" aria-hidden /> Built for everyday legal questions
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--foreground)] leading-tight">
            Pricing that pays for itself the first time you don&apos;t need to call.
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-[var(--muted-foreground)]">
            BasicLaw covers all {stats.total} countries for free. Pro and Pro+ add the heavier lifting \u2014 document analysis, comparison, exports, and priority models.
          </p>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <PricingClient />
          <p className="mt-10 text-center text-sm text-[var(--muted-foreground)]">
            Need a Team or Newsroom plan? <Link href="mailto:hello@basiclaw.app" className="underline underline-offset-4 hover:text-[var(--foreground)]">Get in touch</Link>.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
