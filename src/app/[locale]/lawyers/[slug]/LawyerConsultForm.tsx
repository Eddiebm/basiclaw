"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function LawyerConsultForm({ slug }: { slug: string }) {
  const t = useTranslations("lawyerDetail.consultForm");
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
      const res = await fetch(`/api/lawyer-leads/${encodeURIComponent(slug)}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setError(json.error === "not_found" ? t("error") : json.error ?? t("error"));
        return;
      }
      setDone(true);
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setError(t("error"));
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return <p className="text-sm text-emerald-600 dark:text-emerald-400">{t("success")}</p>;
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--card)]/60 p-4">
      <p className="text-sm font-medium text-[var(--foreground)]">{t("title")}</p>
      <p className="text-xs text-[var(--muted-foreground)]">{t("hint")}</p>
      <label className="block text-xs space-y-1">
        <span className="text-[var(--muted-foreground)]">{t("name")}</span>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-[var(--border)] bg-background px-3 py-2 text-sm"
        />
      </label>
      <label className="block text-xs space-y-1">
        <span className="text-[var(--muted-foreground)]">{t("email")}</span>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-[var(--border)] bg-background px-3 py-2 text-sm"
        />
      </label>
      <label className="block text-xs space-y-1">
        <span className="text-[var(--muted-foreground)]">{t("message")}</span>
        <textarea
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-lg border border-[var(--border)] bg-background px-3 py-2 text-sm"
        />
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
            {t("submitting")}
          </>
        ) : (
          t("submit")
        )}
      </Button>
    </form>
  );
}
