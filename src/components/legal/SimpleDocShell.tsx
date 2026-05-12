import type { ReactNode } from "react";
import { Navigation } from "@/components/sections/Navigation";
import { Footer } from "@/components/sections/Footer";

export function SimpleDocShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen">
      <Navigation />
      <article className="pt-28 pb-16">
        <div className="mx-auto max-w-3xl space-y-6 px-4 sm:px-6 lg:px-8">
          <header>
            <h1 className="text-4xl font-bold text-[var(--foreground)]">{title}</h1>
            {subtitle ? <p className="mt-2 text-lg text-[var(--muted-foreground)]">{subtitle}</p> : null}
          </header>
          <div className="space-y-4 text-sm leading-relaxed text-[var(--muted-foreground)]">{children}</div>
        </div>
      </article>
      <Footer />
    </main>
  );
}
