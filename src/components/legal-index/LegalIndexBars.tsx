"use client";

import { motion, useReducedMotion } from "framer-motion";
import { LEGAL_INDEX_DIMENSION_ORDER, type LegalIndexDimensionId } from "@/lib/legal-index";

type Props = {
  dimensions: Record<LegalIndexDimensionId, number>;
  labels: Record<LegalIndexDimensionId, string>;
  caption: string;
};

export function LegalIndexBars({ dimensions, labels, caption }: Props) {
  const reduce = useReducedMotion();
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">{caption}</p>
      <ul className="space-y-2.5" aria-label={caption}>
        {LEGAL_INDEX_DIMENSION_ORDER.map((id: LegalIndexDimensionId) => (
          <li key={id} className="grid grid-cols-[minmax(0,1fr)_2.5rem_1fr] items-center gap-2 text-sm">
            <span className="truncate text-[var(--foreground)]">{labels[id]}</span>
            <span className="tabular-nums text-right text-[var(--muted-foreground)]">{Math.round(dimensions[id])}</span>
            <div className="h-2 rounded-full bg-[var(--border)] overflow-hidden" aria-hidden>
              <motion.div
                className="h-full rounded-full bg-[var(--primary)]"
                initial={reduce ? false : { width: 0 }}
                animate={{ width: `${dimensions[id]}%` }}
                transition={{ type: "spring", stiffness: 140, damping: 20, delay: 0.03 }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
