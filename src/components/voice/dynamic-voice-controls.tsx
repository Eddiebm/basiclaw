"use client";

import dynamic from "next/dynamic";

function DictationSlot() {
  return (
    <span
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--muted)]/25"
      aria-hidden
    />
  );
}

function ReadAloudSlot() {
  return (
    <span
      className="inline-flex h-8 min-w-[2rem] shrink-0 items-center justify-center rounded-md bg-[var(--muted)]/25"
      aria-hidden
    />
  );
}

export const VoiceDictationButton = dynamic(
  () => import("./VoiceDictationButton").then((m) => m.VoiceDictationButton),
  { ssr: false, loading: () => <DictationSlot /> },
);

export const ReadAloudButton = dynamic(
  () => import("./ReadAloudButton").then((m) => m.ReadAloudButton),
  { ssr: false, loading: () => <ReadAloudSlot /> },
);
