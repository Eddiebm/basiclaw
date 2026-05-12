export type EmbedThemeParam = "light" | "dark" | "auto";
export type EmbedBorderParam = "rounded" | "square";

export function parseEmbedTheme(value: string | null | undefined): EmbedThemeParam {
  const t = (value ?? "auto").toLowerCase();
  if (t === "light" || t === "dark" || t === "auto") return t;
  return "auto";
}

/** Accepts #RGB or #RRGGBB only. */
export function parseAccentHex(value: string | null | undefined): string | null {
  if (!value) return null;
  const s = value.trim();
  if (!/^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(s)) return null;
  return s;
}

export function parseEmbedBorder(value: string | null | undefined): EmbedBorderParam {
  return value?.toLowerCase() === "square" ? "square" : "rounded";
}

/** Only https URLs; used for Pro embed branding. */
export function parseEmbedLogoUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  const s = value.trim();
  if (s.length > 2048) return null;
  try {
    const u = new URL(s);
    if (u.protocol !== "https:") return null;
    return u.toString();
  } catch {
    return null;
  }
}
