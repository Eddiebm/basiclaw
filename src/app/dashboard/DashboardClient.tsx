"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowRight, CheckCircle2, ExternalLink, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function DashboardClient() {
  const params = useSearchParams();
  const checkout = params.get("checkout");
  const sessionId = params.get("session_id");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openPortal() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/portal", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const json = (await res.json()) as { url?: string; message?: string };
      if (json.url) {
        window.location.href = json.url;
        return;
      }
      setError(json.message ?? "Could not open the customer portal.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-8 space-y-4">
      {checkout === "success" && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-900 dark:text-emerald-200 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 mt-0.5" aria-hidden />
          <div>
            <p className="font-semibold">Subscription started \u2014 thank you.</p>
            <p className="mt-1 opacity-90">A receipt is on its way to your inbox.</p>
          </div>
        </div>
      )}
      {checkout === "cancelled" && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-sm text-[var(--muted-foreground)] flex items-start gap-3">
          <XCircle className="h-5 w-5 mt-0.5" aria-hidden />
          <p>Checkout was cancelled. No charge was made.</p>
        </div>
      )}

      <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Manage subscription</h2>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Update payment method, change plan, or cancel anytime through the secure Stripe customer portal.
        </p>
        <Button onClick={openPortal} disabled={loading} className="mt-4 gap-2">
          {loading ? "Opening\u2026" : "Open customer portal"}
          <ExternalLink className="h-4 w-4" />
        </Button>
        {error && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        {!sessionId && checkout !== "success" && (
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            Tip: open this page right after subscribing and we can route you straight to your portal.
            For now, contact <a className="underline" href="mailto:hello@basiclaw.app">hello@basiclaw.app</a> if you need help.
          </p>
        )}
      </div>

      <div className="rounded-3xl border border-dashed border-[var(--border)] p-6 sm:p-8">
        <h3 className="font-semibold text-[var(--foreground)]">What&apos;s coming next</h3>
        <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
          <li className="flex items-start gap-2"><ArrowRight className="h-4 w-4 mt-0.5 text-[var(--primary)]" aria-hidden /> Saved chats and audit history tied to your account</li>
          <li className="flex items-start gap-2"><ArrowRight className="h-4 w-4 mt-0.5 text-[var(--primary)]" aria-hidden /> Bulk document upload for Pro+</li>
          <li className="flex items-start gap-2"><ArrowRight className="h-4 w-4 mt-0.5 text-[var(--primary)]" aria-hidden /> Team workspaces for newsrooms and advocacy orgs</li>
        </ul>
      </div>
    </div>
  );
}
