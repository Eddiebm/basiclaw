"use client";

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, Bot, Copy, ExternalLink, Loader2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useAnnouncer } from "@/components/a11y/AnnouncerProvider";
import { useChat } from "@/store/chat-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { LawyerCtaLink } from "@/components/analytics/LawyerCtaLink";
import { track } from "@/lib/analytics";
import { VoiceDictationButton } from "@/components/voice/VoiceDictationButton";
import { VoicePrivacyHint } from "@/components/voice/VoicePrivacyHint";
import { ReadAloudButton } from "@/components/voice/ReadAloudButton";

export function ChatInterface() {
  const tc = useTranslations("chatEmpty");
  const tComposer = useTranslations("chatComposer");
  const tVoice = useTranslations("voice");
  const tCitations = useTranslations("chat.citations");
  const locale = useLocale();
  const pathname = usePathname();
  const signInHref = `/sign-in?redirect_url=${encodeURIComponent(`/${locale}${pathname}`)}`;
  const { currentSession, sendMessage, isTyping, error, errorUpgradePath, clearError } = useChat();
  const announce = useAnnouncer();
  const [input, setInput] = useState("");
  const [voiceReplace, setVoiceReplace] = useState(false);
  const [voiceAutoSend, setVoiceAutoSend] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const message = input.trim();
    track("chat_message_sent", {
      length: message.length,
      jurisdiction: currentSession?.jurisdiction ?? null,
      session_id: currentSession?.id ?? null,
    });
    await sendMessage(message);
    setInput("");
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  if (!currentSession) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center"
          >
            <Bot className="w-8 h-8 text-primary" />
          </motion.div>
          <h2 className="text-2xl font-semibold mb-2">{tc("title")}</h2>
          <p className="text-muted-foreground mb-4">{tc("body")}</p>
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
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence mode="popLayout">
          {currentSession.messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
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
              className={cn(
                "flex gap-3",
                message.role === "user" && "flex-row-reverse"
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary"
                )}
              >
                {message.role === "user" ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>

              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary"
                )}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>

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
                              {cite.snippet ? (
                                <p className="text-muted-foreground mt-1 line-clamp-3">{cite.snippet}</p>
                              ) : null}
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
                      minute: "2-digit"
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
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
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

      {/* Input */}
      <div className="border-t p-4 bg-background/80 backdrop-blur">
        {error && (
          <div
            role="alert"
            className="mb-3 rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
          >
            <span>{error}</span>
            <div className="flex items-center gap-2 shrink-0">
              {errorUpgradePath ? (
                <Link
                  href={errorUpgradePath}
                  className="font-medium underline underline-offset-4"
                >
                  {tComposer("quotaUpgradeCta")}
                </Link>
              ) : null}
              <button
                type="button"
                className="text-xs font-medium opacity-80 hover:opacity-100"
                onClick={() => clearError()}
              >
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
        <div className="flex gap-2 items-end max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={tComposer("placeholder")}
              className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 pr-24 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed min-h-[48px] max-h-[200px]"
              rows={1}
              disabled={isTyping}
            />
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <VoiceDictationButton
                value={input}
                onChange={setInput}
                mode={voiceReplace ? "replace" : "append"}
                surface="chat"
                disabled={isTyping}
                onErrorMessage={setVoiceError}
                onDictationSessionEnd={(finalText) => {
                  if (voiceAutoSend && finalText.trim() && !isTyping) {
                    void (async () => {
                      const msg = finalText.trim();
                      track("chat_message_sent", {
                        length: msg.length,
                        jurisdiction: currentSession?.jurisdiction ?? null,
                        session_id: currentSession?.id ?? null,
                        voice_auto_send: true,
                      });
                      await sendMessage(msg);
                      setInput("");
                      textareaRef.current?.focus();
                    })();
                  }
                }}
              />
            </div>
          </div>
          <Button
            size="icon"
            onClick={() => void handleSend()}
            disabled={!input.trim() || isTyping}
            className="shrink-0 h-[48px] w-[48px]"
            aria-busy={isTyping}
          >
            {isTyping ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
        <VoicePrivacyHint className="text-xs text-center text-muted-foreground mt-2 max-w-2xl mx-auto leading-relaxed" />
        <p className="text-xs text-center text-muted-foreground mt-1">{tComposer("sendHint")}</p>
      </div>
    </div>
  );
}
