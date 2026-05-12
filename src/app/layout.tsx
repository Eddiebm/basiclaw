import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Geist, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { ChatProvider } from "@/store/chat-context";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://basiclaw.app";

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fontDisplay = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "BasicLaw — Every country's constitution and rights, in plain language",
    template: "%s | BasicLaw",
  },
  description:
    "Stop guessing what the law says about your life. BasicLaw turns the constitution and core rights of every country in the world into clear answers anyone can read.",
  keywords: [
    "constitution",
    "constitution of every country",
    "legal literacy",
    "know your rights",
    "law for non-lawyers",
    "plain-language law",
    "legal help",
    "constitution library",
  ],
  authors: [{ name: "BasicLaw" }],
  alternates: { canonical: "/" },
  openGraph: {
    title: "BasicLaw — Every country's constitution and rights, in plain language",
    description:
      "Search 195 constitutions. Ask jurisdiction-aware legal questions. Get clear, educational answers — no jargon, no upsell.",
    type: "website",
    locale: "en_US",
    siteName: "BasicLaw",
    url: SITE_URL,
    images: [
      {
        url: "/og",
        width: 1200,
        height: 630,
        alt: "BasicLaw — every country's constitution and rights in plain language",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BasicLaw — Every country's constitution and rights, in plain language",
    description:
      "Search 195 constitutions. Ask jurisdiction-aware legal questions. Get clear, educational answers.",
    images: ["/og"],
  },
  robots: { index: true, follow: true },
};

const ORG_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "BasicLaw",
  url: SITE_URL,
  logo: `${SITE_URL}/icon.svg`,
  description:
    "BasicLaw is a free legal-literacy platform. We translate constitutions and core rights for every country in the world into plain language.",
  sameAs: ["https://github.com/Eddiebm/basiclaw"],
};

const SITE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "BasicLaw",
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/constitutions?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSON_LD) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(SITE_JSON_LD) }}
        />
      </head>
      <body
        className={`${fontSans.variable} ${fontDisplay.variable} ${fontSans.className} antialiased min-h-screen bg-background text-foreground`}
      >
        <ChatProvider>{children}</ChatProvider>
        <Suspense fallback={null}>
          <AnalyticsProvider />
        </Suspense>
      </body>
    </html>
  );
}
