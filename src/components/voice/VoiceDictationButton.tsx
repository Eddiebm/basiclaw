"use client";

import { useCallback, useEffect, useRef } from "react";
import { Mic } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import type { VoiceAnalyticsSurface } from "@/lib/analytics";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

export interface VoiceDictationButtonProps {
  value: string;
  onChange: (next: string) => void;
  mode: "append" | "replace";
  surface: VoiceAnalyticsSurface;
  disabled?: boolean;
  className?: string;
  onErrorMessage?: (message: string | null) => void;
  /** Called with the dictation-only text when the session ends (no base text). */
  onDictationSessionEnd?: (dictatedText: string) => void;
}

export function VoiceDictationButton({
  value,
  onChange,
  mode,
  surface,
  disabled,
  className,
  onErrorMessage,
  onDictationSessionEnd,
}: VoiceDictationButtonProps) {
  const locale = useLocale();
  const t = useTranslations("voice");
  const baseRef = useRef(value);

  useEffect(() => {
    if (!disabled) baseRef.current = value;
  }, [value, disabled]);

  const applyTranscript = useCallback(
    (combinedFromSession: string) => {
      const session = combinedFromSession.trim();
      if (mode === "replace") {
        onChange(session);
        return;
      }
      const base = baseRef.current.trimEnd();
      if (!session) {
        onChange(base);
        return;
      }
      onChange(base ? `${base} ${session}` : session);
    },
    [mode, onChange]
  );

  const speech = useSpeechRecognition({
    lang: typeof navigator !== "undefined" && navigator.language ? navigator.language : locale,
    surface,
    onTranscript: (combined) => {
      applyTranscript(combined);
    },
    onEnd: (finalSessionText) => {
      onDictationSessionEnd?.(finalSessionText.trim());
    },
  });

  useEffect(() => {
    if (!speech.errorMessage) {
      onErrorMessage?.(null);
      return;
    }
    const human =
      speech.error === "not_supported"
        ? t("errorNotSupported")
        : speech.error === "no_permission"
          ? t("errorNoPermission")
          : speech.error === "network"
            ? t("errorNetwork")
            : speech.errorMessage ?? t("errorUnknown");
    onErrorMessage?.(human);
  }, [onErrorMessage, speech.error, speech.errorMessage, t]);

  const toggle = useCallback(() => {
    speech.resetError();
    if (speech.isListening) {
      speech.stop();
      return;
    }
    baseRef.current = value;
    speech.start();
  }, [speech, value]);

  if (!speech.isSupported) {
    return null;
  }

  const label = speech.isListening ? t("micStopAria") : t("micStartAria");

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      disabled={disabled}
      aria-pressed={speech.isListening}
      aria-label={label}
      title={label}
      onClick={() => toggle()}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          if (!disabled) toggle();
        }
      }}
      className={cn(
        "relative shrink-0",
        speech.isListening && "text-primary",
        className
      )}
    >
      {speech.isListening ? (
        <>
          <span className="absolute inset-0 rounded-full bg-primary/25 animate-ping" aria-hidden />
          <Mic className="relative h-4 w-4" aria-hidden />
        </>
      ) : (
        <Mic className="h-4 w-4" aria-hidden />
      )}
    </Button>
  );
}
