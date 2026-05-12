"use client";

import { SegmentError } from "@/components/errors/SegmentError";

export default function AuditSegmentError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <SegmentError {...props} />;
}
