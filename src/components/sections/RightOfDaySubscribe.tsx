"use client";

import { Suspense, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useAnnouncer } from "@/components/a11y/AnnouncerProvider";
import { track } from "@/lib/analytics";
import { getPopularCountries } from "@/lib/jurisdictions";

function RightOfDaySubscribeInner() {
  const t = useTranslations("hero");
  const locale = useLocale();
  const announce = useAnnouncer();
  const searchParams = useSearchParams();
  const popular = useMemo(() => getPopularCountries(16), []);
  const countryFromQuery = (searchParams.get("country") ?? "").toLowerCase();

  const jurisdictionFromQuery = useMemo(() => {
    if (countryFromQuery && popular.some((c) => c.code.toLowerCase() === countryFromQuery)) {
      return countryFromQuery;
    }
    return null;
  }, [countryFromQuery, popular]);

  const [email, setEmail] = useState("");
  const [pickedJurisdiction, setPickedJurisdiction] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const jurisdiction = jurisdictionFromQuery ?? pickedJurisdiction ?? "us";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim() || status === "submitting") return;
    setStatus("submitting");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          jurisdiction: jurisdiction || "us",
          locale,
        }),
      });
      if (!res.ok) throw new Error("subscribe-failed");
      setStatus("success");
      setEmail("");
      track("form_submit_success", { form: "newsletter" });
      announce(t("newsletterSuccess"));
    } catch {
      setStatus("error");
      track("form_submit_error", { form: "newsletter", reason: "request_failed" });
      announce(t("newsletterError"));
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-6 rounded-2xl border border-[var(--border)]/80 bg-[var(--surface-glass)] p-4 text-left shadow-paper backdrop-blur-sm"
    >
      <p className="text-sm font-semibold text-[var(--foreground)]">{t("newsletterTitle")}</p>
      <p className="mt-1 text-xs text-[var(--muted-foreground)]">{t("newsletterSubtitle")}</p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("newsletterPlaceholder")}
          aria-label={t("newsletterPlaceholder")}
          className="flex-1 min-w-[12rem] rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
        />
        <label className="sr-only" htmlFor="rod-jurisdiction">
          {t("newsletterJurisdiction")}
        </label>
        <select
          id="rod-jurisdiction"
          value={jurisdiction}
          onChange={(e) => setPickedJurisdiction(e.target.value)}
          className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm sm:w-48"
          aria-label={t("newsletterJurisdiction")}
        >
          {popular.map((c) => (
            <option key={c.code} value={c.code.toLowerCase()}>
              {c.flag} {c.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-60"
        >
          {status === "submitting" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
          {t("newsletterSubmit")}
        </button>
      </div>
      {status === "success" && <p className="mt-2 text-xs text-emerald-600">{t("newsletterSuccess")}</p>}
      {status === "error" && <p className="mt-2 text-xs text-red-600">{t("newsletterError")}</p>}
    </form>
  );
}

export function RightOfDaySubscribe() {
  return (
    <Suspense
      fallback={
        <div
          className="mt-6 h-24 animate-pulse rounded-2xl border border-[var(--border)]/60 bg-[var(--surface-glass)]/50"
          aria-hidden
        />
      }
    >
      <RightOfDaySubscribeInner />
    </Suspense>
  );
}
