"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { track } from "@/lib/analytics";

const FAQ_KEYS = ["i1", "i2", "i3", "i4", "i5", "i6", "i7"] as const;

export function HomeFAQ() {
  const t = useTranslations("homeFaq");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const items = useMemo(
    () =>
      FAQ_KEYS.map((key) => ({
        key,
        q: t(`items.${key}.q`),
        a: t(`items.${key}.a`),
      })),
    [t]
  );

  return (
    <section className="py-20" id="faq">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium mb-4">
            <HelpCircle className="h-3.5 w-3.5" aria-hidden />
            {t("badge")}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)]">{t("title")}</h2>
        </div>
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] divide-y divide-[var(--border)]/60 overflow-hidden">
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={item.key}
                id={item.key === "i7" ? "voice-browser-faq" : undefined}
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
            mainEntity: items.map((item) => ({
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
