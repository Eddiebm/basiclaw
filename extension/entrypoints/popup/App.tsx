import { useCallback, useEffect, useState } from "react";
import { JURISDICTIONS, DEFAULT_JURISDICTION } from "@/shared/countries";
import { AUDIT_TYPE_LABEL, detectAuditType } from "@/shared/audit-type";
import type { AuditReport, AuditType } from "@/shared/audit-types";
import { runAudit, siteUrl } from "@/shared/api";
import type { ExtractResponse } from "@/shared/messages";
import { Logo } from "./Logo";
import { ResultPanel } from "./ResultPanel";

type Status = "idle" | "extracting" | "auditing" | "done" | "error";

interface ExtractedPage {
  text: string;
  title: string;
  source: "selection" | "readability" | "fallback";
  pageUrl: string;
}

async function extractFromActiveTab(): Promise<ExtractResponse> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    return { ok: false, error: "Couldn't find the active tab." };
  }
  if (tab.url && (tab.url.startsWith("chrome://") || tab.url.startsWith("about:") || tab.url.startsWith("edge://"))) {
    return {
      ok: false,
      error:
        "Browsers block extensions from reading built-in pages. Open a Terms of Service, lease, or contract page first.",
    };
  }
  return new Promise<ExtractResponse>((resolve) => {
    chrome.tabs.sendMessage(tab.id!, { kind: "extract" }, (response: ExtractResponse | undefined) => {
      if (chrome.runtime.lastError || !response) {
        resolve({
          ok: false,
          error:
            "Couldn't reach this page. Reload the tab after installing BasicLaw, then try again.",
        });
        return;
      }
      resolve(response);
    });
  });
}

export function App() {
  const [jurisdiction, setJurisdiction] = useState<string>(DEFAULT_JURISDICTION);
  const [auditTypeOverride, setAuditTypeOverride] = useState<AuditType | "auto">("auto");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<AuditReport | null>(null);
  const [page, setPage] = useState<ExtractedPage | null>(null);

  useEffect(() => {
    // Restore last-used jurisdiction from chrome.storage.local. We deliberately
    // do not persist any document text — privacy posture is "nothing stored".
    chrome.storage?.local.get("jurisdiction", (data) => {
      const stored = data?.jurisdiction;
      if (typeof stored === "string" && JURISDICTIONS.some((j) => j.code === stored)) {
        setJurisdiction(stored);
      }
    });
  }, []);

  const onJurisdictionChange = (code: string) => {
    setJurisdiction(code);
    chrome.storage?.local.set({ jurisdiction: code });
  };

  const runFlow = useCallback(async () => {
    setError(null);
    setReport(null);
    setStatus("extracting");

    const extracted = await extractFromActiveTab();
    if (!extracted.ok) {
      setStatus("error");
      setError(extracted.error);
      return;
    }
    setPage({
      text: extracted.text,
      title: extracted.title,
      source: extracted.source,
      pageUrl: extracted.pageUrl,
    });

    const auditType =
      auditTypeOverride === "auto" ? detectAuditType(extracted.text) : auditTypeOverride;

    setStatus("auditing");
    const result = await runAudit({
      text: extracted.text,
      jurisdiction,
      auditType,
    });

    if (!result.ok) {
      setStatus("error");
      setError(result.error);
      return;
    }
    setReport(result.report);
    setStatus("done");
  }, [auditTypeOverride, jurisdiction]);

  const isBusy = status === "extracting" || status === "auditing";

  return (
    <>
      <header className="bl-header">
        <div className="bl-logo" aria-hidden>
          <Logo />
        </div>
        <div>
          <p className="bl-title">BasicLaw</p>
          <p className="bl-tagline">Audit the contract on this page</p>
        </div>
      </header>

      {status !== "done" && (
        <div className="bl-body">
          <div className="bl-row">
            <label className="bl-label" htmlFor="bl-jurisdiction">
              Jurisdiction
            </label>
            <select
              id="bl-jurisdiction"
              className="bl-select"
              value={jurisdiction}
              onChange={(event) => onJurisdictionChange(event.target.value)}
              disabled={isBusy}
            >
              {JURISDICTIONS.map((j) => (
                <option key={j.code} value={j.code}>
                  {j.flag} {j.name}
                </option>
              ))}
            </select>
          </div>

          <div className="bl-row">
            <label className="bl-label" htmlFor="bl-audit-type">
              Audit type
            </label>
            <select
              id="bl-audit-type"
              className="bl-select"
              value={auditTypeOverride}
              onChange={(event) => setAuditTypeOverride(event.target.value as AuditType | "auto")}
              disabled={isBusy}
            >
              <option value="auto">Auto-detect from page</option>
              <option value="terms">{AUDIT_TYPE_LABEL.terms}</option>
              <option value="lease">{AUDIT_TYPE_LABEL.lease}</option>
              <option value="employment">{AUDIT_TYPE_LABEL.employment}</option>
              <option value="general">{AUDIT_TYPE_LABEL.general}</option>
            </select>
          </div>

          <button className="bl-button" onClick={runFlow} disabled={isBusy}>
            {isBusy ? (
              <>
                <span className="bl-spinner" aria-hidden />
                {status === "extracting" ? "Reading page…" : "Auditing…"}
              </>
            ) : (
              "Audit this page"
            )}
          </button>

          {error && <div className="bl-error">{error}</div>}

          <p className="bl-privacy">
            <strong>Private by design.</strong> Page text is sent only when you press Audit,
            and only to BasicLaw's API. Nothing is saved on your device or in your browser.
          </p>
        </div>
      )}

      {status === "done" && report && (
        <ResultPanel
          report={report}
          page={page}
          onReset={() => {
            setStatus("idle");
            setReport(null);
            setPage(null);
            setError(null);
          }}
        />
      )}

      <footer className="bl-footer">
        Educational only — never a substitute for a licensed lawyer. ·{" "}
        <a href={siteUrl("/privacy")} target="_blank" rel="noreferrer">
          Privacy
        </a>{" "}
        ·{" "}
        <a href={siteUrl("/")} target="_blank" rel="noreferrer">
          basiclaw.app
        </a>
      </footer>
    </>
  );
}
