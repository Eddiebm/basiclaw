"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { track } from "@/lib/analytics";

export const FAQ_ITEMS = [
  {
    q: "Is BasicLaw a substitute for a lawyer?",
    a: "No. BasicLaw is educational. We help you understand what the law says, but only a licensed lawyer in your jurisdiction can give legal advice on your specific situation. We tell you when to find one.",
  },
  {
    q: "Which countries are supported?",
    a: "All 195 internationally recognised countries are in the library, with a plain-language summary of the constitution, key principles, and links to the official text. The interactive assistant is rolling out country by country — start with the United States, Ghana, and Nigeria today.",
  },
  {
    q: "Where do the constitutions come from?",
    a: "We summarise from the official primary source where available, and link to the Comparative Constitutions Project (constituteproject.org) for the full English text. Constitutional law changes — always verify against the official version before relying on a provision.",
  },
  {
    q: "How does BasicLaw stay accurate?",
    a: "Each constitution entry includes the year of adoption and the most recent amendment we are aware of. Where a constitution has been suspended, contested, or replaced by a transitional charter, we say so directly in the summary.",
  },
  {
    q: "Is BasicLaw free?",
    a: "The Constitution Library and most of the Q&A is free to read. Pro and Pro+ tiers add document analysis, multi-jurisdiction comparison, saved chats, and priority models — see the pricing page for details.",
  },
  {
    q: "Can I use BasicLaw answers in court or in a filing?",
    a: "No. BasicLaw answers are designed to help you understand legal concepts and frame the right questions to ask a lawyer. They should not be cited as legal authority or used as a substitute for legal representation.",
  },
];

export function HomeFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return (
    <section className="py-20" id="faq">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium mb-4">
            <HelpCircle className="h-3.5 w-3.5" aria-hidden />
            Frequently asked
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)]">
            What people ask before they trust us
          </h2>
        </div>
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] divide-y divide-[var(--border)]/60 overflow-hidden">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={item.q}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
              >
                <button
                  type="button"
                  onClick={() => {
                    const nextOpen = !isOpen;
                    setOpenIndex(nextOpen ? index : null);
                    if (nextOpen) track("faq_expanded", { question: item.q, index });
                  }}
                  aria-expanded={isOpen}
                  className="w-full text-left px-5 sm:px-6 py-4 flex items-center justify-between gap-4 hover:bg-[var(--accent)]/40 transition-colors"
                >
                  <span className="font-medium text-[var(--foreground)]">{item.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-[var(--muted-foreground)] flex-shrink-0 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 sm:px-6 pb-5 text-sm text-[var(--muted-foreground)] leading-relaxed">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ_ITEMS.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: { "@type": "Answer", text: item.a },
            })),
          }),
        }}
      />
    </section>
  );
}
