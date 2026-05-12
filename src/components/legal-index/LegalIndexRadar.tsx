"use client";

import { motion, useReducedMotion } from "framer-motion";
import { LEGAL_INDEX_DIMENSION_ORDER, type LegalIndexDimensionId } from "@/lib/legal-index";

type Props = {
  dimensions: Record<LegalIndexDimensionId, number>;
  labels: Record<LegalIndexDimensionId, string>;
  caption: string;
};

const CX = 200;
const CY = 200;
const R = 132;
const N = LEGAL_INDEX_DIMENSION_ORDER.length;

function pointsToString(pts: readonly [number, number][]): string {
  return pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
}

function scorePolygon(dimensions: Record<LegalIndexDimensionId, number>): string {
  const pts: [number, number][] = LEGAL_INDEX_DIMENSION_ORDER.map((id, i) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / N;
    const r = (dimensions[id] / 100) * R;
    return [CX + r * Math.cos(angle), CY + r * Math.sin(angle)];
  });
  return pointsToString(pts);
}

function ringPolygon(fraction: number): string {
  const pts: [number, number][] = Array.from({ length: N }, (_, i) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / N;
    const r = R * fraction;
    return [CX + r * Math.cos(angle), CY + r * Math.sin(angle)];
  });
  return pointsToString(pts);
}

export function LegalIndexRadar({ dimensions, labels, caption }: Props) {
  const reduce = useReducedMotion();
  const summary = LEGAL_INDEX_DIMENSION_ORDER.map((id) => `${labels[id]} ${Math.round(dimensions[id])}`).join(", ");

  return (
    <figure className="w-full max-w-md mx-auto">
      <svg
        viewBox="0 0 400 400"
        className="w-full h-auto text-[var(--foreground)]"
        role="img"
        aria-label={`${caption}. ${summary} (all out of 100).`}
      >
        <title>{caption}</title>
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <polygon
            key={f}
            points={ringPolygon(f)}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.08 + f * 0.06}
            strokeWidth={1}
          />
        ))}
        {LEGAL_INDEX_DIMENSION_ORDER.map((id, i) => {
          const angle = -Math.PI / 2 + (2 * Math.PI * i) / N;
          const lx = CX + (R + 28) * Math.cos(angle);
          const ly = CY + (R + 28) * Math.sin(angle);
          const anchor = lx < CX - 20 ? "end" : lx > CX + 20 ? "start" : "middle";
          return (
            <text
              key={id}
              x={lx}
              y={ly}
              textAnchor={anchor}
              dominantBaseline="middle"
              className="fill-[var(--muted-foreground)] text-[10px] sm:text-[11px]"
              style={{ fontFamily: "system-ui, sans-serif" }}
            >
              {labels[id]}
            </text>
          );
        })}
        <motion.polygon
          points={scorePolygon(dimensions)}
          fill="oklch(0.55 0.14 262 / 0.22)"
          stroke="oklch(0.55 0.14 262 / 0.85)"
          strokeWidth={2}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
        {LEGAL_INDEX_DIMENSION_ORDER.map((id, i) => {
          const angle = -Math.PI / 2 + (2 * Math.PI * i) / N;
          const r = (dimensions[id] / 100) * R;
          const x = CX + r * Math.cos(angle);
          const y = CY + r * Math.sin(angle);
          return (
            <circle key={id} cx={x} cy={y} r={4} className="fill-[var(--primary)]" />
          );
        })}
      </svg>
      <figcaption className="mt-2 text-center text-xs text-[var(--muted-foreground)]">{caption}</figcaption>
    </figure>
  );
}
