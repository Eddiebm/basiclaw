"use client";

import { useCallback, useEffect, useState } from "react";
import { Globe, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { track } from "@/lib/analytics";
import { stripPIIForPublish } from "@/lib/answer-pii";
import { PublishConfirmModal } from "@/components/answers/PublishConfirmModal";

type Row = {
  id: string;
  question: string;
  answer: string;
  jurisdiction: string;
  locale: string;
  isPublic: boolean;
  upvotes: number;
  downvotes: number;
  updatedAt: string;
};

export function DashboardSavedAnswers() {
  const tAns = useTranslations("answers.dashboard");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [publishRow, setPublishRow] = useState<Row | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/me/answers");
    if (!res.ok) {
      setRows([]);
      return;
    }
    const j = (await res.json()) as { answers?: Row[] };
    setRows(Array.isArray(j.answers) ? j.answers : []);
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => refresh());
  }, [refresh]);

  async function remove(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/answers/${encodeURIComponent(id)}`, { method: "DELETE" });
      if (res.ok) void refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function togglePublish(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/answers/${encodeURIComponent(id)}/publish`, { method: "POST" });
      if (res.ok) {
        const j = (await res.json()) as { isPublic?: boolean };
        track("answer_publish_toggled", { to: j.isPublic ? "public" : "private", answer_id: id });
        void refresh();
      }
    } finally {
      setBusyId(null);
    }
  }

  if (rows === null) {
    return (
      <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        {tAns("loading")}
      </div>
    );
  }

  if (rows.length === 0) {
    return <p className="mt-4 text-sm text-[var(--muted-foreground)]">{tAns("empty")}</p>;
  }

  return (
    <>
      <ul className="mt-4 space-y-3">
        {rows.map((r) => (
          <li
            key={r.id}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border border-[var(--border)]/70 bg-[var(--background)] px-3 py-3"
          >
            <div className="min-w-0">
              <p className="font-medium text-[var(--foreground)] truncate">{r.question}</p>
              <p className="text-xs text-[var(--muted-foreground)]">
                {r.jurisdiction.toUpperCase()} · {tAns("votes", { up: r.upvotes, down: r.downvotes })} · {new Date(r.updatedAt).toLocaleString()}
              </p>
              <p className="mt-1 text-[11px]">
                {r.isPublic ? (
                  <span className="rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 px-2 py-0.5">{tAns("publicBadge")}</span>
                ) : (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground">{tAns("privateBadge")}</span>
                )}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Button asChild size="sm" variant="outline">
                <Link href={`/answers/${encodeURIComponent(r.id)}`}>
                  <ExternalLink className="h-3.5 w-3.5 mr-1" aria-hidden />
                  {tAns("open")}
                </Link>
              </Button>
              {r.isPublic ? (
                <Button size="sm" variant="ghost" disabled={busyId === r.id} onClick={() => void togglePublish(r.id)}>
                  {tAns("unpublish")}
                </Button>
              ) : (
                <Button size="sm" variant="ghost" disabled={busyId === r.id} onClick={() => setPublishRow(r)}>
                  <Globe className="h-3.5 w-3.5 mr-1" aria-hidden />
                  {tAns("publish")}
                </Button>
              )}
              <Button size="sm" variant="ghost" disabled={busyId === r.id} onClick={() => void remove(r.id)} aria-label={tAns("deleteAnswerAria")}>
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
      {publishRow ? (
        <PublishConfirmModal
          previewQuestion={stripPIIForPublish(publishRow.question)}
          previewAnswerSnippet={publishRow.answer.slice(0, 400)}
          onClose={() => setPublishRow(null)}
          onConfirm={async () => {
            if (!publishRow) return;
            setBusyId(publishRow.id);
            try {
              const res = await fetch(`/api/answers/${encodeURIComponent(publishRow.id)}/publish`, { method: "POST" });
              if (res.ok) {
                track("answer_publish_toggled", { to: "public", answer_id: publishRow.id });
                void refresh();
              }
            } finally {
              setBusyId(null);
              setPublishRow(null);
            }
          }}
        />
      ) : null}
    </>
  );
}
