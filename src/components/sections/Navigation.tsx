"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Moon, Sun, Globe, Scale, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { useTheme } from "@/contexts/ThemeProvider";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [country, setCountry] = useState("United States");

  const countries = [
    { code: "US", name: "United States", flag: "🇺🇸" },
    { code: "GH", name: "Ghana", flag: "🇬🇭" },
    { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Scale className="h-8 w-8 text-[var(--primary)]" />
            <span className="text-xl font-bold text-[var(--foreground)]">BasicLaw</span>
          </Link>
          <div className="hidden md:flex md:items-center md:gap-8">
            <Link href="/learn" className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">Learn</Link>
            <Link href="/chat" className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">Ask Questions</Link>
            <Link href="/documents" className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">Document Help</Link>
            <Link href="/about" className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">About</Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--accent)]">
              <Globe className="h-4 w-4 text-[var(--muted-foreground)]" />
              <select value={country} onChange={(e) => setCountry(e.target.value)} className="bg-transparent text-sm text-[var(--foreground)] border-none outline-none cursor-pointer">
                {countries.map((c) => (<option key={c.code} value={c.name}>{c.flag} {c.name}</option>))}
              </select>
            </div>
            <Toggle pressed={theme === "dark"} onPressedChange={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Toggle theme" className="h-9 w-9">
              <AnimatePresence mode="wait">
                {theme === "dark" ? (<motion.div key="moon" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><Moon className="h-4 w-4" /></motion.div>) : (<motion.div key="sun" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}><Sun className="h-4 w-4" /></motion.div>)}
              </AnimatePresence>
            </Toggle>
            <Button className="hidden md:inline-flex">Get Started <ArrowRight className="h-4 w-4" /></Button>
            <button className="md:hidden p-2 text-[var(--foreground)]" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">{isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}</button>
          </div>
        </div>
        <AnimatePresence>
          {isOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden py-4 border-t border-[var(--border)]">
              <div className="flex flex-col gap-4">
                <Link href="/learn" className="text-sm font-medium text-[var(--muted-foreground)]" onClick={() => setIsOpen(false)}>Learn</Link>
                <Link href="/chat" className="text-sm font-medium text-[var(--muted-foreground)]" onClick={() => setIsOpen(false)}>Ask Questions</Link>
                <Link href="/documents" className="text-sm font-medium text-[var(--muted-foreground)]" onClick={() => setIsOpen(false)}>Document Help</Link>
                <Link href="/about" className="text-sm font-medium text-[var(--muted-foreground)]" onClick={() => setIsOpen(false)}>About</Link>
                <Button className="w-full">Get Started <ArrowRight className="h-4 w-4" /></Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
