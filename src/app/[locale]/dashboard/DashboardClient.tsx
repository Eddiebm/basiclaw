"use client";

import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, BarChart3, CheckCircle2, ExternalLink, Loader2, MessageSquare, Pencil, Trash2, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { track } from "@/lib/analytics";
import type { BillingPlan } from "@/lib/entitlements";
import type { PlanLimits } from "@/lib/limits";
import type { StoredChat, UsageSnapshot } from "@/lib/storage";

export type DashboardAuditRow = {
  id: string;
  title: string;
  auditType: string;
  jurisdiction: string;
  updatedAt: string;
  shareHref: string;
};

function formatLimit(n: number | null): string {
  return n == null ? "∞" : String(n);
}

function planLabel(plan: BillingPlan, t: (k: string) => string): string {
  if (plan === "pro_plus") return t("planProPlus");
  if (plan === "pro") return t("planPro");
  return t("planFree");
}

export function DashboardClient({
  initialChats,
  initialAudits,
  usageSnapshot,
}: {
  initialChats: StoredChat[];
  initialAudits: DashboardAuditRow[];
  usageSnapshot: { plan: BillingPlan; usage: UsageSnapshot; limits: PlanLimits };
}) {
  const t = useTranslations("dashboardPage");
  const locale = useLocale();
  const params = useSearchParams();
  const checkout = params.get("checkout");
  const sessionId = params.get("session_id");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chats, setChats] = useState(initialChats);
  const [audits, setAudits] = useState(initialAudits);
  const [usageState, setUsageState] = useState(usageSnapshot);

  useEffect(() => {
    if (checkout === "success") {
      track("checkout_completed", { session_id: sessionId ?? null });
    }
  }, [checkout, sessionId]);

  const refreshChats = useCallback(async () => {
    const res = await fetch("/api/me/chats");
    if (!res.ok) return;
    const json = (await res.json()) as { chats?: StoredChat[] };
    if (json.chats) setChats(json.chats);
  }, []);

  const refreshAudits = useCallback(async () => {
    const res = await fetch(`/api/me/audits?locale=${encodeURIComponent(locale)}`);
    if (!res.ok) return;
    const json = (await res.json()) as { audits?: DashboardAuditRow[] };
    if (json.audits) setAudits(json.audits);
  }, [locale]);

  const refreshUsage = useCallback(async () => {
    const res = await fetch("/api/me/usage");
    if (!res.ok) return;
    const json = (await res.json()) as typeof usageSnapshot;
    if (json.plan && json.usage && json.limits) {
      setUsageState({ plan: json.plan, usage: json.usage, limits: json.limits });
    }
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void refreshUsage();
    }, 0);
    return () => window.clearTimeout(id);
  }, [refreshUsage]);

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
        track("form_submit_success", { form: "stripe_portal" });
        window.location.href = json.url;
        return;
      }
      setError(json.message ?? t("portalErrorFallback"));
      track("form_submit_error", { form: "stripe_portal", reason: "no_url" });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("portalNetworkError"));
      track("form_submit_error", { form: "stripe_portal", reason: "exception" });
    } finally {
      setLoading(false);
    }
  }

  async function removeChat(id: string) {
    const res = await fetch(`/api/me/chats/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (res.ok) void refreshChats();
  }

  async function renameChat(id: string, title: string) {
    const res = await fetch(`/api/me/chats/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (res.ok) void refreshChats();
  }

  async function removeAudit(id: string) {
    const res = await fetch(`/api/me/audits/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (res.ok) void refreshAudits();
  }

  const emptyChats = useMemo(() => chats.length === 0, [chats.length]);
  const { plan, usage, limits } = usageState;

  return (
    <div className="mt-8 space-y-8">
      {checkout === "success" && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-900 dark:text-emerald-200 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 mt-0.5" aria-hidden />
          <div>
            <p className="font-semibold">{t("checkoutSuccessTitle")}</p>
            <p className="mt-1 opacity-90">{t("checkoutSuccessBody")}</p>
          </div>
        </div>
      )}
      {checkout === "cancelled" && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-sm text-[var(--muted-foreground)] flex items-start gap-3">
          <XCircle className="h-5 w-5 mt-0.5" aria-hidden />
          <p>{t("checkoutCancelled")}</p>
        </div>
      )}

      <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-[var(--foreground)] flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-[var(--primary)]" aria-hidden />
          {t("savedChatsTitle")}
        </h2>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">{t("savedChatsSubtitle")}</p>
        {emptyChats ? (
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">{t("savedChatsEmpty")}</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {chats.map((c) => (
              <li
                key={c.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border border-[var(--border)]/70 bg-[var(--background)] px-3 py-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-[var(--foreground)] truncate">{c.title}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {c.jurisdiction.toUpperCase()}
                    {c.state ? ` · ${c.state}` : ""} · {new Date(c.updatedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/chat?session=${encodeURIComponent(c.id)}`}>{t("openChat")}</Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const title = window.prompt(t("renamePrompt"), c.title);
                      if (title && title.trim()) void renameChat(c.id, title.trim());
                    }}
                    aria-label={t("renameAria")}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => void removeChat(c.id)} aria-label={t("deleteAria")}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">{t("savedAuditsTitle")}</h2>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">{t("savedAuditsSubtitle")}</p>
        {audits.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">{t("savedAuditsEmpty")}</p>
        ) : (
          <ul className="mt-4 space-y-3 text-sm text-[var(--foreground)]">
            {audits.map((a) => (
              <li
                key={a.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border border-[var(--border)]/70 bg-[var(--background)] px-3 py-3"
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">{a.title}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {a.auditType} · {a.jurisdiction.toUpperCase()} · {new Date(a.updatedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button asChild size="sm" variant="outline">
                    <a href={a.shareHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1">
                      {t("openSharedAudit")}
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                    </a>
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => void removeAudit(a.id)} aria-label={t("deleteAuditAria")}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-[var(--foreground)] flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-[var(--primary)]" aria-hidden />
          {t("usageTitle")}
        </h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
          <div className="rounded-xl border border-[var(--border)]/70 bg-[var(--background)] px-3 py-2">
            <dt className="text-[var(--muted-foreground)]">{t("usagePlan")}</dt>
            <dd className="font-semibold text-[var(--foreground)]">{planLabel(plan, t)}</dd>
          </div>
          <div className="rounded-xl border border-[var(--border)]/70 bg-[var(--background)] px-3 py-2">
            <dt className="text-[var(--muted-foreground)]">{t("usageChatsToday")}</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {usage.chatsToday} / {formatLimit(limits.chatsPerDay)}
            </dd>
          </div>
          <div className="rounded-xl border border-[var(--border)]/70 bg-[var(--background)] px-3 py-2">
            <dt className="text-[var(--muted-foreground)]">{t("usageAuditsMonth")}</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {usage.auditsThisMonth} / {formatLimit(limits.auditsPerMonth)}
            </dd>
          </div>
          <div className="rounded-xl border border-[var(--border)]/70 bg-[var(--background)] px-3 py-2">
            <dt className="text-[var(--muted-foreground)]">{t("usageDemandLettersToday")}</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {usage.demandLettersToday} / {formatLimit(limits.demandLettersPerDay)}
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">{t("subscriptionTitle")}</h2>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">{t("subscriptionBody")}</p>
        <Button onClick={() => void openPortal()} disabled={loading} className="mt-4 gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <ExternalLink className="h-4 w-4" aria-hidden />}
          {loading ? t("openingPortal") : t("openPortal")}
        </Button>
        {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
        {!sessionId && checkout !== "success" && (
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">{t("portalTip")}</p>
        )}
      </div>

      <div className="rounded-3xl border border-dashed border-[var(--border)] p-6 sm:p-8">
        <h3 className="font-semibold text-[var(--foreground)]">{t("comingTitle")}</h3>
        <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
          <li className="flex items-start gap-2">
            <ArrowRight className="h-4 w-4 mt-0.5 text-[var(--primary)]" aria-hidden />
            {t("coming1")}
          </li>
          <li className="flex items-start gap-2">
            <ArrowRight className="h-4 w-4 mt-0.5 text-[var(--primary)]" aria-hidden />
            {t("coming2")}
          </li>
        </ul>
      </div>
    </div>
  );
}
