import type { Metadata } from "next";
import fs from "node:fs/promises";
import path from "node:path";
import { notFound } from "next/navigation";
import { Navigation } from "@/components/sections/Navigation";
import { Footer } from "@/components/sections/Footer";
import { routing } from "@/i18n/routing";

export function generateStaticParams(): { locale: string }[] {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "Launch playbook — BasicLaw",
  robots: { index: false, follow: false },
};

async function readLaunchDocs(): Promise<{ name: string; content: string }[]> {
  const root = path.join(process.cwd(), "docs", "launch");
  const out: { name: string; content: string }[] = [];
  try {
    const entries = await fs.readdir(root, { withFileTypes: true });
    const files = entries.filter((e) => e.isFile() && e.name.endsWith(".md")).map((e) => e.name);
    files.sort((a, b) => {
      if (a === "README.md") return -1;
      if (b === "README.md") return 1;
      return a.localeCompare(b);
    });
    for (const f of files) {
      const content = await fs.readFile(path.join(root, f), "utf-8");
      out.push({ name: f, content });
    }
    const postsDir = path.join(root, "posts");
    try {
      const postFiles = (await fs.readdir(postsDir)).filter((n) => n.endsWith(".md")).sort();
      for (const f of postFiles) {
        const content = await fs.readFile(path.join(postsDir, f), "utf-8");
        out.push({ name: `posts/${f}`, content });
      }
    } catch {
      /* optional */
    }
  } catch {
    return [];
  }
  return out;
}

export default async function LaunchPlaybookPage({
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

  const docs = await readLaunchDocs();

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <Navigation />
      <div className="mx-auto max-w-4xl px-4 py-28 space-y-12">
        <header>
          <h1 className="text-3xl font-bold">Launch playbook</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-2">
            Internal dashboard — not indexed. Source files live in <code className="text-xs">docs/launch/</code>.
          </p>
        </header>
        {docs.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">No markdown files found under docs/launch.</p>
        ) : (
          docs.map((d) => (
            <section key={d.name} className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/40 p-6">
              <h2 className="text-lg font-semibold mb-4 font-mono">{d.name}</h2>
              <pre className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--foreground)] font-sans">{d.content}</pre>
            </section>
          ))
        )}
      </div>
      <Footer />
    </main>
  );
}
