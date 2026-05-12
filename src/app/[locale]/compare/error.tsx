"use client";

import { SegmentError } from "@/components/errors/SegmentError";

export default function CompareSegmentError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <SegmentError {...props} />;
}
