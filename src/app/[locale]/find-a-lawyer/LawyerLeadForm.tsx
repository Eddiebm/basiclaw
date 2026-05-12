"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, Loader2, Scale } from "lucide-react";
import { COUNTRIES } from "@/data/countries";
import { Button } from "@/components/ui/Button";
import { track } from "@/lib/analytics";

export function LawyerLeadForm({ prefCountry }: { prefCountry?: string }) {
  const t = useTranslations("lawyerPage");
  const tf = useTranslations("lawyerPage.fields");
  const sortedCountries = useMemo(
    () => COUNTRIES.slice().sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [barNumber, setBarNumber] = useState("");
  const [country, setCountry] = useState(prefCountry?.toUpperCase() ?? "");
  const [practiceAreas, setPracticeAreas] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/lawyer-leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, barNumber, country, practiceAreas }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Request failed");
        return;
      }
      track("form_submit_success", { form: "lawyer_lead", country });
      setDone(true);
      setName("");
      setEmail("");
      setBarNumber("");
      setPracticeAreas("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8 shadow-sm space-y-6">
      <div role="note" className="flex gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-950 dark:text-amber-200">
        <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" aria-hidden />
        <div>
          <p className="font-semibold">{t("disclaimer_title")}</p>
          <p className="mt-1 opacity-90">{t("disclaimer_body")}</p>
        </div>
      </div>

      <div className="flex gap-3 items-start">
        <Scale className="h-6 w-6 text-[var(--primary)] shrink-0 mt-1" aria-hidden />
        <div>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">{t("form_title")}</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">{t("form_hint")}</p>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">{t("jurisdiction_note")}</p>
        </div>
      </div>

      {done ? (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">{tf("success")}</p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-[var(--muted-foreground)]">{tf("name")}</span>
              <input
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-[var(--muted-foreground)]">{tf("email")}</span>
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </label>
          </div>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[var(--muted-foreground)]">{tf("barNumber")}</span>
            <input
              value={barNumber}
              onChange={(event) => setBarNumber(event.target.value)}
              className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[var(--muted-foreground)]">{tf("country")}</span>
            <select
              required
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="">{tf("countrySelectPlaceholder")}</option>
              {sortedCountries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[var(--muted-foreground)]">{tf("practiceAreas")}</span>
            <textarea
              required
              rows={3}
              placeholder={tf("practiceAreasPlaceholder")}
              value={practiceAreas}
              onChange={(event) => setPracticeAreas(event.target.value)}
              className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </label>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" disabled={submitting} className="gap-2">
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                {tf("submitting")}
              </>
            ) : (
              tf("submit")
            )}
          </Button>
        </form>
      )}
    </div>
  );
}
