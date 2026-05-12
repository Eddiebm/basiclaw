"use client";

import { SegmentError } from "@/components/errors/SegmentError";

export default function ChatSegmentError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <SegmentError {...props} />;
}
