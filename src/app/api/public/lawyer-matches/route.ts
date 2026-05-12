import { NextRequest, NextResponse } from "next/server";
import { VERIFIED_LAWYERS } from "@/data/verified-lawyers";
import { matchLawyersForAudit, mergeDirectoryLawyers, toPublicMatch } from "@/lib/lawyer-directory";
import { listApprovedPartnerLawyers } from "@/lib/partner-storage";
import type { AuditType } from "@/lib/audit-types";

const AUDIT_TYPES = new Set<AuditType>(["general", "lease", "employment", "terms", "prenup", "divorce", "demand_letter"]);

export async function GET(request: NextRequest) {
  const country = request.nextUrl.searchParams.get("country")?.trim().toLowerCase() ?? "us";
  const auditTypeRaw = request.nextUrl.searchParams.get("auditType")?.trim() ?? "";
  const auditType = (AUDIT_TYPES.has(auditTypeRaw as AuditType) ? auditTypeRaw : "general") as AuditType;
  const limit = Math.min(10, Math.max(1, Number(request.nextUrl.searchParams.get("limit") || 3) || 3));

  const partners = await listApprovedPartnerLawyers();
  const merged = mergeDirectoryLawyers(VERIFIED_LAWYERS, partners);
  const rows =
    auditType && auditType !== "general"
      ? matchLawyersForAudit(country, auditType, VERIFIED_LAWYERS, partners, limit)
      : merged.filter((l) => l.country.toLowerCase() === country).slice(0, limit);

  return NextResponse.json({
    lawyers: rows.map(toPublicMatch),
  });
}
