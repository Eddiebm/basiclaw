import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Chrome,
  FileText,
  Gauge,
  Globe,
  Lock,
  MessageSquareQuote,
  ScanText,
  Scale,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { Navigation } from "@/components/sections/Navigation";
import { Footer } from "@/components/sections/Footer";

const CHROME_STORE_URL = "#chrome-web-store-coming-soon";
const FIREFOX_STORE_URL = "#firefox-add-ons-coming-soon";
const EDGE_STORE_URL = "#edge-addons-coming-soon";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const title = "BasicLaw browser extension — audit any Terms or contract in one click";
  const description =
    "Right-click the page you're reading. Get a plain-language audit — risk grade, red flags, pushback lines — for any Terms of Service, lease, employment letter, or contract. Free. Educational only.";
  return {
    title,
    description,
    alternates: { canonical: `/${locale}/extension` },
    openGraph: {
      title,
      description,
      url: `/${locale}/extension`,
      type: "website",
    },
  };
}

export default async function ExtensionPage() {
  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "BasicLaw Browser Extension",
    operatingSystem: "Chrome, Edge, Firefox",
    applicationCategory: "BrowserApplication",
    description:
      "One-click plain-language audit of the Terms of Service, lease, or contract on the page you're reading.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    publisher: {
      "@type": "Organization",
      name: "BasicLaw",
      url: "https://basiclaw.vercel.app",
    },
    url: "https://basiclaw.vercel.app/extension",
  };

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <Navigation />

      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 via-transparent to-[var(--primary)]/10" />
          <div className="absolute -top-32 -right-24 h-96 w-96 rounded-full bg-[var(--primary)]/15 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4" aria-hidden /> Free · educational only
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--foreground)] leading-[1.05] mb-6">
                Audit any Terms or contract{" "}
                <span className="text-[var(--primary)]">in one click</span>.
              </h1>
              <p className="text-lg sm:text-xl text-[var(--muted-foreground)] mb-8 max-w-xl">
                The BasicLaw extension reads the contract on whatever page
                you&apos;re on — Terms of Service, lease, offer letter, NDA — and
                gives you a plain-language risk audit before you click Accept.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={CHROME_STORE_URL}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold hover:opacity-90 transition"
                >
                  <Chrome className="h-5 w-5" aria-hidden /> Add to Chrome
                </a>
                <a
                  href={FIREFOX_STORE_URL}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] font-semibold hover:border-[var(--primary)] transition"
                >
                  <Globe className="h-5 w-5" aria-hidden /> Add to Firefox
                </a>
                <a
                  href={EDGE_STORE_URL}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] font-semibold hover:border-[var(--primary)] transition"
                >
                  <Globe className="h-5 w-5" aria-hidden /> Edge
                </a>
              </div>
              <p className="mt-4 text-sm text-[var(--muted-foreground)]">
                Store listings rolling out. Until then, follow the{" "}
                <a
                  href="https://github.com/Eddiebm/basiclaw/tree/master/extension#local-development"
                  className="underline underline-offset-4 hover:text-[var(--foreground)]"
                  target="_blank"
                  rel="noreferrer"
                >
                  unpacked-install guide on GitHub
                </a>{" "}
                to side-load the dev build.
              </p>
              <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                Educational only — never a substitute for a licensed lawyer.
              </p>
            </div>

            <div className="relative">
              <ExtensionPreviewCard />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[var(--accent)]/20 border-y border-[var(--border)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)]">
              What you get the moment you click&nbsp;Audit.
            </h2>
            <p className="mt-3 text-lg text-[var(--muted-foreground)]">
              Same audit engine as the web app. No copy-paste step — the
              extension reads the page text for you.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Gauge className="h-5 w-5" />}
              title="One-glance risk grade"
              body="Low → critical, color-coded. So you know in two seconds whether to read the rest."
            />
            <FeatureCard
              icon={<ScanText className="h-5 w-5" />}
              title="Smart text extraction"
              body="Mozilla's Readability finds the contract body and ignores headers, ads, and chrome. Highlight a region first to override."
            />
            <FeatureCard
              icon={<FileText className="h-5 w-5" />}
              title="Auto-detect document type"
              body="Lease, employment, or Terms — the extension picks the right specialised checklist (deposits / non-competes / arbitration)."
            />
            <FeatureCard
              icon={<MessageSquareQuote className="h-5 w-5" />}
              title="Push-back lines you can copy"
              body="Every red flag comes with the exact one-sentence ask to put in writing to the other side."
            />
            <FeatureCard
              icon={<Globe className="h-5 w-5" />}
              title="Jurisdiction-aware"
              body="Pick your country in the popup. The audit re-frames around the legal system you're in."
            />
            <FeatureCard
              icon={<Scale className="h-5 w-5" />}
              title="“Ask a lawyer if…” triggers"
              body="Specific moments worth a paid consult, instead of a vague “consider getting legal advice.”"
            />
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] text-center mb-12">
            Three clicks, one audit.
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <Step
              n={1}
              title="Open any contract page"
              body="A Terms of Service in front of a Sign-up button. A lease PDF in your browser. An offer letter your boss emailed you. Anything legalese."
            />
            <Step
              n={2}
              title="Click the BasicLaw button"
              body="Pick your jurisdiction. Optionally pin the audit type, or let it auto-detect. Hit Audit this page."
            />
            <Step
              n={3}
              title="Read the plain-language report"
              body="Risk grade, red flags, positives, push-back lines, and a deep-link to the full audit on basiclaw.app."
            />
          </div>
        </div>
      </section>

      <section className="py-16 bg-[var(--accent)]/20 border-y border-[var(--border)]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-10 text-center">
            <p className="text-xs uppercase tracking-wider text-[var(--muted-foreground)] mb-3">
              Demo
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-4">
              30-second walk-through
            </h2>
            <p className="text-[var(--muted-foreground)] mb-6 max-w-2xl mx-auto">
              Animated walk-through coming soon. In the meantime, the
              extension popup mirrors the web audit at /audit — same engine,
              same disclaimer, no copy-paste step.
            </p>
            <div className="mx-auto max-w-3xl aspect-video rounded-2xl border border-dashed border-[var(--border)] bg-[var(--background)] flex items-center justify-center text-[var(--muted-foreground)] text-sm">
              [Demo GIF placeholder — drop a recording at /public/extension/demo.gif]
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-[var(--primary)]/10">
                <Lock className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--foreground)]">
                Private by design
              </h2>
            </div>
            <ul className="space-y-3 text-sm text-[var(--muted-foreground)]">
              <PrivacyItem>
                Page text is sent <strong>only</strong> when you press Audit.
                Nothing is read automatically as you browse.
              </PrivacyItem>
              <PrivacyItem>
                No document text is saved on your device, in your browser
                storage, or in our database.
              </PrivacyItem>
              <PrivacyItem>
                Only your last-selected jurisdiction is remembered (so you
                don&apos;t have to re-pick it every audit).
              </PrivacyItem>
              <PrivacyItem>
                No analytics in the extension by default. We respect Do Not
                Track and we don&apos;t bundle a tracker SDK.
              </PrivacyItem>
              <PrivacyItem>
                Minimum permissions: <code>activeTab</code> +{" "}
                <code>scripting</code> only. Host access is limited to{" "}
                <code>basiclaw.vercel.app</code> for the audit API.
              </PrivacyItem>
            </ul>
            <p className="mt-6 text-sm">
              <Link
                href="/privacy"
                className="text-[var(--primary)] underline-offset-4 hover:underline"
              >
                Read the full privacy policy →
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-4">
            Stop guessing before you click Accept.
          </h2>
          <p className="text-lg text-[var(--muted-foreground)] mb-8">
            Install BasicLaw once. Read anything legalese with a real audit
            beside you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={CHROME_STORE_URL}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold hover:opacity-90 transition"
            >
              <Chrome className="h-5 w-5" aria-hidden /> Add to Chrome
            </a>
            <a
              href={FIREFOX_STORE_URL}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] font-semibold hover:border-[var(--primary)] transition"
            >
              <Globe className="h-5 w-5" aria-hidden /> Add to Firefox
            </a>
            <Link
              href="/audit"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] font-semibold hover:border-[var(--primary)] transition"
            >
              Or try the web audit <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
          {icon}
        </div>
        <h3 className="font-semibold text-[var(--foreground)]">{title}</h3>
      </div>
      <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{body}</p>
    </div>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-left">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-sm font-semibold">
        {n}
      </span>
      <p className="mt-3 font-semibold text-[var(--foreground)]">{title}</p>
      <p className="mt-1 text-sm text-[var(--muted-foreground)] leading-relaxed">{body}</p>
    </div>
  );
}

function PrivacyItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <CheckCircle2
        className="h-5 w-5 mt-0.5 text-[var(--primary)] flex-shrink-0"
        aria-hidden
      />
      <span>{children}</span>
    </li>
  );
}

function ExtensionPreviewCard() {
  return (
    <div className="relative mx-auto max-w-md">
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)] bg-[var(--accent)]/40">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <span className="ml-3 text-xs text-[var(--muted-foreground)] truncate">
            example-saas.com/terms
          </span>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-md bg-[var(--primary)] flex items-center justify-center">
              <Scale className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">BasicLaw</p>
              <p className="text-xs text-[var(--muted-foreground)]">
                Audit the contract on this page
              </p>
            </div>
          </div>
          <div className="space-y-2 mb-4">
            <Field label="Jurisdiction" value="🇺🇸 United States" />
            <Field label="Audit type" value="Auto-detect from page" />
          </div>
          <button
            type="button"
            className="w-full py-2.5 rounded-lg bg-[var(--primary)] text-white text-sm font-semibold flex items-center justify-center gap-2 cursor-default"
          >
            <Zap className="h-4 w-4" /> Audit this page
          </button>
          <div className="mt-4 p-3 rounded-lg bg-[var(--accent)] border border-[var(--border)]">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs uppercase tracking-wider text-[var(--muted-foreground)]">
                Terms of Service · US
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-700 border border-amber-500/30">
                High risk
              </span>
            </div>
            <p className="text-xs text-[var(--foreground)] mb-2">
              Class-action waiver, broad data licence, and 30-day auto-renewal
              with no cancellation window.
            </p>
            <div className="flex items-center gap-2 text-xs text-[var(--primary)]">
              <ShieldCheck className="h-3.5 w-3.5" />4 red flags · 2 positives
            </div>
          </div>
          <p className="mt-4 text-[10px] text-[var(--muted-foreground)] text-center">
            Educational only · nothing stored on your device
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2">
      <span className="text-xs uppercase tracking-wider text-[var(--muted-foreground)]">
        {label}
      </span>
      <span className="text-sm text-[var(--foreground)]">{value}</span>
    </div>
  );
}
