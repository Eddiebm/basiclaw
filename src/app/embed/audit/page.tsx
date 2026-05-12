import { EmbedAuditClient } from "@/components/embed/EmbedAuditClient";
import { parseAccentHex, parseEmbedBorder, parseEmbedTheme } from "@/lib/embed-params";
import { getCountry } from "@/lib/jurisdictions";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function first(sp: Record<string, string | string[] | undefined>, key: string): string | undefined {
  const v = sp[key];
  return Array.isArray(v) ? v[0] : v;
}

export default async function EmbedAuditPage({ searchParams }: Props) {
  const sp = await searchParams;
  const theme = parseEmbedTheme(first(sp, "theme"));
  const accent = parseAccentHex(first(sp, "accent"));
  const border = parseEmbedBorder(first(sp, "border"));
  const countryRaw = first(sp, "country") ?? first(sp, "jurisdiction") ?? "us";
  const initial = (getCountry(countryRaw)?.code ?? "us").toLowerCase();
  const locale = first(sp, "locale");
  const auditType = first(sp, "auditType") ?? first(sp, "type");
  return (
    <EmbedAuditClient
      theme={theme}
      accentCss={accent}
      border={border}
      initialCountry={initial}
      auditTypeParam={auditType ?? null}
      localeParam={locale ?? null}
    />
  );
}
