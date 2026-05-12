"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { stripMarkdownForSpeech } from "@/lib/stripMarkdownForSpeech";

export interface SpeakOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  /** ISO country / region hints to bias voice selection (e.g. jurisdiction code). */
  dialectHints?: string[];
}

export interface UseSpeechSynthesisOptions {
  locale: string;
  onSpeakStarted?: () => void;
  onSpeakEnded?: () => void;
  onSpeakError?: (message: string) => void;
}

function normalizeHints(hints: string[] | undefined): string[] {
  if (!hints?.length) return [];
  return hints.map((h) => h.trim().toLowerCase()).filter(Boolean);
}

function pickVoice(voices: SpeechSynthesisVoice[], preferredLang: string, hints: string[]): SpeechSynthesisVoice | null {
  if (!voices.length) return null;
  const base = preferredLang.split("-")[0]?.toLowerCase() ?? "en";
  const fullLower = preferredLang.toLowerCase();

  const score = (v: SpeechSynthesisVoice): number => {
    let s = 0;
    const vl = v.lang.toLowerCase();
    if (vl === fullLower) s += 50;
    if (vl.startsWith(`${base}-`)) s += 30;
    if (vl.startsWith(base)) s += 20;
    if (v.localService) s += 5;
    if (v.default) s += 2;
    for (const h of hints) {
      if (h && (vl.includes(h) || v.name.toLowerCase().includes(h))) s += 8;
    }
    return s;
  };

  let best: SpeechSynthesisVoice | null = null;
  let bestScore = -1;
  for (const v of voices) {
    const sc = score(v);
    if (sc > bestScore) {
      best = v;
      bestScore = sc;
    }
  }
  return best;
}

export function useSpeechSynthesis(options: UseSpeechSynthesisOptions) {
  const { locale, onSpeakStarted, onSpeakEnded, onSpeakError } = options;
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const load = () => setVoices(window.speechSynthesis.getVoices());
    const raf = requestAnimationFrame(() => {
      setIsSupported(true);
      load();
    });
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => {
      cancelAnimationFrame(raf);
      window.speechSynthesis.removeEventListener("voiceschanged", load);
    };
  }, []);

  const cancel = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setIsSpeaking(false);
    onSpeakEnded?.();
  }, [onSpeakEnded]);

  const speak = useCallback(
    (text: string, speakOptions?: SpeakOptions) => {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        onSpeakError?.("Speech synthesis not supported.");
        return;
      }
      const trimmed = stripMarkdownForSpeech(text).trim();
      if (!trimmed) return;

      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(trimmed);
      utteranceRef.current = utter;

      const lang = speakOptions?.lang ?? locale;
      utter.lang = lang;
      utter.rate = speakOptions?.rate ?? 1;
      utter.pitch = speakOptions?.pitch ?? 1;

      const list = window.speechSynthesis.getVoices();
      const voice = pickVoice(list, lang, normalizeHints(speakOptions?.dialectHints));
      if (voice) utter.voice = voice;

      utter.onstart = () => {
        setIsSpeaking(true);
        onSpeakStarted?.();
      };
      utter.onend = () => {
        utteranceRef.current = null;
        setIsSpeaking(false);
        onSpeakEnded?.();
      };
      utter.onerror = (e) => {
        utteranceRef.current = null;
        setIsSpeaking(false);
        onSpeakError?.(e.error || "synthesis_error");
        onSpeakEnded?.();
      };

      window.speechSynthesis.speak(utter);
    },
    [locale, onSpeakEnded, onSpeakError, onSpeakStarted]
  );

  const pause = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis?.speaking) {
      window.speechSynthesis.pause();
    }
  }, []);

  const resume = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis?.paused) {
      window.speechSynthesis.resume();
    }
  }, []);

  useEffect(() => () => cancel(), [cancel]);

  return {
    isSupported,
    isSpeaking,
    voices,
    speak,
    cancel,
    pause,
    resume,
  };
}
