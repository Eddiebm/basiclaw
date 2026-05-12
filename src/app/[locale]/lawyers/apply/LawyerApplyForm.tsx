"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAnnouncer } from "@/components/a11y/AnnouncerProvider";
import { COUNTRIES } from "@/data/countries";
import { track } from "@/lib/analytics";

export function LawyerApplyForm({ defaultCountry }: { defaultCountry?: string }) {
  const t = useTranslations("lawyersApplyPage");
  const announce = useAnnouncer();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [barNumber, setBarNumber] = useState("");
  const [country, setCountry] = useState(defaultCountry?.toUpperCase() ?? "");
  const [practiceAreas, setPracticeAreas] = useState("");
  const [sampleStatement, setSampleStatement] = useState("");
  const [headshotUrl, setHeadshotUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    try {
      const res = await fetch("/api/lawyer-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          barNumber,
          country,
          practiceAreas,
          sampleStatement,
          headshotUrl,
        }),
      });
      if (!res.ok) throw new Error("fail");
      track("lawyer_application_submitted", { country });
      track("form_submit_success", { form: "lawyer_application" });
      announce(t("success"));
      setStatus("done");
    } catch {
      setStatus("error");
      track("form_submit_error", { form: "lawyer_application", reason: "request_failed" });
      announce(t("error"));
    }
  }

  if (status === "done") {
    return <p className="text-sm text-[var(--muted-foreground)]">{t("success")}</p>;
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="space-y-4 max-w-xl">
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="la-name">
          {t("name")}
        </label>
        <input
          id="la-name"
          className="w-full rounded-lg border border-[var(--border)] bg-background px-3 py-2 text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="la-email">
          {t("email")}
        </label>
        <input
          id="la-email"
          type="email"
          className="w-full rounded-lg border border-[var(--border)] bg-background px-3 py-2 text-sm"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="la-bar">
          {t("barNumber")}
        </label>
        <input
          id="la-bar"
          className="w-full rounded-lg border border-[var(--border)] bg-background px-3 py-2 text-sm"
          value={barNumber}
          onChange={(e) => setBarNumber(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="la-country">
          {t("country")}
        </label>
        <select
          id="la-country"
          className="w-full rounded-lg border border-[var(--border)] bg-background px-3 py-2 text-sm"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          required
        >
          <option value="">{t("countryPlaceholder")}</option>
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code.toUpperCase()}>
              {c.flag} {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="la-areas">
          {t("practiceAreas")}
        </label>
        <textarea
          id="la-areas"
          className="w-full rounded-lg border border-[var(--border)] bg-background px-3 py-2 text-sm min-h-[80px]"
          value={practiceAreas}
          onChange={(e) => setPracticeAreas(e.target.value)}
          placeholder={t("practiceAreasHint")}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="la-statement">
          {t("sampleStatement")}
        </label>
        <textarea
          id="la-statement"
          className="w-full rounded-lg border border-[var(--border)] bg-background px-3 py-2 text-sm min-h-[120px]"
          value={sampleStatement}
          onChange={(e) => setSampleStatement(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="la-photo">
          {t("headshotUrl")}
        </label>
        <input
          id="la-photo"
          type="url"
          className="w-full rounded-lg border border-[var(--border)] bg-background px-3 py-2 text-sm"
          value={headshotUrl}
          onChange={(e) => setHeadshotUrl(e.target.value)}
          placeholder="https://"
        />
      </div>
      {status === "error" && <p className="text-sm text-red-600">{t("error")}</p>}
      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
        {status === "loading" ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
