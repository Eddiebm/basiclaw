"use client";

import { useCallback, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  FileText,
  Loader2,
  ShieldAlert,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { COUNTRIES } from "@/data/countries";
import { getPopularCountries } from "@/lib/jurisdictions";
import { AuditReportCard } from "@/components/audit/AuditReportCard";
import type { AuditReport } from "@/lib/audit-types";
import { track } from "@/lib/analytics";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ".pdf,.txt,.md";

export function AuditClient() {
  const popularCountries = useMemo(() => getPopularCountries(8), []);
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [jurisdiction, setJurisdiction] = useState("us");
  const [documentType, setDocumentType] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<AuditReport | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = useCallback((f: File | null) => {
    setError(null);
    if (!f) {
      setFile(null);
      return;
    }
    if (f.size > MAX_BYTES) {
      setError("File too large \u2014 max 5MB.");
      return;
    }
    setFile(f);
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLLabelElement>) => {
      event.preventDefault();
      setDragActive(false);
      const f = event.dataTransfer.files?.[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragActive(true);
  }, []);

  const onDragLeave = useCallback(() => setDragActive(false), []);

  async function submit() {
    setError(null);
    if (!file && text.trim().length < 200) {
      setError("Paste at least 200 characters of the document, or upload a file.");
      return;
    }
    setSubmitting(true);
    setReport(null);
    track("audit_started", {
      jurisdiction,
      input_type: file ? "file" : "text",
      document_type: documentType || null,
      char_count: text.length,
      file_size: file?.size ?? null,
    });
    try {
      let res: Response;
      if (file) {
        const form = new FormData();
        form.set("file", file);
        if (text.trim()) form.set("text", text);
        form.set("jurisdiction", jurisdiction);
        if (documentType) form.set("documentType", documentType);
        res = await fetch("/api/audit", { method: "POST", body: form });
      } else {
        res = await fetch("/api/audit", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ text, jurisdiction, documentType: documentType || undefined }),
        });
      }
      const json = (await res.json()) as { report?: AuditReport; error?: string; message?: string };
      if (json.report) {
        setReport(json.report);
        track("audit_completed", {
          jurisdiction: json.report.jurisdictionCode,
          document_type: json.report.documentType,
          risk_grade: json.report.overallRiskGrade,
          red_flags: json.report.redFlags.length,
        });
      } else {
        setError(json.message ?? json.error ?? "Audit failed. Try a shorter excerpt.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setReport(null);
    setError(null);
  }

  if (report) {
    return (
      <div className="space-y-6">
        <AuditReportCard
          report={report}
          onShared={() =>
            track("audit_shared", {
              jurisdiction: report.jurisdictionCode,
              risk_grade: report.overallRiskGrade,
            })
          }
        />
        <div className="flex justify-center">
          <Button variant="outline" onClick={reset}>Audit another document</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="audit-jurisdiction" className="block text-xs uppercase tracking-wider text-[var(--muted-foreground)] mb-1">
            Jurisdiction
          </label>
          <select
            id="audit-jurisdiction"
            value={jurisdiction}
            onChange={(e) => setJurisdiction(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
          >
            <optgroup label="Most chosen">
              {popularCountries.map((c) => (
                <option key={c.code} value={c.code.toLowerCase()}>{c.flag} {c.name}</option>
              ))}
            </optgroup>
            <optgroup label="All countries">
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code.toLowerCase()}>{c.flag} {c.name}</option>
              ))}
            </optgroup>
          </select>
        </div>
        <div>
          <label htmlFor="audit-doctype" className="block text-xs uppercase tracking-wider text-[var(--muted-foreground)] mb-1">
            Document type (optional)
          </label>
          <input
            id="audit-doctype"
            type="text"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            placeholder="e.g. Residential lease, employment contract, NDA"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
          />
        </div>
      </div>

      <label
        htmlFor="audit-file"
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
          dragActive
            ? "border-[var(--primary)] bg-[var(--primary)]/5"
            : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/60"
        }`}
      >
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
          <Upload className="h-5 w-5" aria-hidden />
        </span>
        <span className="font-medium text-[var(--foreground)]">
          {file ? file.name : "Drop a file or click to upload"}
        </span>
        <span className="text-xs text-[var(--muted-foreground)]">
          PDF, TXT, or Markdown \u00b7 max 5MB \u00b7 your file is read in memory and not stored
        </span>
        <input
          id="audit-file"
          type="file"
          accept={ACCEPTED}
          className="sr-only"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
      </label>

      <div>
        <label htmlFor="audit-text" className="block text-xs uppercase tracking-wider text-[var(--muted-foreground)] mb-1">
          \u2026 or paste text directly
        </label>
        <textarea
          id="audit-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          placeholder="Paste the contract, lease, employment letter, terms, or notice. Min ~200 characters."
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
        />
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          {text.length.toLocaleString()} characters
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-200 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 mt-0.5" aria-hidden />
          <p>{error}</p>
        </div>
      )}

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-xs text-[var(--muted-foreground)] flex items-start gap-3">
        <ShieldAlert className="h-4 w-4 mt-0.5 text-[var(--primary)] flex-shrink-0" aria-hidden />
        <p>
          We do not store your document. The text is sent to the model for analysis and discarded after the response.
          The audit is educational only \u2014 not legal advice. For anything you have to sign, talk to a licensed lawyer.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={submit} disabled={submitting} className="gap-2">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
          {submitting ? "Auditing\u2026" : "Run audit"}
          {!submitting && <ArrowRight className="h-4 w-4" />}
        </Button>
        {file && (
          <Button variant="outline" onClick={() => handleFile(null)}>
            Remove file
          </Button>
        )}
      </div>
    </div>
  );
}
