"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Check, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { BillingCadence, StripeTierId } from "@/lib/stripe-config";
import { track } from "@/lib/analytics";

interface PaidTier {
  id: StripeTierId;
  name: string;
  tagline: string;
  monthly: { price: string; cadence: string };
  annual: { price: string; cadence: string; perMonth: string; savings: string };
  description: string;
  features: string[];
  highlight: boolean;
}

interface FreeTier {
  id: "free";
  name: string;
  tagline: string;
  price: string;
  cadence: string;
  description: string;
  features: string[];
  highlight: boolean;
  cta: { label: string; href: string };
}

const FREE_TIER: FreeTier = {
  id: "free",
  name: "Know Your Rights",
  tagline: "Free forever",
  price: "$0",
  cadence: "always",
  description:
    "Read every constitution. Ask the basics. Walk into a meeting with a lawyer already informed.",
  features: [
    "Browse every country's constitution",
    "Plain-language summaries and key principles",
    "Ask the legal assistant (rate-limited)",
    "Country-by-country rights, police, and tenant guides",
    "1 contract audit / month \u2014 plain-language risk report",
  ],
  highlight: false,
  cta: { label: "Start with a free audit", href: "/audit" },
};

const PAID_TIERS: PaidTier[] = [
  {
    id: "pro",
    name: "Stop Paying By The Hour",
    tagline: "Pro",
    monthly: { price: "$12", cadence: "per month" },
    annual: { price: "$120", cadence: "per year", perMonth: "$10/mo", savings: "Save $24" },
    description:
      "For people facing a contract, a notice, or a legal question that actually matters this week.",
    features: [
      "Everything in Know Your Rights",
      "Unlimited contract audits + saved history",
      "Side-by-side jurisdiction comparison",
      "Save and revisit your chats",
      "Higher-context models, no daily caps",
    ],
    highlight: true,
  },
  {
    id: "plus",
    name: "Operate With Confidence",
    tagline: "Pro+",
    monthly: { price: "$39", cadence: "per month" },
    annual: { price: "$390", cadence: "per year", perMonth: "$32.50/mo", savings: "Save $78" },
    description:
      "For founders, journalists, advocates, and small teams who need legal context across many countries.",
    features: [
      "Everything in Pro",
      "Bulk audit (10 documents / month)",
      "Custom jurisdiction watchlists",
      "Citation-grade output and exports",
      "Priority email support",
    ],
    highlight: false,
  },
];

export function PricingClient() {
  const [cadence, setCadence] = useState<BillingCadence>("monthly");
  const [loadingTier, setLoadingTier] = useState<StripeTierId | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    track("pricing_viewed");
  }, []);

  async function checkout(tier: StripeTierId) {
    setLoadingTier(tier);
    setError(null);
    track("checkout_started", { tier, cadence });
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tier, cadence }),
      });
      const json = (await res.json()) as { url?: string; message?: string; error?: string };
      if (json.url) {
        window.location.assign(json.url);
        return;
      }
      setError(json.message ?? json.error ?? "Could not start checkout. Please try again.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoadingTier(null);
    }
  }

  return (
    <div>
      <div className="flex justify-center mb-8">
        <div className="inline-flex p-1 rounded-full bg-[var(--accent)] border border-[var(--border)]">
          <button
            type="button"
            onClick={() => setCadence("monthly")}
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
              cadence === "monthly"
                ? "bg-[var(--background)] text-[var(--foreground)] shadow-sm"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setCadence("annual")}
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
              cadence === "annual"
                ? "bg-[var(--background)] text-[var(--foreground)] shadow-sm"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            Annual <span className="text-[var(--primary)]">\u00b7 save ~17%</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-auto mb-6 max-w-2xl rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-200">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <FreeTierCard tier={FREE_TIER} />
        {PAID_TIERS.map((tier) => (
          <PaidTierCard
            key={tier.id}
            tier={tier}
            cadence={cadence}
            loading={loadingTier === tier.id}
            onCheckout={() => checkout(tier.id)}
          />
        ))}
      </div>
    </div>
  );
}

function FreeTierCard({ tier }: { tier: FreeTier }) {
  return (
    <div className="relative flex flex-col rounded-3xl border border-[var(--border)] shadow-sm bg-[var(--card)] p-6 sm:p-8">
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
      <Button asChild variant="outline" className="mt-8 w-full justify-between">
        <Link href={tier.cta.href}>
          {tier.cta.label}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}

function PaidTierCard({
  tier,
  cadence,
  loading,
  onCheckout,
}: {
  tier: PaidTier;
  cadence: BillingCadence;
  loading: boolean;
  onCheckout: () => void;
}) {
  const pricing = cadence === "annual" ? tier.annual : tier.monthly;
  const isAnnual = cadence === "annual";
  return (
    <div
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
        <span className="text-4xl font-bold text-[var(--foreground)]">{pricing.price}</span>
        <span className="text-sm text-[var(--muted-foreground)]">/ {pricing.cadence}</span>
      </p>
      {isAnnual && (
        <p className="mt-1 text-xs text-[var(--primary)] font-medium">
          {tier.annual.perMonth} \u00b7 {tier.annual.savings}
        </p>
      )}
      <ul className="mt-6 space-y-3 text-sm text-[var(--foreground)]">
        {tier.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <Check className="h-4 w-4 text-[var(--primary)] flex-shrink-0 mt-0.5" aria-hidden />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Button
        onClick={onCheckout}
        disabled={loading}
        className="mt-8 w-full justify-between"
        variant={tier.highlight ? "default" : "outline"}
      >
        {loading ? "Starting checkout\u2026" : `Subscribe to ${tier.tagline}`}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
