import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/sections/Footer";
import { Navigation } from "@/components/sections/Navigation";
import { runInternalLaunchHealthChecks } from "@/lib/internal-launch-health";
import { routing } from "@/i18n/routing";

export function generateStaticParams(): { locale: string }[] {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "Internal health — BasicLaw",
  robots: { index: false, follow: false },
};

function siteBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
  return raw.replace(/\/$/, "");
}

export default async function InternalHealthPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ key?: string }>;
}) {
  const [{ locale }, sp] = await Promise.all([params, searchParams ?? Promise.resolve({})]);
  void locale;
  const need = process.env.LAUNCH_KEY?.trim();
  const key = typeof sp === "object" && sp && "key" in sp ? String((sp as { key?: string }).key ?? "") : "";
  const isProd = process.env.NODE_ENV === "production";
  if (isProd) {
    if (!need || key !== need) notFound();
  } else if (need && key !== need) {
    notFound();
  }

  const checks = await runInternalLaunchHealthChecks(siteBaseUrl());

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "BasicLaw integration health",
    numberOfItems: checks.length,
    itemListElement: checks.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      description: `${c.status}${c.latencyMs != null ? ` · ${c.latencyMs}ms` : ""}${c.detail ? ` · ${c.detail}` : ""}`,
    })),
  };

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <Navigation />
      <div className="mx-auto max-w-4xl px-4 py-28 space-y-8">
        <header>
          <h1 className="text-3xl font-bold">Internal health</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-2">
            Live checks for embed, Sentry, storage, LLM, Stripe, and Resend. Gated by <code className="text-xs">LAUNCH_KEY</code>{" "}
            (same as launch playbook).
          </p>
        </header>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <ul className="space-y-3">
          {checks.map((c) => (
            <li
              key={c.id}
              className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/50 p-4 flex flex-wrap items-baseline justify-between gap-2"
            >
              <div>
                <p className="font-medium">{c.label}</p>
                {c.detail ? (
                  <p
                    className={`text-xs mt-1 ${
                      c.status === "green"
                        ? "text-[var(--muted-foreground)]"
                        : c.status === "yellow"
                          ? "text-amber-700 dark:text-amber-300"
                          : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {c.status === "green" || c.status === "yellow" ? c.detail : `Last error: ${c.detail}`}
                  </p>
                ) : null}
              </div>
              <div className="text-right text-sm">
                <span
                  className={
                    c.status === "green"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : c.status === "yellow"
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-red-600 dark:text-red-400"
                  }
                >
                  {c.status}
                </span>
                {c.latencyMs != null ? <span className="block text-xs text-[var(--muted-foreground)]">{c.latencyMs}ms</span> : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
      <Footer />
    </main>
  );
}
