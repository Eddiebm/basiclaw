"use client";

import { SegmentError } from "@/components/errors/SegmentError";

export default function ConstitutionDetailError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <SegmentError {...props} />;
}
