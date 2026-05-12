import type { Metadata } from "next";
import { Suspense } from "react";
import { Navigation } from "@/components/sections/Navigation";
import { Footer } from "@/components/sections/Footer";
import { SharedAuditClient } from "./SharedAuditClient";

export const metadata: Metadata = {
  title: "Shared audit \u2014 BasicLaw",
  description: "Someone shared a plain-language contract risk audit with you.",
  robots: { index: false, follow: false },
};

export default function SharedAuditPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <section className="pt-28 pb-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-2">
            Someone shared this audit with you
          </h1>
          <p className="text-[var(--muted-foreground)] mb-8">
            Opens a saved audit from a signed link, or decodes a legacy share from the URL fragment in your browser.
          </p>
          <Suspense fallback={null}>
            <SharedAuditClient />
          </Suspense>
        </div>
      </section>
      <Footer />
    </main>
  );
}
