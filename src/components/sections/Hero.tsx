"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  FileText,
  Globe,
  Library,
  MessageCircle,
  Shield,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { countryStats } from "@/lib/jurisdictions";

export function Hero() {
  const stats = countryStats();

  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 via-transparent to-[var(--primary)]/10" />
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.04]"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        <div className="absolute -top-32 -right-24 h-96 w-96 rounded-full bg-[var(--primary)]/15 blur-3xl" />
        <div className="absolute top-1/3 -left-24 h-72 w-72 rounded-full bg-[var(--primary)]/10 blur-3xl" />
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4" aria-hidden />
                {stats.total} constitutions · plain language · zero jargon
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--foreground)] leading-[1.05] mb-6">
                Stop guessing what the law says about{" "}
                <span className="text-[var(--primary)]">your life</span>.
              </h1>
              <p className="text-lg sm:text-xl text-[var(--muted-foreground)] mb-8 max-w-xl mx-auto lg:mx-0">
                BasicLaw turns the constitution and core laws of every country in the world into clear answers anyone can read. No subscriptions to a lawyer just to know your rights.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button asChild size="lg" className="gap-2">
                  <Link href="/chat">
                    Ask a question <MessageCircle className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="gap-2">
                  <Link href="/constitutions">
                    Browse all {stats.total} constitutions <Library className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <p className="mt-4 text-xs text-[var(--muted-foreground)]">
                Free to read. Educational only — never a substitute for a licensed lawyer.
              </p>
            </motion.div>
          </div>
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="col-span-2 sm:col-span-1 p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-lg"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-[var(--primary)]/10">
                    <MessageCircle className="h-5 w-5 text-[var(--primary)]" />
                  </div>
                  <span className="font-semibold text-[var(--foreground)]">Legal Q&amp;A</span>
                </div>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Ask a question in plain language. Get a clear, jurisdiction-aware answer with the disclaimer baked in.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="col-span-2 sm:col-span-1 p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-lg"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-[var(--secondary)]/30">
                    <FileText className="h-5 w-5 text-[var(--secondary-foreground)]" />
                  </div>
                  <span className="font-semibold text-[var(--foreground)]">Document help</span>
                </div>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Paste a contract, a notice, or a policy. We&apos;ll explain what it means and what you should look out for.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="col-span-2 p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-lg"
              >
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[var(--accent)]">
                      <Library className="h-5 w-5 text-[var(--accent-foreground)]" />
                    </div>
                    <div>
                      <span className="block font-semibold text-[var(--foreground)]">The Constitution Library</span>
                      <span className="text-sm text-[var(--muted-foreground)]">Every country, summarised in plain language with key principles and links to the official source.</span>
                    </div>
                  </div>
                  <Link
                    href="/constitutions"
                    className="inline-flex items-center gap-1 text-sm font-medium text-[var(--primary)] hover:underline"
                  >
                    Open library <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-16 pt-8 border-t border-[var(--border)]"
        >
          <div className="flex flex-wrap items-center justify-center gap-8 text-[var(--muted-foreground)]">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <span className="text-sm">Educational only</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              <span className="text-sm">{stats.total} jurisdictions</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              <span className="text-sm">Plain language</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
