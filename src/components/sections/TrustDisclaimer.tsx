"use client";

import { motion } from "framer-motion";
import { Shield, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { Separator } from "@/components/ui/Separator";
import { LawyerCtaLink } from "@/components/analytics/LawyerCtaLink";

export function TrustDisclaimer() {
  const t = useTranslations("trustDisclaimer");
  const whatWeDo = t("whatWeDo_items").split("|");
  const whatWeDont = t("whatWeDont_items").split("|");

  return (
    <section className="py-20 bg-[var(--foreground)] text-[var(--background)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-6">
            <Shield className="h-8 w-8" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">{t("title")}</h2>
          <p className="text-lg text-white/80 mb-8">{t("lead")}</p>
          <Separator className="bg-white/20 mx-auto mb-8 max-w-xs" />
          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div className="p-6 rounded-xl bg-white/5">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="font-semibold">{t("whatWeDo_title")}</span>
              </div>
              <ul className="space-y-2 text-sm text-white/80">
                {whatWeDo.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
            <div className="p-6 rounded-xl bg-white/5">
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                <span className="font-semibold">{t("whatWeDont_title")}</span>
              </div>
              <ul className="space-y-2 text-sm text-white/80">
                {whatWeDont.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-8 p-4 rounded-xl bg-white/10">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-white/80 text-left">{t("important")}</p>
            </div>
          </div>
          <div className="mt-8 flex justify-center">
            <LawyerCtaLink
              href="/find-a-lawyer"
              source="trust_disclaimer"
              className="inline-flex items-center justify-center rounded-md bg-white px-6 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-white/90 transition-colors"
            >
              {t("ctaFindLawyer")}
            </LawyerCtaLink>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
