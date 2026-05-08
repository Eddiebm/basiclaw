import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { ChatProvider } from "@/store/chat-context";

export const metadata: Metadata = {
  title: "BasicLaw - Law for Ordinary People",
  description: "Understanding legal systems, rights, and procedures in plain language. Educational legal literacy for everyone, everywhere.",
  keywords: ["legal literacy", "legal education", "know your rights", "law for non-lawyers", "legal help", "legal understanding"],
  authors: [{ name: "BasicLaw" }],
  openGraph: { title: "BasicLaw - Law for Ordinary People", description: "Understanding legal systems, rights, and procedures in plain language.", type: "website", locale: "en_US", siteName: "BasicLaw" },
  twitter: { card: "summary_large_image", title: "BasicLaw - Law for Ordinary People", description: "Understanding legal systems, rights, and procedures in plain language." },
  robots: { index: true, follow: true },
  viewport: { width: "device-width", initialScale: 1 },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><link rel="icon" href="/favicon.svg" type="image/svg+xml" /></head>
      <body className="antialiased min-h-screen bg-background text-foreground">
        <ThemeProvider defaultTheme="system" storageKey="basiclaw-ui-theme">
          <ChatProvider>{children}</ChatProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}