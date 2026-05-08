"use client";

import { motion } from "framer-motion";
import { MessageCircle, FileText, BookOpen, Globe, Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 via-transparent to-[var(--primary)]/10" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-sm font-medium mb-6">
                <Globe className="h-4 w-4" />
                Available in 3 Countries
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--foreground)] leading-[1.1] mb-6">
                Law for <span className="text-[var(--primary)]">Ordinary </span>People
              </h1>
              <p className="text-lg sm:text-xl text-[var(--muted-foreground)] mb-8 max-w-xl mx-auto lg:mx-0">
                Understand your rights, navigate legal systems, and make informed decisions — without needing a law degree. Clear explanations. No jargon. Just helpful.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" className="gap-2">Ask a Question <MessageCircle className="h-4 w-4" /></Button>
                <Button size="lg" variant="outline" className="gap-2">Start Learning <BookOpen className="h-4 w-4" /></Button>
              </div>
            </motion.div>
          </div>
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="col-span-2 sm:col-span-1 p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-lg">
                <div className="flex items-center gap-3 mb-4"><div className="p-2 rounded-lg bg-[var(--primary)]/10"><MessageCircle className="h-5 w-5 text-[var(--primary)]" /></div><span className="font-semibold text-[var(--foreground)]">Legal Q&A</span></div>
                <p className="text-sm text-[var(--muted-foreground)]">Ask questions in plain language. Get clear, educational answers.</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="col-span-2 sm:col-span-1 p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-lg">
                <div className="flex items-center gap-3 mb-4"><div className="p-2 rounded-lg bg-[var(--secondary)]/10"><FileText className="h-5 w-5 text-[var(--secondary)]" /></div><span className="font-semibold text-[var(--foreground)]">Document Help</span></div>
                <p className="text-sm text-[var(--muted-foreground)]">Upload legal documents and get plain-language explanations.</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="col-span-2 p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-lg">
                <div className="flex items-center gap-3 mb-4"><div className="p-2 rounded-lg bg-[var(--accent)]"><BookOpen className="h-5 w-5 text-[var(--accent-foreground)]" /></div><span className="font-semibold text-[var(--foreground)]">Law School</span></div>
                <p className="text-sm text-[var(--muted-foreground)]">Learn legal concepts step by step. From arrests to contracts.</p>
              </motion.div>
            </div>
          </div>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} className="mt-16 pt-8 border-t border-[var(--border)]">
          <div className="flex flex-wrap items-center justify-center gap-8 text-[var(--muted-foreground)]">
            <div className="flex items-center gap-2"><Shield className="h-5 w-5" /><span className="text-sm">Educational Only</span></div>
            <div className="flex items-center gap-2"><Globe className="h-5 w-5" /><span className="text-sm">3 Jurisdictions</span></div>
            <div className="flex items-center gap-2"><BookOpen className="h-5 w-5" /><span className="text-sm">Plain Language</span></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
