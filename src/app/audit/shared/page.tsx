import type { Metadata } from "next";
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
            The audit is decoded entirely in your browser from the link \u2014 nothing is stored on our servers.
          </p>
          <SharedAuditClient />
        </div>
      </section>
      <Footer />
    </main>
  );
}
