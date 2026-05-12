"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, Globe, Bookmark, BookmarkCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { track } from "@/lib/analytics";
import { stripPIIForPublish } from "@/lib/answer-pii";
import type { Message } from "@/store/chat-context";
import { useChat } from "@/store/chat-context";
import { Button } from "@/components/ui/Button";
import { PublishConfirmModal } from "@/components/answers/PublishConfirmModal";

export function AssistantChatActions({
  message,
  prevUserText,
  jurisdiction,
  locale,
  signInHref,
  isSignedIn,
}: {
  message: Message;
  prevUserText: string;
  jurisdiction: string;
  locale: string;
  signInHref: string;
  isSignedIn: boolean;
}) {
  const t = useTranslations("answers.chat");
  const { currentSession, patchMessage } = useChat();
  const [busy, setBusy] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);

  async function vote(dir: "up" | "down") {
    const voteId = message.cachedFrom ?? message.savedAnswerId;
    if (!voteId) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/answers/${encodeURIComponent(voteId)}/vote`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ direction: dir }),
      });
      if (res.ok) {
        track("answer_voted", { direction: dir, answer_id: voteId });
      }
    } finally {
      setBusy(false);
    }
  }

  async function removeSaved() {
    if (!message.savedAnswerId || !currentSession) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/answers/${encodeURIComponent(message.savedAnswerId)}`, { method: "DELETE" });
      if (res.ok && currentSession) {
        patchMessage(currentSession.id, message.id, { savedAnswerId: undefined });
      }
    } finally {
      setBusy(false);
    }
  }

  async function saveManual() {
    if (!currentSession || !isSignedIn) return;
    setBusy(true);
    try {
      const res = await fetch("/api/answers", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          question: prevUserText,
          answer: message.content,
          jurisdiction,
          locale,
          citations: message.citations ?? [],
        }),
      });
      const j = (await res.json()) as { id?: string };
      if (res.ok && j.id) {
        patchMessage(currentSession.id, message.id, { savedAnswerId: j.id, isPublicSaved: false });
        track("answer_saved", { auto: false, answer_id: j.id });
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/40 pt-2">
        {message.cachedFrom ? (
          <span className="text-[11px] rounded-full bg-primary/15 text-primary px-2 py-0.5 font-medium">
            {t("cachedBadge", { score: message.cachedAtScore != null ? message.cachedAtScore.toFixed(2) : "—" })}
          </span>
        ) : null}
        {message.cachedFrom || message.savedAnswerId ? (
          <>
            <Button type="button" variant="ghost" size="sm" className="h-8 gap-1 px-2" disabled={busy} onClick={() => void vote("up")}>
              <ThumbsUp className="h-3.5 w-3.5" aria-hidden />
              <span className="sr-only">{t("voteUpAria")}</span>
            </Button>
            <Button type="button" variant="ghost" size="sm" className="h-8 gap-1 px-2" disabled={busy} onClick={() => void vote("down")}>
              <ThumbsDown className="h-3.5 w-3.5" aria-hidden />
              <span className="sr-only">{t("voteDownAria")}</span>
            </Button>
          </>
        ) : null}
        {isSignedIn ? (
          <>
            {message.savedAnswerId ? (
              <Button type="button" variant="ghost" size="sm" className="h-8 gap-1 px-2 text-xs" disabled={busy} onClick={() => void removeSaved()}>
                <BookmarkCheck className="h-3.5 w-3.5" aria-hidden />
                {t("savedToggleOn")}
              </Button>
            ) : (
              <Button type="button" variant="ghost" size="sm" className="h-8 gap-1 px-2 text-xs" disabled={busy} onClick={() => void saveManual()}>
                <Bookmark className="h-3.5 w-3.5" aria-hidden />
                {t("saveToLibrary")}
              </Button>
            )}
            {message.savedAnswerId && !message.isPublicSaved ? (
              <Button type="button" variant="ghost" size="sm" className="h-8 gap-1 px-2 text-xs" disabled={busy} onClick={() => setPublishOpen(true)}>
                <Globe className="h-3.5 w-3.5" aria-hidden />
                {t("makePublic")}
              </Button>
            ) : null}
            {message.savedAnswerId && message.isPublicSaved ? (
              <span className="text-[11px] text-muted-foreground">{t("publicBadge")}</span>
            ) : null}
          </>
        ) : (
          <p className="text-[11px] text-muted-foreground">
            <Link href={signInHref} className="font-medium text-primary underline-offset-4 hover:underline">
              {t("signInToSave")}
            </Link>
          </p>
        )}
      </div>
      {message.savedAnswerId && publishOpen ? (
        <PublishConfirmModal
          previewQuestion={stripPIIForPublish(prevUserText)}
          previewAnswerSnippet={message.content.slice(0, 400)}
          onClose={() => setPublishOpen(false)}
          onConfirm={async () => {
            if (!message.savedAnswerId) return;
            setBusy(true);
            try {
              const res = await fetch(`/api/answers/${encodeURIComponent(message.savedAnswerId)}/publish`, {
                method: "POST",
              });
              if (res.ok && currentSession) {
                patchMessage(currentSession.id, message.id, { isPublicSaved: true });
                track("answer_publish_toggled", { to: "public", answer_id: message.savedAnswerId });
              }
            } finally {
              setBusy(false);
              setPublishOpen(false);
            }
          }}
        />
      ) : null}
    </>
  );
}
