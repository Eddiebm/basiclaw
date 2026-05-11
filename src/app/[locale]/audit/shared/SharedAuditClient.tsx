"use client";

import { Link } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AuditReportCard } from "@/components/audit/AuditReportCard";
import type { AuditReport } from "@/lib/audit-types";
import { normaliseAuditType } from "@/lib/audit-engine";

function decodeReport(hash: string): AuditReport | null {
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
  const [state, setState] = useState<{ loaded: boolean; report: AuditReport | null }>({ loaded: false, report: null });

  useEffect(() => {
    const decoded = decodeReport(window.location.hash);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ loaded: true, report: decoded });
  }, []);

  if (!state.loaded) return null;
  const { report } = state;

  if (!report) {
    return (
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 text-center">
        <FileQuestion className="mx-auto h-10 w-10 text-[var(--muted-foreground)]" aria-hidden />
        <p className="mt-4 font-semibold text-[var(--foreground)]">No audit found in this link.</p>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          The link may have been truncated by the messaging app you used. Ask the sender to share the original page.
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
