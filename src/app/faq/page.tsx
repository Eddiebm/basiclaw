import type { Metadata } from "next";
import { Navigation } from "@/components/sections/Navigation";
import { Footer } from "@/components/sections/Footer";
import { HomeFAQ } from "@/components/sections/HomeFAQ";

export const metadata: Metadata = {
  title: "FAQ — Frequently asked questions",
  description:
    "Everything you might want to ask before trusting BasicLaw with a legal question — accuracy, sources, jurisdictions, pricing, and limits.",
  alternates: { canonical: "/faq" },
};

export default function FAQPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <section className="pt-28 pb-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--foreground)] leading-tight">
            BasicLaw, in plain answers.
          </h1>
          <p className="mt-3 text-lg text-[var(--muted-foreground)]">
            What we are, what we are not, and what to expect.
          </p>
        </div>
      </section>
      <HomeFAQ />
      <Footer />
    </main>
  );
}
