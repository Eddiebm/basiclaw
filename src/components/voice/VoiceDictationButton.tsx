"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { Mic } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import type { VoiceAnalyticsSurface } from "@/lib/analytics";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

function isSafariOrIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const iOS = /iPhone|iPad|iPod/i.test(ua);
  const safari = /Safari/i.test(ua) && !/Chrome|Chromium|CriOS|FxiOS|EdgiOS|Android/i.test(ua);
  return iOS || safari;
}

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
  /** When set, dictated + merged text is truncated to this length (e.g. chat composer cap). */
  maxLength?: number;
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
  maxLength,
}: VoiceDictationButtonProps) {
  const locale = useLocale();
  const t = useTranslations("voice");
  /** Text before the current dictation session — frozen while the mic session is active. */
  const baseRef = useRef(value);
  /** Last value we pushed via dictation; used to detect manual edits during listening. */
  const lastAppliedFromDictationRef = useRef(value);

  const clamp = useCallback(
    (s: string) => {
      if (maxLength == null || s.length <= maxLength) return s;
      return s.slice(0, maxLength);
    },
    [maxLength]
  );

  const applyTranscript = useCallback(
    (combinedFromSession: string) => {
      const session = combinedFromSession.trim();
      let next: string;
      if (mode === "replace") {
        next = session;
      } else {
        const base = baseRef.current.trimEnd();
        next = base ? `${base} ${session}`.trim() : session;
      }
      const clamped = clamp(next);
      onChange(clamped);
      lastAppliedFromDictationRef.current = clamped;
    },
    [clamp, mode, onChange]
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

  const stopRef = useRef<() => void>(() => {});
  useLayoutEffect(() => {
    stopRef.current = speech.stop;
  }, [speech.stop]);

  /*
   * Composer + dictation rules:
   * - While listening, `baseRef` stays fixed at the composer text from when the user pressed the mic.
   *   Interim + final transcripts only extend/replace the session tail; we merge as base + session (append)
   *   or session alone (replace). Syncing `baseRef` from `value` on every render caused the base to include
   *   already-dictated words and duplicate them on the next interim update.
   * - If the user edits the textarea while dictation is active (`value` diverges from what dictation last
   *   wrote), we stop listening so manual typing and speech recognition do not fight.
   */
  useEffect(() => {
    if (disabled) return;
    if (!speech.isListening) {
      baseRef.current = value;
      lastAppliedFromDictationRef.current = value;
    }
  }, [value, disabled, speech.isListening]);

  useEffect(() => {
    if (!speech.isListening) return;
    if (value !== lastAppliedFromDictationRef.current) {
      stopRef.current();
    }
  }, [value, speech.isListening]);

  useEffect(() => {
    if (!speech.isSupported && !disabled) {
      onErrorMessage?.(isSafariOrIOS() ? t("errorNotSupportedSafari") : t("errorNotSupported"));
      return () => {
        onErrorMessage?.(null);
      };
    }
    return undefined;
  }, [disabled, onErrorMessage, speech.isSupported, t]);

  useEffect(() => {
    if (!speech.isSupported) return;
    if (!speech.errorMessage && !speech.error) {
      onErrorMessage?.(null);
      return;
    }
    const human =
      speech.error === "not_supported"
        ? isSafariOrIOS()
          ? t("errorNotSupportedSafari")
          : t("errorNotSupported")
        : speech.error === "no_permission"
          ? t("errorNoPermission")
          : speech.error === "network"
            ? t("errorNetwork")
            : speech.error === "audio_capture"
              ? t("errorAudioCapture")
              : speech.error === "language_not_supported"
                ? t("errorLanguageNotSupported")
                : speech.error === "no_speech"
                  ? t("errorNoSpeech")
                  : speech.errorMessage ?? t("errorUnknown");
    onErrorMessage?.(human);
  }, [onErrorMessage, speech.error, speech.errorMessage, speech.isSupported, t]);

  const toggle = useCallback(() => {
    speech.resetError();
    if (speech.isListening) {
      speech.stop();
      return;
    }
    baseRef.current = value;
    lastAppliedFromDictationRef.current = value;
    speech.start();
  }, [speech, value]);

  const unsupportedMic = (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      disabled={false}
      aria-disabled="true"
      aria-label={t("micUnavailableAria")}
      title={isSafariOrIOS() ? t("errorNotSupportedSafari") : t("errorNotSupported")}
      className={cn("relative shrink-0 cursor-not-allowed opacity-50", className)}
      onClick={(e) => e.preventDefault()}
    >
      <Mic className="h-4 w-4" aria-hidden />
    </Button>
  );

  if (!speech.isSupported) {
    return unsupportedMic;
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
      title={speech.isListening ? t("micStopTitle") : t("micStartTitle")}
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
