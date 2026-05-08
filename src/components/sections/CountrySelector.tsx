"use client";

import { motion } from "framer-motion";
import { Globe, MapPin, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

const jurisdictions = [
  { country: "United States", flag: "🇺🇸", regions: ["Federal", "California", "New York", "Texas", "Florida", "+ 47 more"], status: "Active" },
  { country: "Ghana", flag: "🇬🇭", regions: ["National", "Accra", "Ashanti", "+ 14 more"], status: "Active" },
  { country: "Nigeria", flag: "🇳🇬", regions: ["Federal", "Lagos", "Abuja", "+ 35 more"], status: "Coming Soon" },
];

export function CountrySelector() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-4">Choose Your Jurisdiction</h2>
            <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">Legal information varies by country and region. Select yours for accurate guidance.</p>
          </motion.div>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {jurisdictions.map((jurisdiction, index) => (
            <motion.div key={jurisdiction.country} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }} className="relative p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--primary)] transition-colors">
              {jurisdiction.status === "Active" && (<div className="absolute top-4 right-4"><span className="px-2 py-1 text-xs font-medium rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">{jurisdiction.status}</span></div>)}
              <div className="flex items-center gap-3 mb-6"><span className="text-4xl">{jurisdiction.flag}</span><div><h3 className="font-semibold text-[var(--foreground)]">{jurisdiction.country}</h3><p className="text-sm text-[var(--muted-foreground)]">{jurisdiction.regions.length} regions available</p></div></div>
              <div className="space-y-2 mb-6">
                {jurisdiction.regions.slice(0, 3).map((region) => (<div key={region} className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]"><MapPin className="h-4 w-4" />{region}</div>))}
                {jurisdiction.regions.length > 3 && <p className="text-sm text-[var(--primary)] font-medium">+ {jurisdiction.regions.length - 3} more</p>}
              </div>
              <Button variant={jurisdiction.status === "Active" ? "default" : "outline"} className="w-full" disabled={jurisdiction.status !== "Active"}>
                {jurisdiction.status === "Active" ? (<>Select Region<ChevronRight className="h-4 w-4" /></>) : "Coming Soon"}
              </Button>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.4 }} className="mt-12 text-center">
          <p className="text-[var(--muted-foreground)] mb-4">Don't see your country? We're expanding rapidly.</p>
          <Button variant="ghost" className="gap-2"><Globe className="h-4 w-4" />Request Your Country</Button>
        </motion.div>
      </div>
    </section>
  );
}
