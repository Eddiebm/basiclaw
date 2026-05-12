import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Suspense } from "react";
import { Navigation } from "@/components/sections/Navigation";
import { Footer } from "@/components/sections/Footer";
import { DashboardClient } from "./DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard \u2014 BasicLaw",
  description: "Manage your BasicLaw subscription and account.",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <section className="pt-28 pb-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)]">Your dashboard</h1>
          <p className="mt-3 text-[var(--muted-foreground)]">
            Manage your BasicLaw subscription. Full account UI is in flight \u2014 for now this is a thin
            placeholder around the Stripe customer portal.
          </p>
          <Suspense fallback={null}>
            <DashboardClient />
          </Suspense>
          <div className="mt-10 grid gap-3">
            <Link href="/chat" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] underline underline-offset-4">
              \u2192 Open the legal assistant
            </Link>
            <Link href="/constitutions" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] underline underline-offset-4">
              \u2192 Browse the constitution library
            </Link>
            <Link href="/audit" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] underline underline-offset-4">
              \u2192 Audit a contract
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
