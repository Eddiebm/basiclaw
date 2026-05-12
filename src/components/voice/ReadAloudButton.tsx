"use client";

import { useEffect } from "react";
import { Volume2, Square } from "lucide-react";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import type { VoiceAnalyticsSurface } from "@/lib/analytics";
import { track } from "@/lib/analytics";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";

export interface ReadAloudButtonProps {
  text: string;
  surface: VoiceAnalyticsSurface;
  dialectHints?: string[];
  className?: string;
  size?: "default" | "icon" | "sm";
  /** Optional visible label (e.g. audit card). */
  label?: string;
  ariaLabel?: string;
}

export function ReadAloudButton({
  text,
  surface,
  dialectHints,
  className,
  size = "icon",
  label,
  ariaLabel,
}: ReadAloudButtonProps) {
  const locale = useLocale();
  const t = useTranslations("voice");

  const synth = useSpeechSynthesis({
    locale,
    onSpeakStarted: () => track("tts_started", { surface }),
    onSpeakEnded: () => track("tts_stopped", { surface }),
    onSpeakError: (message) => track("tts_error", { surface, message }),
  });

  useEffect(() => () => synth.cancel(), [synth]);

  if (!synth.isSupported) return null;

  const speaking = synth.isSpeaking;
  const defaultAria = speaking ? t("readAloudStopAria") : t("readAloudStartAria");

  return (
    <Button
      type="button"
      variant="ghost"
      size={size}
      className={cn("gap-1", className)}
      aria-label={ariaLabel ?? defaultAria}
      aria-pressed={speaking}
      onClick={() => {
        if (speaking) {
          synth.cancel();
          return;
        }
        synth.speak(text, { dialectHints });
      }}
    >
      {label ? <span className="text-xs font-medium">{speaking ? t("readAloudStopTitle") : label}</span> : null}
      {speaking ? <Square className="h-3.5 w-3.5" aria-hidden /> : <Volume2 className="h-3.5 w-3.5" aria-hidden />}
    </Button>
  );
}
