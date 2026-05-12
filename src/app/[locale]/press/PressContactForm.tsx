"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function PressContactForm() {
  const t = useTranslations("pressPage");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/press-contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setError(t("contactFormError"));
        return;
      }
      setDone(true);
    } catch {
      setError(t("contactFormError"));
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return <p className="text-sm text-emerald-600 dark:text-emerald-400">{t("contactFormSuccess")}</p>;
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="space-y-3 max-w-md">
      <label className="block text-xs space-y-1">
        <span>{t("contactFormName")}</span>
        <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-[var(--border)] bg-background px-3 py-2 text-sm" />
      </label>
      <label className="block text-xs space-y-1">
        <span>{t("contactFormEmail")}</span>
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-[var(--border)] bg-background px-3 py-2 text-sm" />
      </label>
      <label className="block text-xs space-y-1">
        <span>{t("contactFormMessage")}</span>
        <textarea required rows={4} value={message} onChange={(e) => setMessage(e.target.value)} className="w-full rounded-lg border border-[var(--border)] bg-background px-3 py-2 text-sm" />
      </label>
      {error ? (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={submitting} className="gap-2">
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            {t("contactFormSubmitting")}
          </>
        ) : (
          t("contactFormSubmit")
        )}
      </Button>
    </form>
  );
}
