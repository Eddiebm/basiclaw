export type OgImageKind = "default" | "constitution" | "audit" | "topic" | "compare";

export interface BuildOgImageUrlOptions {
  kind: OgImageKind;
  title: string;
  subtitle?: string;
  flagA?: string;
  flagB?: string;
  topic?: string;
}

/** Absolute URL for the `/og` image route used in Open Graph metadata. */
export function buildOgImageUrl(site: string, opts: BuildOgImageUrlOptions): string {
  const base = site.replace(/\/$/, "");
  const u = new URL("/og", `${base}/`);
  u.searchParams.set("kind", opts.kind);
  u.searchParams.set("title", opts.title);
  if (opts.subtitle) u.searchParams.set("subtitle", opts.subtitle);
  if (opts.flagA) u.searchParams.set("flagA", opts.flagA);
  if (opts.flagB) u.searchParams.set("flagB", opts.flagB);
  if (opts.topic) u.searchParams.set("topic", opts.topic);
  return u.toString();
}
