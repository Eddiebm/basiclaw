import type { LawyerVerifiedVia, VerifiedLawyer } from "@/data/verified-lawyers";
import type { PartnerLawyer } from "@/lib/partner-storage";
import type { AuditType } from "@/lib/audit-types";

export type DirectoryLawyerKind = "verified" | "partner";

export type DirectoryLawyerRow = {
  kind: DirectoryLawyerKind;
  id: string;
  slug: string;
  name: string;
  country: string;
  jurisdiction: string;
  jurisdictions?: string[];
  practiceAreas: string[];
  languages: string[];
  firmName?: string;
  headshotUrl?: string;
  websiteUrl?: string;
  phone?: string;
  email?: string;
  feeStructure?: VerifiedLawyer["feeStructure"];
  acceptsRemoteClients?: boolean;
  notableReviews?: VerifiedLawyer["notableReviews"];
  referralCommissionPct?: number;
  partnerTier?: VerifiedLawyer["partnerTier"];
  statement?: string;
  sourceUrl?: string;
  verifiedVia?: LawyerVerifiedVia;
  verifiedAt?: string;
  disclaimer?: string;
};

const TIER_ORDER: Record<NonNullable<VerifiedLawyer["partnerTier"]>, number> = {
  premium: 0,
  featured: 1,
  directory: 2,
};

function tierRank(row: DirectoryLawyerRow): number {
  const t = row.partnerTier ?? "directory";
  return TIER_ORDER[t] ?? 3;
}

export function mapVerifiedToDirectoryRow(v: VerifiedLawyer): DirectoryLawyerRow {
  return {
    kind: "verified",
    id: v.id,
    slug: v.slug,
    name: v.name,
    country: v.country,
    jurisdiction: v.jurisdiction,
    jurisdictions: v.jurisdictions,
    practiceAreas: v.practiceAreas,
    languages: v.languages,
    firmName: v.firmName,
    headshotUrl: v.headshotUrl,
    websiteUrl: v.websiteUrl,
    phone: v.phone,
    email: v.email,
    feeStructure: v.feeStructure,
    acceptsRemoteClients: v.acceptsRemoteClients,
    notableReviews: v.notableReviews,
    referralCommissionPct: v.referralCommissionPct,
    partnerTier: v.partnerTier,
    statement: v.statement,
    sourceUrl: v.sourceUrl,
    verifiedVia: v.verifiedVia,
    verifiedAt: v.verifiedAt,
    disclaimer: v.disclaimer,
  };
}

export function mapPartnerToDirectoryRow(p: PartnerLawyer): DirectoryLawyerRow {
  return {
    kind: "partner",
    id: p.id,
    slug: p.slug,
    name: p.name,
    country: p.country,
    jurisdiction: p.jurisdiction,
    practiceAreas: p.practiceAreas,
    languages: p.languages,
    firmName: p.firmName,
    headshotUrl: p.headshotUrl,
    websiteUrl: p.websiteUrl,
    phone: p.phone,
    email: p.email,
    feeStructure: p.feeStructure,
    acceptsRemoteClients: p.acceptsRemoteClients,
    notableReviews: p.notableReviews,
    referralCommissionPct: p.referralCommissionPct,
    partnerTier: p.partnerTier,
    statement: p.bio,
  };
}

export function mergeDirectoryLawyers(verified: VerifiedLawyer[], partners: PartnerLawyer[]): DirectoryLawyerRow[] {
  const rows: DirectoryLawyerRow[] = [
    ...verified.map(mapVerifiedToDirectoryRow),
    ...partners.map(mapPartnerToDirectoryRow),
  ];
  rows.sort((a, b) => {
    if (a.kind === "verified" && b.kind !== "verified") return -1;
    if (a.kind !== "verified" && b.kind === "verified") return 1;
    const ta = tierRank(a);
    const tb = tierRank(b);
    if (ta !== tb) return ta - tb;
    return a.name.localeCompare(b.name);
  });
  return rows;
}

function practiceMatchesAudit(row: DirectoryLawyerRow, auditType: AuditType): number {
  const hay = row.practiceAreas.join(" ").toLowerCase();
  const t = auditType;
  let score = 0;
  if (t === "lease" && /(housing|landlord|lease|tenant|rent)/i.test(hay)) score += 3;
  if (t === "employment" && /(employ|workplace|wage|hr)/i.test(hay)) score += 3;
  if (t === "terms" && /(privacy|data|consumer|contract)/i.test(hay)) score += 2;
  if (t === "prenup" && /(family|matrimonial|prenup|divorce)/i.test(hay)) score += 2;
  if (t === "divorce" && /(family|matrimonial|custody|divorce)/i.test(hay)) score += 2;
  if (t === "demand_letter" && /(litigation|civil|commercial|dispute)/i.test(hay)) score += 2;
  if (t === "general") score += 0;
  return score;
}

export function matchLawyersForAudit(
  jurisdictionCode: string,
  auditType: AuditType,
  verified: VerifiedLawyer[],
  partners: PartnerLawyer[],
  limit = 3
): DirectoryLawyerRow[] {
  const country = jurisdictionCode.trim().toUpperCase();
  const merged = mergeDirectoryLawyers(verified, partners);
  const inCountry = merged.filter((l) => l.country.toUpperCase() === country);
  const scored = inCountry
    .map((l) => ({ l, score: practiceMatchesAudit(l, auditType) }))
    .sort((a, b) => b.score - a.score || a.l.name.localeCompare(b.l.name));
  const picks: DirectoryLawyerRow[] = [];
  const seen = new Set<string>();
  for (const { l, score } of scored) {
    if (picks.length >= limit) break;
    if (score > 0 && !seen.has(l.slug)) {
      picks.push(l);
      seen.add(l.slug);
    }
  }
  for (const l of inCountry) {
    if (picks.length >= limit) break;
    if (!seen.has(l.slug)) {
      picks.push(l);
      seen.add(l.slug);
    }
  }
  return picks.slice(0, limit);
}

export type LawyerPublicMatch = Pick<DirectoryLawyerRow, "slug" | "name" | "firmName" | "country" | "headshotUrl" | "practiceAreas" | "kind" | "partnerTier">;

export function toPublicMatch(row: DirectoryLawyerRow): LawyerPublicMatch {
  return {
    slug: row.slug,
    name: row.name,
    firmName: row.firmName,
    country: row.country,
    headshotUrl: row.headshotUrl,
    practiceAreas: row.practiceAreas,
    kind: row.kind,
    partnerTier: row.partnerTier,
  };
}
