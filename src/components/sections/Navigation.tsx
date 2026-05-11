"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  Globe,
  Library,
  Menu,
  Moon,
  Scale,
  Sun,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { useTheme } from "@/contexts/ThemeProvider";
import { searchCountries, getPopularCountries } from "@/lib/jurisdictions";

const NAV_LINKS = [
  { href: "/constitutions", label: "Constitutions" },
  { href: "/audit", label: "Audit" },
  { href: "/chat", label: "Ask" },
  { href: "/learn", label: "Learn" },
  { href: "/pricing", label: "Pricing" },
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [query, setQuery] = useState("");
  const popoverRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!isCountryOpen) return;
    function onClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsCountryOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [isCountryOpen]);

  const popular = useMemo(() => getPopularCountries().slice(0, 6), []);
  const matches = useMemo(() => {
    if (!query.trim()) return [];
    return searchCountries(query).slice(0, 8);
  }, [query]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Scale className="h-8 w-8 text-[var(--primary)]" />
            <span className="text-xl font-bold text-[var(--foreground)]">BasicLaw</span>
          </Link>

          <div className="hidden md:flex md:items-center md:gap-7">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "text-[var(--foreground)]"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div ref={popoverRef} className="hidden sm:block relative">
              <button
                type="button"
                onClick={() => setIsCountryOpen((open) => !open)}
                aria-haspopup="dialog"
                aria-expanded={isCountryOpen}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--accent)] text-sm text-[var(--foreground)] hover:border-[var(--primary)] transition-colors"
              >
                <Globe className="h-4 w-4 text-[var(--muted-foreground)]" aria-hidden />
                Country
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isCountryOpen ? "rotate-180" : ""}`} aria-hidden />
              </button>
              <AnimatePresence>
                {isCountryOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    role="dialog"
                    aria-label="Choose a country"
                    className="absolute right-0 mt-2 w-80 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-lg overflow-hidden"
                  >
                    <div className="p-3">
                      <input
                        autoFocus
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search 195 countries…"
                        aria-label="Search countries"
                        className="w-full h-10 px-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      />
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {matches.length > 0 ? (
                        <ul className="px-2 pb-2 space-y-0.5">
                          {matches.map((country) => (
                            <li key={country.code}>
                              <Link
                                href={`/constitutions/${country.code.toLowerCase()}`}
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-[var(--accent)]/60 transition-colors"
                              >
                                <span className="text-xl" aria-hidden>{country.flag}</span>
                                <span className="text-[var(--foreground)]">{country.name}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <>
                          <p className="px-4 pt-1 pb-2 text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">
                            Popular
                          </p>
                          <ul className="px-2 pb-2 space-y-0.5">
                            {popular.map((country) => (
                              <li key={country.code}>
                                <Link
                                  href={`/constitutions/${country.code.toLowerCase()}`}
                                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-[var(--accent)]/60 transition-colors"
                                >
                                  <span className="text-xl" aria-hidden>{country.flag}</span>
                                  <span className="text-[var(--foreground)]">{country.name}</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                    <div className="border-t border-[var(--border)] p-2">
                      <Link
                        href="/constitutions"
                        className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-[var(--primary)] hover:bg-[var(--accent)]/60 transition-colors"
                      >
                        Browse the full library
                        <Library className="h-4 w-4" aria-hidden />
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Toggle
              pressed={theme === "dark"}
              onPressedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
              className="h-9 w-9"
            >
              <AnimatePresence mode="wait">
                {theme === "dark" ? (
                  <motion.div
                    key="moon"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                  >
                    <Moon className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="sun"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                  >
                    <Sun className="h-4 w-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Toggle>
            <Button asChild className="hidden md:inline-flex">
              <Link href="/chat">
                Ask now <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <button
              type="button"
              className="md:hidden p-2 text-[var(--foreground)]"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden py-4 border-t border-[var(--border)]"
            >
              <div className="flex flex-col gap-3">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm font-medium text-[var(--foreground)]"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <Button asChild className="w-full mt-2">
                  <Link href="/chat">
                    Ask now <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
