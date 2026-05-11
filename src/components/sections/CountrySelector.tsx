"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Globe, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LEGAL_SYSTEM_LABELS } from "@/data/types";
import { COUNTRIES } from "@/data/countries";
import { countryStats, getPopularCountries, searchCountries } from "@/lib/jurisdictions";
import { track } from "@/lib/analytics";

export function CountrySelector() {
  const stats = countryStats();
  const popular = getPopularCountries();
  const [query, setQuery] = useState("");

  const matches = useMemo(() => {
    if (!query.trim()) return [];
    return searchCountries(query).slice(0, 8);
  }, [query]);

  return (
    <section id="countries" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium mb-4">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Now covering every country in the world
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-4">
              Pick your jurisdiction
            </h2>
            <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
              Legal information varies by country and region. Search the {stats.total}-country library or jump straight into one of our most-explored constitutions.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="relative max-w-2xl mx-auto mb-10"
        >
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--muted-foreground)]" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${stats.total} countries — try "Brazil", "Sharia", "common law"…`}
            aria-label="Search countries"
            className="w-full h-14 pl-12 pr-32 rounded-2xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
          <Button asChild className="absolute right-2 top-1/2 -translate-y-1/2 gap-1">
            <Link href="/constitutions">
              Browse all <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          {matches.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-lg overflow-hidden z-10">
              <ul className="divide-y divide-[var(--border)]/60">
                {matches.map((country) => (
                  <li key={country.code}>
                    <Link
                      href={`/constitutions/${country.code.toLowerCase()}`}
                      onClick={() => track("country_selected", { country_code: country.code, country: country.name, source: "search" })}
                      className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-[var(--accent)]/40 transition-colors"
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-2xl" aria-hidden>{country.flag}</span>
                        <span>
                          <span className="block text-sm font-semibold text-[var(--foreground)]">{country.name}</span>
                          <span className="block text-xs text-[var(--muted-foreground)]">
                            {country.region} · {LEGAL_SYSTEM_LABELS[country.legalSystem]}
                          </span>
                        </span>
                      </span>
                      <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)]" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {popular.map((country, index) => (
            <motion.div
              key={country.code}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.04 }}
            >
              <Link
                href={`/constitutions/${country.code.toLowerCase()}`}
                onClick={() => track("country_selected", { country_code: country.code, country: country.name, source: "popular_grid" })}
                className="group flex h-full flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 hover:border-[var(--primary)] hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl" aria-hidden>{country.flag}</span>
                  {country.status === "active" && (
                    <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      Live
                    </span>
                  )}
                </div>
                <p className="font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                  {country.name}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {LEGAL_SYSTEM_LABELS[country.legalSystem]}
                </p>
                <p className="mt-auto pt-4 text-xs text-[var(--muted-foreground)] flex items-center gap-1">
                  Open constitution <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden />
                </p>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <p className="text-[var(--muted-foreground)] text-sm">
            Looking for something specific?
          </p>
          <Button asChild variant="ghost" className="gap-2">
            <Link href="/constitutions">
              <Globe className="h-4 w-4" /> Browse all {COUNTRIES.length} constitutions
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
