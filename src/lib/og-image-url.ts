/** Visual variants for `/og` — must stay in sync with `src/app/og/route.tsx`. */
export type OgImageKind = "default" | "constitution" | "audit" | "topic" | "compare" | "questions" | "index";

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
  /** Legal Literacy Index OG: flag emoji (single country) */
  flag?: string;
  /** Legal Literacy Index OG: letter grade */
  grade?: string;
  /** Legal Literacy Index OG: overall score label */
  overall?: string;
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
  if (opts.flag) q.set("flag", opts.flag);
  if (opts.grade) q.set("grade", opts.grade);
  if (opts.overall) q.set("overall", opts.overall);
  return `${base}/og?${q.toString()}`;
}
