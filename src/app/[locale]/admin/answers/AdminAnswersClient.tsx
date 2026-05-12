"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Navigation } from "@/components/sections/Navigation";
import { Footer } from "@/components/sections/Footer";
import { Button } from "@/components/ui/Button";
import { VERIFIED_LAWYERS } from "@/data/verified-lawyers";
import { COUNTRIES } from "@/data/countries";

export type AdminAnswerRow = {
  id: string;
  question: string;
  answer: string;
  jurisdiction: string;
  locale: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  upvotes: number;
  downvotes: number;
  verifiedBy: string | null;
  verificationNote: string | null;
  userId: string | null;
};

export function AdminAnswersClient({
  clerkMissing,
  initialAnswers,
}: {
  clerkMissing: boolean;
  initialAnswers: AdminAnswerRow[];
}) {
  const t = useTranslations("adminAnswersPage");
  const [answers, setAnswers] = useState<AdminAnswerRow[]>(initialAnswers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jurisdiction, setJurisdiction] = useState("");
  const [verified, setVerified] = useState<"all" | "yes" | "no">("all");
  const [minVotes, setMinVotes] = useState("");
  const [sort, setSort] = useState<"recent" | "votes">("recent");
  const [openId, setOpenId] = useState<string | null>(null);
  const [lawyerId, setLawyerId] = useState(VERIFIED_LAWYERS[0]?.id ?? "");
  const [statement, setStatement] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const countryCodes = useMemo(
    () => [...new Set(COUNTRIES.map((c) => c.code.toLowerCase()))].sort(),
    []
  );

  const refresh = useCallback(async () => {
    if (clerkMissing) return;
    setLoading(true);
    setError(null);
    try {
      const q = new URLSearchParams();
      if (jurisdiction.trim()) q.set("jurisdiction", jurisdiction.trim().toLowerCase());
      if (verified !== "all") q.set("verified", verified);
      const mv = Number.parseInt(minVotes, 10);
      if (!Number.isNaN(mv) && mv > 0) q.set("minVotes", String(mv));
      q.set("sort", sort);
      q.set("pageSize", "50");
      const res = await fetch(`/api/admin/answers?${q.toString()}`);
      if (res.status === 404) {
        setError(t("notAuthorized"));
        setAnswers([]);
        return;
      }
      if (!res.ok) {
        setError(t("loadFailed"));
        return;
      }
      const data = (await res.json()) as { answers: AdminAnswerRow[] };
      setAnswers(data.answers);
    } catch {
      setError(t("loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [clerkMissing, jurisdiction, verified, minVotes, sort, t]);

  async function postVerify(id: string) {
    if (!lawyerId.trim()) return;
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/answers/${id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lawyerId: lawyerId.trim(), statement: statement.trim() || undefined }),
      });
      if (!res.ok) {
        setError(t("actionFailed"));
        return;
      }
      setStatement("");
      await refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function postUnpublish(id: string) {
    if (!window.confirm(t("confirmUnpublish"))) return;
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/answers/${id}/unpublish`, { method: "POST" });
      if (!res.ok) {
        setError(t("actionFailed"));
        return;
      }
      await refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function postDelete(id: string) {
    if (!window.confirm(t("confirmDelete"))) return;
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/answers/${id}/delete`, { method: "POST" });
      if (!res.ok) {
        setError(t("actionFailed"));
        return;
      }
      await refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="min-h-screen">
      <Navigation />
      <div className="mx-auto max-w-5xl px-4 py-28 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)]">{t("title")}</h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">{t("subtitle")}</p>

        {clerkMissing ? (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-950 dark:text-amber-100"
          >
            {t("clerkMissingBanner")}
          </div>
        ) : null}

        {!clerkMissing && (
          <>
            <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:flex-row sm:flex-wrap sm:items-end">
              <label className="block text-sm">
                <span className="text-[var(--muted-foreground)]">{t("filterJurisdiction")}</span>
                <select
                  className="mt-1 block w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-sm"
                  value={jurisdiction}
                  onChange={(e) => setJurisdiction(e.target.value)}
                >
                  <option value="">{t("filterAny")}</option>
                  {countryCodes.map((c) => (
                    <option key={c} value={c}>
                      {c.toUpperCase()}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                <span className="text-[var(--muted-foreground)]">{t("filterVerified")}</span>
                <select
                  className="mt-1 block w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-sm"
                  value={verified}
                  onChange={(e) => setVerified(e.target.value as "all" | "yes" | "no")}
                >
                  <option value="all">{t("verifiedAll")}</option>
                  <option value="yes">{t("verifiedYes")}</option>
                  <option value="no">{t("verifiedNo")}</option>
                </select>
              </label>
              <label className="block text-sm">
                <span className="text-[var(--muted-foreground)]">{t("filterMinVotes")}</span>
                <input
                  type="number"
                  min={0}
                  className="mt-1 block w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-sm"
                  value={minVotes}
                  onChange={(e) => setMinVotes(e.target.value)}
                  placeholder="0"
                />
              </label>
              <label className="block text-sm">
                <span className="text-[var(--muted-foreground)]">{t("filterSort")}</span>
                <select
                  className="mt-1 block w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-sm"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as "recent" | "votes")}
                >
                  <option value="recent">{t("sortRecent")}</option>
                  <option value="votes">{t("sortVotes")}</option>
                </select>
              </label>
              <Button type="button" onClick={() => void refresh()} disabled={loading}>
                {loading ? t("applying") : t("applyFilters")}
              </Button>
            </div>

            {error ? (
              <p className="mt-4 text-sm text-red-600 dark:text-red-400" role="alert">
                {error}
              </p>
            ) : null}

            <ul className="mt-8 space-y-4">
              {answers.map((a) => {
                const open = openId === a.id;
                const net = a.upvotes - a.downvotes;
                return (
                  <li key={a.id} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {a.jurisdiction.toUpperCase()} · {a.id.slice(0, 8)}… · ↑{a.upvotes} ↓{a.downvotes} (net{" "}
                          {net})
                        </p>
                        <p className="mt-1 font-medium text-[var(--foreground)] line-clamp-2">{a.question}</p>
                        {a.verifiedBy ? (
                          <p className="mt-1 text-xs text-[var(--primary)]">
                            {t("verifiedLabel", { id: a.verifiedBy })}
                            {a.verificationNote ? ` — ${a.verificationNote}` : ""}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => setOpenId(open ? null : a.id)}>
                          {open ? t("close") : t("open")}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={busyId === a.id || !a.isPublic}
                          onClick={() => void postUnpublish(a.id)}
                        >
                          {t("unpublish")}
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          disabled={busyId === a.id}
                          onClick={() => void postDelete(a.id)}
                        >
                          {t("delete")}
                        </Button>
                      </div>
                    </div>
                    {open ? (
                      <div className="mt-4 space-y-4 border-t border-[var(--border)] pt-4">
                        <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-[var(--muted)]/40 p-3 text-xs text-[var(--foreground)]">
                          {a.answer}
                        </pre>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <label className="block text-sm">
                            <span className="text-[var(--muted-foreground)]">{t("lawyerPick")}</span>
                            <select
                              className="mt-1 block w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-sm"
                              value={lawyerId}
                              onChange={(e) => setLawyerId(e.target.value)}
                            >
                              {VERIFIED_LAWYERS.length === 0 ? (
                                <option value="">{t("noLawyers")}</option>
                              ) : (
                                VERIFIED_LAWYERS.map((l) => (
                                  <option key={l.id} value={l.id}>
                                    {l.name} ({l.jurisdiction})
                                  </option>
                                ))
                              )}
                            </select>
                          </label>
                          <label className="block text-sm sm:col-span-2">
                            <span className="text-[var(--muted-foreground)]">{t("statementOptional")}</span>
                            <textarea
                              className="mt-1 block w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-sm"
                              rows={2}
                              value={statement}
                              onChange={(e) => setStatement(e.target.value)}
                            />
                          </label>
                        </div>
                        <Button type="button" disabled={busyId === a.id || !lawyerId} onClick={() => void postVerify(a.id)}>
                          {busyId === a.id ? t("working") : t("verify")}
                        </Button>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
            {answers.length === 0 && !loading ? (
              <p className="mt-6 text-sm text-[var(--muted-foreground)]">{t("empty")}</p>
            ) : null}
          </>
        )}
      </div>
      <Footer />
    </main>
  );
}
