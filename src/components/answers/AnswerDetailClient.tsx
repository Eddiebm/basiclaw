"use client";

import { useEffect, useMemo, useState } from "react";
import { ThumbsUp, ThumbsDown, Copy, Linkedin } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { MarkdownContent } from "@/components/markdown/MarkdownContent";
import { Button } from "@/components/ui/Button";
import { track } from "@/lib/analytics";

export function AnswerDetailClient({
  id,
  question,
  answerMarkdown,
  jurisdictionCode,
  jurisdictionLabel,
  upvotes,
  downvotes,
  verifiedLine,
  siteBase,
  canonicalPath,
}: {
  id: string;
  question: string;
  answerMarkdown: string;
  jurisdictionCode: string;
  jurisdictionLabel: string;
  upvotes: number;
  downvotes: number;
  verifiedLine: string | null;
  siteBase: string;
  canonicalPath: string;
}) {
  const t = useTranslations("answers.detail");
  const [copied, setCopied] = useState(false);
  const [voteBusy, setVoteBusy] = useState(false);
  const [up, setUp] = useState(upvotes);
  const [down, setDown] = useState(downvotes);

  const pageUrl = `${siteBase}${canonicalPath}`;
  const chatPrefill = `/chat?prefill=${encodeURIComponent(question)}&country=${encodeURIComponent(jurisdictionCode)}`;
  const embedSnippet = `<script src="${siteBase}/embed/loader.js" data-basiclaw-answer="${id}"></script>`;

  useEffect(() => {
    track("answer_viewed", { answer_id: id, public: true });
  }, [id]);

  const shareX = useMemo(() => {
    const text = encodeURIComponent(question.slice(0, 200));
    return `https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${text}`;
  }, [pageUrl, question]);

  const shareIn = useMemo(() => {
    return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`;
  }, [pageUrl]);

  async function copyPage() {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  async function copyEmbed() {
    try {
      await navigator.clipboard.writeText(embedSnippet);
    } catch {
      /* ignore */
    }
  }

  async function vote(direction: "up" | "down") {
    setVoteBusy(true);
    try {
      const res = await fetch(`/api/answers/${encodeURIComponent(id)}/vote`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ direction }),
      });
      if (res.ok) {
        const j = (await res.json()) as { upvotes?: number; downvotes?: number };
        if (typeof j.upvotes === "number") setUp(j.upvotes);
        if (typeof j.downvotes === "number") setDown(j.downvotes);
        track("answer_voted", { direction, answer_id: id });
      }
    } finally {
      setVoteBusy(false);
    }
  }

  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none">
      <div className="not-prose mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-950 dark:text-amber-100">
        {t("disclaimer")}
      </div>
      <p className="text-sm text-[var(--muted-foreground)] not-prose">
        <span className="inline-flex items-center rounded-full border border-[var(--border)] px-2 py-0.5 text-xs uppercase">
          {jurisdictionLabel} ({jurisdictionCode.toUpperCase()})
        </span>
      </p>
      <h1 className="text-2xl sm:text-3xl font-bold mt-2">{question}</h1>
      {verifiedLine ? <p className="text-sm text-emerald-700 dark:text-emerald-300 not-prose mt-2">{verifiedLine}</p> : null}
      <div className="not-prose mt-6 flex flex-wrap items-center gap-2 text-sm text-[var(--muted-foreground)]">
        <button
          type="button"
          disabled={voteBusy}
          onClick={() => void vote("up")}
          className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] px-2 py-1 hover:bg-[var(--accent)] disabled:opacity-50"
        >
          <ThumbsUp className="h-3.5 w-3.5" aria-hidden />
          {up}
        </button>
        <button
          type="button"
          disabled={voteBusy}
          onClick={() => void vote("down")}
          className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] px-2 py-1 hover:bg-[var(--accent)] disabled:opacity-50"
        >
          <ThumbsDown className="h-3.5 w-3.5" aria-hidden />
          {down}
        </button>
      </div>
      <div className="not-prose mt-8 border-t border-[var(--border)] pt-8">
        <MarkdownContent markdown={answerMarkdown} />
      </div>
      <div className="not-prose mt-10 flex flex-wrap gap-2">
        <Button asChild size="sm" variant="outline">
          <Link href={chatPrefill}>{t("askRelated")}</Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <a href={shareX} target="_blank" rel="noopener noreferrer">
            {t("shareX")}
          </a>
        </Button>
        <Button asChild size="sm" variant="outline">
          <a href={shareIn} target="_blank" rel="noopener noreferrer">
            <Linkedin className="h-3.5 w-3.5 mr-1" aria-hidden />
            {t("shareLinkedIn")}
          </a>
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => void copyPage()}>
          <Copy className="h-3.5 w-3.5 mr-1" aria-hidden />
          {copied ? "Copied" : t("copyLink")}
        </Button>
        <Button type="button" size="sm" variant="secondary" onClick={() => void copyEmbed()}>
          {t("embedSnippet")}
        </Button>
      </div>
      <p className="not-prose text-xs text-[var(--muted-foreground)] mt-2">{t("embedHelp")}</p>
    </article>
  );
}
