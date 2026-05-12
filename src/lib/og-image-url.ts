/** Visual variants for `/og` — must stay in sync with `src/app/og/route.tsx`. */
export type OgImageKind = "default" | "constitution" | "audit" | "topic" | "compare" | "questions";

export type BuildOgImageUrlOptions = {
  kind: OgImageKind | string;
  title: string;
  subtitle: string;
  /** Compare OG: left flag emoji */
  flagA?: string;
  /** Compare OG: right flag emoji */
  flagB?: string;
  /** Compare OG: topic line under subtitle */
  topic?: string;
};

/** Absolute URL for the dynamic `/og` Open Graph image route. */
export function buildOgImageUrl(site: string, opts: BuildOgImageUrlOptions): string {
  const base = site.replace(/\/$/, "");
  const q = new URLSearchParams({
    kind: opts.kind,
    title: opts.title,
    subtitle: opts.subtitle,
  });
  if (opts.flagA) q.set("flagA", opts.flagA);
  if (opts.flagB) q.set("flagB", opts.flagB);
  if (opts.topic) q.set("topic", opts.topic);
  return `${base}/og?${q.toString()}`;
}
