"use client";

import { Link } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AuditReportCard } from "@/components/audit/AuditReportCard";
import type { AuditReport } from "@/lib/audit-types";
import { normaliseAuditType } from "@/lib/audit-engine";

function decodeLegacyFragment(hash: string): AuditReport | null {
  try {
    const trimmed = hash.startsWith("#") ? hash.slice(1) : hash;
    if (!trimmed) return null;
    const decoded = decodeURIComponent(escape(atob(trimmed)));
    const parsed = JSON.parse(decoded) as Partial<AuditReport> & { overallRiskGrade?: string; documentType?: string };
    if (!parsed?.overallRiskGrade || !parsed.documentType) return null;
    const auditType = normaliseAuditType(typeof parsed.auditType === "string" ? parsed.auditType : null);
    return { ...parsed, auditType } as AuditReport;
  } catch {
    return null;
  }
}

export function SharedAuditClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("t")?.trim() ?? "";
  const [state, setState] = useState<{ loaded: boolean; report: AuditReport | null; error: string | null }>({
    loaded: false,
    report: null,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (token) {
        const res = await fetch(`/api/share/audit?t=${encodeURIComponent(token)}`);
        const json = (await res.json().catch(() => null)) as { report?: AuditReport; error?: string } | null;
        if (cancelled) return;
        if (!res.ok) {
          setState({ loaded: true, report: null, error: json?.error ?? "invalid_token" });
          return;
        }
        if (json?.report) {
          setState({ loaded: true, report: json.report as AuditReport, error: null });
          return;
        }
        setState({ loaded: true, report: null, error: "not_found" });
        return;
      }
      const decoded = decodeLegacyFragment(typeof window !== "undefined" ? window.location.hash : "");
      setState({ loaded: true, report: decoded, error: null });
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (!state.loaded) return null;
  const { report, error } = state;

  if (!report) {
    return (
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 text-center">
        <FileQuestion className="mx-auto h-10 w-10 text-[var(--muted-foreground)]" aria-hidden />
        <p className="mt-4 font-semibold text-[var(--foreground)]">No audit found in this link.</p>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          {error === "invalid_token"
            ? "This share link is invalid or has expired."
            : "The link may have been truncated by the messaging app you used. Ask the sender to share again from their BasicLaw dashboard."}
        </p>
        <Button asChild className="mt-6 gap-2">
          <Link href="/audit">
            Run your own audit <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AuditReportCard report={report} showShareButton={false} />
      <div className="text-center">
        <Button asChild className="gap-2">
          <Link href="/audit">
            Audit your own document <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
