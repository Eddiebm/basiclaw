import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  runInternalLaunchHealthChecks,
  type InternalHealthRow,
  type InternalHealthStatus,
} from "@/lib/internal-launch-health";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Internal health — BasicLaw",
  robots: { index: false, follow: false },
};

function siteBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
  return raw.replace(/\/$/, "");
}

function statusStyle(s: InternalHealthStatus): string {
  switch (s) {
    case "ok":
      return "text-emerald-700 dark:text-emerald-400";
    case "degraded":
      return "text-amber-700 dark:text-amber-300";
    case "error":
      return "text-red-600 dark:text-red-400";
    case "missing":
      return "text-neutral-500 dark:text-neutral-400";
    default: {
      const _x: never = s;
      return _x;
    }
  }
}

function summarize(rows: InternalHealthRow[]): string {
  const n = rows.length;
  const ok = rows.filter((r) => r.status === "ok").length;
  const degraded = rows.filter((r) => r.status === "degraded").length;
  const err = rows.filter((r) => r.status === "error").length;
  const missing = rows.filter((r) => r.status === "missing").length;
  const parts = [`${ok}/${n} ok`];
  if (missing) parts.push(`${missing} missing`);
  if (err) parts.push(`${err} error`);
  if (degraded) parts.push(`${degraded} degraded`);
  return parts.join(" · ");
}

export default async function InternalHealthPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ key?: string }>;
}) {
  const [{ locale }, sp] = await Promise.all([params, searchParams ?? Promise.resolve({})]);
  const need = process.env.LAUNCH_KEY?.trim();
  const key = typeof sp === "object" && sp && "key" in sp ? String((sp as { key?: string }).key ?? "") : "";
  if (!need || key !== need) notFound();

  const refreshedAt = new Date().toISOString();
  const checks = await runInternalLaunchHealthChecks(siteBaseUrl());
  const refreshHref = `/${locale}/internal/health?key=${encodeURIComponent(key)}`;

  const missingHints = checks
    .filter((c) => c.status === "missing" && c.envHints?.length)
    .map((c) => `${c.name}: ${c.envHints!.join(", ")}`);

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <div className="mx-auto max-w-4xl px-4 py-10 space-y-6">
        <header className="space-y-1">
          <p className="text-lg text-neutral-800 dark:text-neutral-100">
            <span className="font-semibold">Internal health</span>
            <span className="text-neutral-400 dark:text-neutral-500"> · </span>
            <span className="font-normal text-neutral-600 dark:text-neutral-400">
              last refreshed at {refreshedAt}{" "}
              <a className="text-blue-600 underline dark:text-blue-400" href={refreshHref}>
                Refresh
              </a>
            </span>
          </p>
        </header>

        <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900">
              <tr>
                <th className="px-3 py-2 font-medium">Check</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Latency</th>
                <th className="px-3 py-2 font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {checks.map((c) => (
                <tr key={c.id} className="border-b border-neutral-100 last:border-0 dark:border-neutral-800/80">
                  <td className="px-3 py-2 align-top">
                    <div className="font-medium">{c.name}</div>
                    {c.note ? <div className="text-xs text-neutral-500 dark:text-neutral-400">{c.note}</div> : null}
                  </td>
                  <td className={`px-3 py-2 align-top font-medium ${statusStyle(c.status)}`}>{c.status}</td>
                  <td className="px-3 py-2 align-top text-neutral-600 dark:text-neutral-400">
                    {c.latencyMs != null ? `${c.latencyMs} ms` : "—"}
                  </td>
                  <td className="px-3 py-2 align-top text-neutral-700 dark:text-neutral-300">
                    {c.lastError ? <span className="text-red-600 dark:text-red-400">{c.lastError}</span> : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">Summary: {summarize(checks)}</p>

        {missingHints.length ? (
          <section className="rounded-lg border border-dashed border-neutral-300 bg-white p-4 text-sm dark:border-neutral-700 dark:bg-neutral-900">
            <p className="font-medium text-neutral-800 dark:text-neutral-200">Missing configuration</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-neutral-600 dark:text-neutral-400">
              {missingHints.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </main>
  );
}
