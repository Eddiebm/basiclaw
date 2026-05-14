"use client";

import { useState, useRef, useEffect, useCallback, useMemo, type KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Send, User, Bot, Copy, ExternalLink, Loader2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useUser } from "@clerk/nextjs";
import { useClerkEnabled } from "@/contexts/ClerkEnabledContext";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useAnnouncer } from "@/components/a11y/AnnouncerProvider";
import { useChat } from "@/store/chat-context";
import { getCountry, getPopularCountries } from "@/lib/jurisdictions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { LawyerCtaLink } from "@/components/analytics/LawyerCtaLink";
import { track } from "@/lib/analytics";
import { VoiceDictationButton, ReadAloudButton } from "@/components/voice/dynamic-voice-controls";
import { VoicePrivacyHint } from "@/components/voice/VoicePrivacyHint";
import { AssistantChatActions } from "@/components/chat/AssistantChatActions";
import { MarkdownContent } from "@/components/markdown/MarkdownContent";
import { CHAT_QUERY_PREFILL_MAX_LEN, readChatPrefillFromSearchParams } from "@/lib/chat-query-prefill";

function resolveJurisdictionFromParams(searchParams: { get: (key: string) => string | null }): string {
  const raw = searchParams.get("jurisdiction") ?? searchParams.get("country") ?? "";
  const candidate = raw.trim();
  if (candidate) {
    const found = getCountry(candidate);
    if (found) return found.code.toLowerCase();
  }
  return "us";
}

function ChatInterfaceClerk() {
  const { isSignedIn } = useUser();
  return <ChatInterfaceBody isSignedIn={Boolean(isSignedIn)} />;
}

export function ChatInterface() {
  const clerkEnabled = useClerkEnabled();
  if (clerkEnabled) return <ChatInterfaceClerk />;
  return <ChatInterfaceBody isSignedIn={false} />;
}

