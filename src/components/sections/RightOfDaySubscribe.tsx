"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export function RightOfDaySubscribe() {
  const t = useTranslations("hero");
  const [email, setEmail] = useState("");
  const [jurisdiction, setJurisdiction] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email) return;
    setStatus("submitting");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, jurisdiction }),
      });
      if (!res.ok) throw new Error("subscribe-failed");
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-left shadow-sm"
    >
      <p className="text-sm font-semibold text-[var(--foreground)]">{t("newsletterTitle")}</p>
      <p className="mt-1 text-xs text-[var(--muted-foreground)]">{t("newsletterSubtitle")}</p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("newsletterPlaceholder")}
          aria-label={t("newsletterPlaceholder")}
          className="flex-1 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
        />
        <input
          type="text"
          value={jurisdiction}
          onChange={(e) => setJurisdiction(e.target.value)}
          placeholder={t("newsletterJurisdiction")}
          aria-label={t("newsletterJurisdiction")}
          className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm sm:w-40"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-60"
        >
          {t("newsletterSubmit")}
        </button>
      </div>
      {status === "success" && (
        <p className="mt-2 text-xs text-emerald-600">{t("newsletterSuccess")}</p>
      )}
      {status === "error" && (
        <p className="mt-2 text-xs text-red-600">{t("newsletterError")}</p>
      )}
    </form>
  );
}
