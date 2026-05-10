import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Sparkles, Star } from "lucide-react";
import { Navigation } from "@/components/sections/Navigation";
import { Footer } from "@/components/sections/Footer";
import { Button } from "@/components/ui/Button";
import { countryStats } from "@/lib/jurisdictions";

export const metadata: Metadata = {
  title: "Pricing — Plain-language law you can actually afford",
  description:
    "Start free. Upgrade when you need document analysis, multi-jurisdiction comparison, saved chats, or higher-tier models.",
  alternates: { canonical: "/pricing" },
};

const tiers = [
  {
    id: "know-your-rights",
    name: "Know Your Rights",
    tagline: "Free forever",
    price: "$0",
    cadence: "always",
    description: "Read every constitution. Ask the basics. Walk into a meeting with a lawyer already informed.",
    features: [
      "Browse every country's constitution",
      "Plain-language summaries and key principles",
      "Ask the legal assistant (rate-limited)",
      "Light/dark, mobile-friendly, no sign-up to read",
    ],
    cta: { label: "Start reading", href: "/constitutions" },
    highlight: false,
  },
  {
    id: "stop-paying-by-the-hour",
    name: "Stop Paying By The Hour",
    tagline: "Pro",
    price: "$12",
    cadence: "per month",
    description: "For people facing a contract, a notice, or a legal question that actually matters this week.",
    features: [
      "Everything in Know Your Rights",
      "Document analysis (paste a contract, lease, or notice)",
      "Side-by-side jurisdiction comparison",
      "Save and revisit your chats",
      "Higher-context models, no daily caps",
    ],
    cta: { label: "Upgrade to Pro", href: "/chat?upgrade=pro" },
    highlight: true,
  },
  {
    id: "operate-with-confidence",
    name: "Operate With Confidence",
    tagline: "Pro+",
    price: "$39",
    cadence: "per month",
    description: "For founders, journalists, advocates, and small teams who need legal context across many countries.",
    features: [
      "Everything in Pro",
      "Bulk document analysis (5 docs / month)",
      "Custom jurisdiction watchlists",
      "Citation-grade output and exports",
      "Priority email support",
    ],
    cta: { label: "Upgrade to Pro+", href: "/chat?upgrade=plus" },
    highlight: false,
  },
];

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
            BasicLaw covers all {stats.total} countries for free. Pro and Pro+ add the heavier lifting — document analysis, comparison, exports, and priority models.
          </p>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className={`relative flex flex-col rounded-3xl border bg-[var(--card)] p-6 sm:p-8 ${
                  tier.highlight
                    ? "border-[var(--primary)] shadow-xl ring-1 ring-[var(--primary)]/20"
                    : "border-[var(--border)] shadow-sm"
                }`}
              >
                {tier.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] text-xs font-semibold">
                    <Star className="h-3 w-3" aria-hidden /> Most chosen
                  </span>
                )}
                <p className="text-xs uppercase tracking-wider text-[var(--muted-foreground)]">{tier.tagline}</p>
                <h2 className="mt-1 text-xl font-bold text-[var(--foreground)]">{tier.name}</h2>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">{tier.description}</p>
                <p className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-[var(--foreground)]">{tier.price}</span>
                  <span className="text-sm text-[var(--muted-foreground)]">/ {tier.cadence}</span>
                </p>
                <ul className="mt-6 space-y-3 text-sm text-[var(--foreground)]">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-[var(--primary)] flex-shrink-0 mt-0.5" aria-hidden />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild className="mt-8 w-full justify-between" variant={tier.highlight ? "default" : "outline"}>
                  <Link href={tier.cta.href}>
                    {tier.cta.label}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>

          <p className="mt-10 text-center text-sm text-[var(--muted-foreground)]">
            Need a Team or Newsroom plan? <Link href="mailto:hello@basiclaw.app" className="underline underline-offset-4 hover:text-[var(--foreground)]">Get in touch</Link>.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
