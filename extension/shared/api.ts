import type { AuditReport, AuditType } from "./audit-types";

// Replaced at build time by Vite. Falls back to production URL for safety.
declare const __BL_API_BASE__: string;

const API_BASE =
  typeof __BL_API_BASE__ !== "undefined" && __BL_API_BASE__
    ? __BL_API_BASE__
    : "https://basiclaw.vercel.app";

export function siteUrl(path: string = ""): string {
  return `${API_BASE.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

export interface RunAuditInput {
  text: string;
  jurisdiction: string;
  auditType: AuditType | "auto";
}

export interface RunAuditSuccess {
  ok: true;
  report: AuditReport;
}

export interface RunAuditFailure {
  ok: false;
  error: string;
  status?: number;
}

export type RunAuditResult = RunAuditSuccess | RunAuditFailure;

/**
 * POST to BasicLaw's audit API. Done from the background service worker so
 * popup/content scripts never need direct host_permissions for fetch — but in
 * MV3 host_permissions are also declared so a popup-side fetch works too.
 */
export async function runAudit(input: RunAuditInput): Promise<RunAuditResult> {
  try {
    const response = await fetch(siteUrl("/api/audit/extension"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-basiclaw-extension": "1",
      },
      body: JSON.stringify({
        text: input.text,
        jurisdiction: input.jurisdiction,
        auditType: input.auditType,
      }),
    });

    if (!response.ok) {
      let message = `Audit failed (${response.status}).`;
      try {
        const body = (await response.json()) as { message?: string; error?: string };
        message = body.message || body.error || message;
      } catch {
        // ignore parse errors – response wasn't JSON
      }
      return { ok: false, error: message, status: response.status };
    }

    const json = (await response.json()) as { report?: AuditReport; error?: string; message?: string };
    if (!json.report) {
      return {
        ok: false,
        error: json.message || json.error || "Audit API returned an unexpected response.",
      };
    }
    return { ok: true, report: json.report };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error";
    return { ok: false, error: message };
  }
}
