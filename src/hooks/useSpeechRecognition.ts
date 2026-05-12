"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { VoiceAnalyticsSurface } from "@/lib/analytics";
import { track } from "@/lib/analytics";

export type SpeechRecognitionErrorCode =
  | "not_supported"
  | "no_permission"
  | "network"
  | "service_not_allowed"
  | "aborted"
  | "unknown";

export interface UseSpeechRecognitionOptions {
  lang: string;
  /** Called with latest full transcript (final accumulation + interim). */
  onTranscript?: (text: string, meta: { interim: string; final: string }) => void;
  /** Fired once when recognition ends (manual stop, error, or silence end). */
  onEnd?: (finalText: string) => void;
  surface: VoiceAnalyticsSurface;
}

export interface UseSpeechRecognitionResult {
  isSupported: boolean;
  isListening: boolean;
  interimTranscript: string;
  error: SpeechRecognitionErrorCode | null;
  errorMessage: string | null;
  start: () => void;
  stop: () => void;
  resetError: () => void;
}

function mapError(ev: SpeechRecognitionErrorEvent): { code: SpeechRecognitionErrorCode; message: string } {
  const err = ev.error;
  if (err === "not-allowed" || err === "service-not-allowed") {
    return { code: "no_permission", message: ev.message || err };
  }
  if (err === "network") return { code: "network", message: ev.message || err };
  if (err === "aborted") return { code: "aborted", message: ev.message || err };
  return { code: "unknown", message: ev.message || err };
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions): UseSpeechRecognitionResult {
  const { lang, onTranscript, onEnd, surface } = options;
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<SpeechRecognitionErrorCode | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const finalAccumRef = useRef("");

  const getCtor = useCallback((): (new () => SpeechRecognition) | null => {
    if (typeof window === "undefined") return null;
    const w = window as Window & {
      SpeechRecognition?: new () => SpeechRecognition;
      webkitSpeechRecognition?: new () => SpeechRecognition;
    };
    return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
  }, []);

  const isSupported = Boolean(getCtor());

  const stop = useCallback(() => {
    const rec = recognitionRef.current;
    if (rec) {
      try {
        rec.stop();
      } catch {
        /* ignore */
      }
    }
    setIsListening(false);
  }, []);

  const start = useCallback(() => {
    const Ctor = getCtor();
    if (!Ctor || typeof window === "undefined") {
      setError("not_supported");
      setErrorMessage("Speech recognition is not supported in this browser.");
      return;
    }
    setError(null);
    setErrorMessage(null);
    setInterimTranscript("");
    finalAccumRef.current = "";

    const rec = new Ctor();
    recognitionRef.current = rec;
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = lang;
    rec.maxAlternatives = 1;

    rec.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let latestFinalChunk = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const res = event.results[i];
        const piece = res[0]?.transcript ?? "";
        if (res.isFinal) {
          latestFinalChunk += piece;
        } else {
          interim += piece;
        }
      }
      if (latestFinalChunk) {
        finalAccumRef.current = `${finalAccumRef.current} ${latestFinalChunk}`.trim();
      }
      setInterimTranscript(interim.trim());
      const combined = `${finalAccumRef.current}${interim ? ` ${interim}` : ""}`.trim();
      onTranscript?.(combined, { interim: interim.trim(), final: finalAccumRef.current });
    };

    rec.onerror = (ev: SpeechRecognitionErrorEvent) => {
      const mapped = mapError(ev);
      setError(mapped.code === "no_permission" ? "no_permission" : mapped.code === "network" ? "network" : "unknown");
      setErrorMessage(mapped.message);
      setIsListening(false);
      track("voice_listen_stopped", { surface, reason: mapped.code });
    };

    rec.onend = () => {
      setIsListening(false);
      setInterimTranscript("");
      const full = finalAccumRef.current.trim();
      onEnd?.(full);
      track("voice_listen_stopped", { surface, reason: "end" });
    };

    try {
      rec.start();
      setIsListening(true);
      track("voice_listen_started", { surface, lang });
    } catch (e) {
      setError("unknown");
      setErrorMessage(e instanceof Error ? e.message : "Could not start listening.");
      setIsListening(false);
    }
  }, [getCtor, lang, onEnd, onTranscript, surface]);

  useEffect(() => {
    return () => {
      const rec = recognitionRef.current;
      if (rec) {
        try {
          rec.abort();
        } catch {
          /* ignore */
        }
      }
    };
  }, []);

  const resetError = useCallback(() => {
    setError(null);
    setErrorMessage(null);
  }, []);

  return {
    isSupported,
    isListening,
    interimTranscript,
    error,
    errorMessage,
    start,
    stop,
    resetError,
  };
}
