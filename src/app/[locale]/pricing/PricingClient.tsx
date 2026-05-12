"use client";

import { Link } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, Check, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { BillingCadence, StripeTierId } from "@/lib/stripe-config";
import { track } from "@/lib/analytics";

export function PricingClient() {
  const pp = useTranslations("pricingPage");
  const [cadence, setCadence] = useState<BillingCadence>("monthly");
  const [loadingTier, setLoadingTier] = useState<StripeTierId | null>(null);
  const [error, setError] = useState<string | null>(null);

  const freeFeatures = pp.raw("free.features") as string[];
  const proFeatures = pp.raw("pro.features") as string[];
  const plusFeatures = pp.raw("plus.features") as string[];

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
      setError(json.message ?? json.error ?? pp("checkoutError"));
    } catch (err) {
      setError(err instanceof Error ? err.message : pp("networkError"));
    } finally {
      setLoadingTier(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex justify-center mb-10">
        <div className="inline-flex p-1 rounded-full border border-[var(--border)] bg-[var(--surface-glass)] shadow-[0_1px_0_oklch(0_0_0/0.04)] backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setCadence("monthly")}
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
              cadence === "monthly"
                ? "bg-[var(--background)] text-[var(--foreground)] shadow-sm"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            {pp("tiersMonthly")}
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
            {pp("tiersAnnual")} <span className="text-[var(--primary)]">{pp("tiersAnnualSave")}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-auto mb-6 max-w-2xl space-y-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-200">
          <p>{error}</p>
          <p className="text-xs opacity-90">
            {pp("checkoutFallbackLead")}{" "}
            <Link href="/chat" className="font-medium underline underline-offset-2">
              {pp("checkoutFallbackChat")}
            </Link>
            {" · "}
            <Link href="/faq" className="font-medium underline underline-offset-2">
              {pp("checkoutFallbackFaq")}
            </Link>
          </p>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="relative flex h-full flex-col rounded-[1.75rem] border border-[var(--border)] bg-[var(--card)]/90 p-6 sm:p-8 shadow-paper backdrop-blur-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted-foreground)]">{pp("free.tagline")}</p>
            <h2 className="mt-2 font-editorial text-2xl text-[var(--foreground)] sm:text-3xl">{pp("free.tierName")}</h2>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">{pp("free.description")}</p>
            <p className="mt-6 flex items-baseline gap-1">
              <span className="text-4xl font-bold text-[var(--foreground)]">{pp("free.price")}</span>
              <span className="text-sm text-[var(--muted-foreground)]">/ {pp("free.cadence")}</span>
            </p>
            <ul className="mt-6 space-y-3 text-sm text-[var(--foreground)]">
              {freeFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-[var(--primary)] flex-shrink-0 mt-0.5" aria-hidden />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            {pp("free.footnote") ? (
              <p className="mt-4 text-xs text-[var(--muted-foreground)]">{pp("free.footnote")}</p>
            ) : null}
            <Button asChild variant="outline" className="mt-8 w-full justify-between">
              <Link href={pp("free.ctaHref")}>
                {pp("free.ctaLabel")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:col-span-8">
          <PaidTierCard
            tierId="pro"
            cadence={cadence}
            loading={loadingTier === "pro"}
            onCheckout={() => checkout("pro")}
            features={proFeatures}
          />
          <PaidTierCard
            tierId="plus"
            cadence={cadence}
            loading={loadingTier === "plus"}
            onCheckout={() => checkout("plus")}
            features={plusFeatures}
          />
        </div>
      </div>
    </div>
  );
}

function PaidTierCard({
  tierId,
  cadence,
  loading,
  onCheckout,
  features,
}: {
  tierId: "pro" | "plus";
  cadence: BillingCadence;
  loading: boolean;
  onCheckout: () => void;
  features: string[];
}) {
  const pp = useTranslations("pricingPage");
  const prefix = tierId;
  const isAnnual = cadence === "annual";
  const price = isAnnual ? pp(`${prefix}.annualPrice`) : pp(`${prefix}.monthlyPrice`);
  const cadenceLabel = isAnnual ? pp(`${prefix}.annualCadence`) : pp(`${prefix}.monthlyCadence`);
  const highlight = tierId === "pro";

  return (
    <div
      className={`relative flex h-full flex-col rounded-[1.75rem] border bg-[var(--card)]/95 p-6 sm:p-8 shadow-paper backdrop-blur-sm ${
        highlight
          ? "border-[var(--primary)]/50 ring-1 ring-[var(--primary)]/15 lg:scale-[1.02]"
          : "border-[var(--border)]"
      }`}
    >
      {highlight && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-[var(--primary)] px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--primary-foreground)]">
          <Star className="h-3 w-3" aria-hidden /> {pp("mostChosen")}
        </span>
      )}
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted-foreground)]">{pp(`${prefix}.tagline`)}</p>
      <h2 className="mt-2 font-editorial text-2xl text-[var(--foreground)] sm:text-3xl">{pp(`${prefix}.tierName`)}</h2>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">{pp(`${prefix}.description`)}</p>
      <p className="mt-6 flex items-baseline gap-1">
        <span className="text-4xl font-bold text-[var(--foreground)]">{price}</span>
        <span className="text-sm text-[var(--muted-foreground)]">/ {cadenceLabel}</span>
      </p>
      {isAnnual && (
        <p className="mt-1 text-xs text-[var(--primary)] font-medium">
          {pp(`${prefix}.annualPerMonth`)} \u00b7 {pp(`${prefix}.annualSavings`)}
        </p>
      )}
      <ul className="mt-6 space-y-3 text-sm text-[var(--foreground)]">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <Check className="h-4 w-4 text-[var(--primary)] flex-shrink-0 mt-0.5" aria-hidden />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      {pp(`${prefix}.footnote`) ? (
        <p className="mt-4 text-xs text-[var(--muted-foreground)]">{pp(`${prefix}.footnote`)}</p>
      ) : null}
      <Button
        onClick={onCheckout}
        disabled={loading}
        className="mt-8 w-full justify-between"
        variant={highlight ? "default" : "outline"}
      >
        {loading ? pp("startingCheckout") : pp("subscribeTo", { tier: pp(`${prefix}.tagline`) })}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