function ChatInterfaceBody({ isSignedIn }: { isSignedIn: boolean }) {
  const tc = useTranslations("chatEmpty");
  const tComposer = useTranslations("chatComposer");
  const tVoice = useTranslations("voice");
  const tCitations = useTranslations("chat.citations");
  const tAns = useTranslations("answers.chat");
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const signInHref = `/sign-in?redirect_url=${encodeURIComponent(`/${locale}${pathname}`)}`;
  const { currentSession, sendMessage, isTyping, error, errorUpgradePath, clearError } = useChat();
  const announce = useAnnouncer();
  const [input, setInput] = useState("");
  const [voiceReplace, setVoiceReplace] = useState(false);
  const [voiceAutoSend, setVoiceAutoSend] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const setComposerInput = useCallback((next: string) => {
    setInput(next.length > CHAT_QUERY_PREFILL_MAX_LEN ? next.slice(0, CHAT_QUERY_PREFILL_MAX_LEN) : next);
  }, []);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastSessionIdRef = useRef<string | null>(null);

  const popularCountries = getPopularCountries().slice(0, 12);
  const searchKey = searchParams.toString();
  const composerJurisdiction = useMemo(() => {
    const sp = new URLSearchParams(searchKey);
    return resolveJurisdictionFromParams(sp);
  }, [searchKey]);
  const prefillHint = useMemo(() => {
    const sp = new URLSearchParams(searchKey);
    return readChatPrefillFromSearchParams(sp) ?? "";
  }, [searchKey]);

  function replaceChatQuery(nextCountry: string) {
    const sp = new URLSearchParams(searchParams.toString());
    if (!nextCountry || nextCountry === "us") {
      sp.delete("country");
      sp.delete("jurisdiction");
    } else {
      sp.set("country", nextCountry);
    }
    const q = sp.toString();
    router.replace(q ? `/chat?${q}` : "/chat");
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  useEffect(() => {
    const nextId = currentSession?.id ?? null;
    if (nextId && nextId !== lastSessionIdRef.current) {
      lastSessionIdRef.current = nextId;
      const node = textareaRef.current;
      if (node) {
        requestAnimationFrame(() => {
          try {
            node.focus({ preventScroll: true });
          } catch {
            node.focus();
          }
        });
      }
    }
    if (!nextId) {
      lastSessionIdRef.current = null;
    }
  }, [currentSession?.id]);

  const sendOpts = useCallback(() => ({ jurisdiction: composerJurisdiction }), [composerJurisdiction]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const message = input.trim();
    track("chat_message_sent", {
      length: message.length,
      jurisdiction: currentSession?.jurisdiction ?? composerJurisdiction,
      session_id: currentSession?.id ?? null,
    });
    await sendMessage(message, sendOpts());
    setInput("");
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const resolvedCountry = getCountry(composerJurisdiction);

  const lastRelated = useMemo(() => {
    if (!currentSession?.messages.length) return [];
    for (let i = currentSession.messages.length - 1; i >= 0; i--) {
      const m = currentSession.messages[i];
      if (m.role === "assistant" && m.relatedSavedAnswers && m.relatedSavedAnswers.length > 0) {
        return m.relatedSavedAnswers;
      }
    }
    return [];
  }, [currentSession?.messages]);

  const [suggestions, setSuggestions] = useState<Array<{ id: string; question: string; upvotes?: number }>>([]);

  useEffect(() => {
    let cancelled = false;
    const empty = !currentSession || currentSession.messages.length > 0;
    if (empty) {
      void Promise.resolve().then(() => {
        if (!cancelled) setSuggestions([]);
      });
      return () => {
        cancelled = true;
      };
    }
    void (async () => {
      try {
        const res = await fetch(`/api/answers/suggest?country=${encodeURIComponent(composerJurisdiction)}`);
        const j = (await res.json()) as { items?: Array<{ id: string; question: string; upvotes?: number }> };
        if (!cancelled && j.items) setSuggestions(j.items);
      } catch {
        if (!cancelled) setSuggestions([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currentSession, composerJurisdiction]);

  return (
    <div className="flex flex-col lg:flex-row flex-1 min-h-0 w-full">
      <div className="flex flex-col flex-1 min-h-0 min-w-0">
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        {!currentSession ? (
          <div className="flex flex-col items-center text-center max-w-lg mx-auto pt-4 pb-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center"
            >
              <Bot className="w-8 h-8 text-primary" />
            </motion.div>
            <h2 className="text-2xl font-semibold mb-2">{tc("title")}</h2>
            <p className="text-muted-foreground mb-2">{tc("body")}</p>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">{tc("noSessionLead")}</p>
            <div className="w-full max-w-sm flex flex-col gap-2 items-stretch mb-4">
              <label htmlFor="chat-composer-jurisdiction" className="text-left text-xs font-medium text-muted-foreground">
                {tc("jurisdictionLabel")}
              </label>
              <select
                id="chat-composer-jurisdiction"
                value={composerJurisdiction}
                onChange={(e) => replaceChatQuery(e.target.value)}
                className="min-h-11 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {popularCountries.map((c) => (
                  <option key={c.code} value={c.code.toLowerCase()}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
              {resolvedCountry ? (
                <p className="text-xs text-muted-foreground text-left">{tc("startCtaCountryHint", { country: `${resolvedCountry.flag} ${resolvedCountry.name}` })}</p>
              ) : null}
            </div>
            <LawyerCtaLink
              href="/find-a-lawyer"
              source="chat_empty_no_session"
              className="inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              {tc("lawyerCta")}
            </LawyerCtaLink>
            <p className="mt-4 text-xs text-muted-foreground">
              {tc("signInToSaveLead")}{" "}
              <Link href={signInHref} className="font-medium text-primary underline-offset-4 hover:underline">
                {tc("signInToSaveCta")}
              </Link>
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {currentSession.messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 max-w-md mx-auto"
              >
                <p className="text-muted-foreground mb-4">{tc("body")}</p>
                <LawyerCtaLink
                  href="/find-a-lawyer"
                  source="chat_empty_session"
                  className="inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  {tc("lawyerCta")}
                </LawyerCtaLink>
                <p className="mt-4 text-xs text-muted-foreground">
                  {tc("signInToSaveLead")}{" "}
                  <Link href={signInHref} className="font-medium text-primary underline-offset-4 hover:underline">
                    {tc("signInToSaveCta")}
                  </Link>
                </p>
              </motion.div>
            )}

            {currentSession.messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn("flex gap-3", message.role === "user" && "flex-row-reverse")}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"
                  )}
                >
                  {message.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3",
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"
                  )}
                >
                  {message.role === "user" ? (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  ) : (
                    <MarkdownContent markdown={message.content} className="text-sm" />
                  )}

                  {message.role === "assistant" && message.citations && message.citations.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <p className="text-xs font-medium mb-2 opacity-70">{tCitations("sourcesAndCasesLabel")}</p>
                      <ul className="space-y-2">
                        {message.citations.map((cite) => (
                          <li key={cite.id}>
                            {cite.url ? (
                              <a
                                href={cite.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex gap-2 rounded-lg border border-border/60 bg-background/50 p-2 text-left text-xs hover:border-primary/40 hover:bg-background/80 transition-colors"
                              >
                                <ExternalLink className="h-3.5 w-3.5 shrink-0 mt-0.5 opacity-60 group-hover:opacity-100" aria-hidden />
                                <span className="min-w-0">
                                  <span className="font-medium text-foreground block truncate">{cite.title}</span>
                                  <span className="text-muted-foreground line-clamp-2">{cite.snippet}</span>
                                </span>
                              </a>
                            ) : (
                              <div className="rounded-lg border border-border/60 bg-background/50 p-2 text-xs">
                                <span className="font-medium text-foreground block">{cite.title}</span>
                                <span className="text-muted-foreground text-[11px]">{tCitations("snippetRefLabel")}</span>
                                {cite.snippet ? <p className="text-muted-foreground mt-1 line-clamp-3">{cite.snippet}</p> : null}
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs opacity-50">
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {message.role === "assistant" && (
                      <>
                        <ReadAloudButton
                          text={message.content}
                          surface="chat"
                          dialectHints={currentSession?.jurisdiction ? [currentSession.jurisdiction] : []}
                          size="icon"
                          className="h-7 w-7 opacity-70 hover:opacity-100"
                        />
                        <button
                          type="button"
                          className="opacity-50 hover:opacity-100 transition-opacity"
                          aria-label={tVoice("copyMessageAria")}
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(message.content);
                              announce(tComposer("copyAnnouncementSuccess"));
                            } catch {
                              announce(tComposer("copyAnnouncementFail"));
                            }
                          }}
                        >
                          <Copy className="w-3 h-3" aria-hidden />
                        </button>
                      </>
                    )}
                  </div>
                  {message.role === "assistant" && currentSession ? (
                    <AssistantChatActions
                      message={message}
                      prevUserText={
                        index > 0 && currentSession.messages[index - 1]?.role === "user"
                          ? currentSession.messages[index - 1].content
                          : ""
                      }
                      jurisdiction={currentSession.jurisdiction}
                      locale={locale}
                      signInHref={signInHref}
                      isSignedIn={isSignedIn}
                    />
                  ) : null}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {currentSession && isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-secondary rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
        </div>

        <div className="border-t p-4 bg-background/80 backdrop-blur shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {error && (
          <div
            role="alert"
            className="mb-3 rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
          >
            <span>{error}</span>
            <div className="flex items-center gap-2 shrink-0">
              {errorUpgradePath ? (
                <Link href={errorUpgradePath} className="font-medium underline underline-offset-4">
                  {tComposer("quotaUpgradeCta")}
                </Link>
              ) : null}
              <button type="button" className="text-xs font-medium opacity-80 hover:opacity-100" onClick={() => clearError()}>
                {tComposer("dismissError")}
              </button>
            </div>
          </div>
        )}
        {voiceError && (
          <p className="text-xs text-center text-amber-700 dark:text-amber-300 mb-2" role="status">
            {tComposer("voiceErrorBanner", { message: voiceError })}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mb-2 text-xs text-muted-foreground max-w-4xl mx-auto">
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              className="rounded border-input"
              checked={voiceReplace}
              onChange={(e) => setVoiceReplace(e.target.checked)}
            />
            {tComposer("voiceReplaceLabel")}
          </label>
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              className="rounded border-input"
              checked={voiceAutoSend}
              onChange={(e) => setVoiceAutoSend(e.target.checked)}
            />
            {tComposer("voiceAutoSendLabel")}
          </label>
        </div>
        <label htmlFor="chat-composer-input" className="sr-only">
          {tComposer("inputLabel")}
        </label>
        <div className="flex gap-2 items-end max-w-4xl mx-auto">
          <div className="flex-1 relative min-w-0">
            <textarea
              id="chat-composer-input"
              ref={textareaRef}
              data-testid="chat-composer-textarea"
              value={input}
              maxLength={CHAT_QUERY_PREFILL_MAX_LEN}
              onChange={(e) => setComposerInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={prefillHint || tComposer("placeholder")}
              className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 pr-24 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed min-h-[48px] max-h-[200px]"
              rows={1}
              disabled={isTyping}
            />
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <VoiceDictationButton
                value={input}
                onChange={setComposerInput}
                mode={voiceReplace ? "replace" : "append"}
                surface="chat"
                maxLength={CHAT_QUERY_PREFILL_MAX_LEN}
                disabled={isTyping}
                onErrorMessage={setVoiceError}
                onDictationSessionEnd={(finalText) => {
                  if (voiceAutoSend && finalText.trim() && !isTyping) {
                    void (async () => {
                      const msg = finalText.trim();
                      track("chat_message_sent", {
                        length: msg.length,
                        jurisdiction: currentSession?.jurisdiction ?? composerJurisdiction,
                        session_id: currentSession?.id ?? null,
                        voice_auto_send: true,
                      });
                      await sendMessage(msg, sendOpts());
                      setInput("");
                      textareaRef.current?.focus();
                    })();
                  }
                }}
              />
            </div>
          </div>
          <Button
            type="button"
            size="icon"
            data-testid="chat-composer-send"
            onClick={() => void handleSend()}
            disabled={!input.trim() || isTyping}
            className="shrink-0 h-12 w-12 min-h-[48px] min-w-[48px]"
            aria-busy={isTyping}
          >
            {isTyping ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : <Send className="w-4 h-4" aria-hidden />}
          </Button>
        </div>
        {currentSession && currentSession.messages.length === 0 && suggestions.length > 0 ? (
          <div className="px-4 pb-2 max-w-4xl mx-auto w-full">
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">{tAns("suggestTitle")}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {suggestions.map((s) => (
                  <div key={s.id} className="rounded-lg border border-border/50 bg-background/80 px-3 py-2 text-left text-xs space-y-1">
                    <Link
                      href={`/chat?prefill=${encodeURIComponent(s.question)}&country=${encodeURIComponent(composerJurisdiction)}`}
                      className="block hover:border-primary/30 line-clamp-3 font-medium text-foreground hover:underline"
                    >
                      {s.question}
                    </Link>
                    <div className="flex flex-wrap gap-x-2 gap-y-1 text-[11px]">
                      <Link href={`/answers/${s.id}`} className="text-primary hover:underline">
                        {tAns("suggestView")}
                      </Link>
                      <span className="text-muted-foreground">· {s.upvotes ?? 0}↑</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
        <VoicePrivacyHint className="text-xs text-center text-muted-foreground mt-2 max-w-2xl mx-auto leading-relaxed" />
        <p className="text-xs text-center text-muted-foreground mt-1">{tComposer("sendHint")}</p>
        </div>
      </div>

      {lastRelated.length > 0 ? (
        <aside className="hidden lg:block w-72 shrink-0 border-l border-border/60 bg-muted/20 p-4 overflow-y-auto text-sm">
          <p className="font-semibold text-xs text-muted-foreground mb-3">{tAns("relatedTitle")}</p>
          <ul className="space-y-3">
            {lastRelated.map((r) => (
              <li key={r.id} className="rounded-lg border border-border/40 bg-background/60 p-2">
                <Link href={`/answers/${r.id}`} className="font-medium text-foreground hover:underline block text-xs leading-snug">
                  {r.question}
                </Link>
                <p className="text-[10px] text-muted-foreground mt-1">{tAns("relatedScore", { score: r.score.toFixed(2) })}</p>
                <Link
                  href={`/chat?prefill=${encodeURIComponent(r.question)}&country=${encodeURIComponent(composerJurisdiction)}`}
                  className="text-[11px] text-primary mt-1 inline-block hover:underline"
                >
                  {tAns("suggestOpenChat")}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      ) : null}
    </div>
  );
}
