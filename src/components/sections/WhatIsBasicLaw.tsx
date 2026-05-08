"use client";

import { motion } from "framer-motion";
import { Scale, Users, BookOpen, Globe, Lightbulb, Heart } from "lucide-react";

const features = [
  { icon: Scale, title: "Not Legal Advice", description: "We help you understand legal concepts, but we're not lawyers. Always consult a professional for serious matters." },
  { icon: Users, title: "Built for Everyone", description: "No legal background needed. Our explanations are designed for ordinary people, not legal professionals." },
  { icon: BookOpen, title: "Learn at Your Pace", description: "From beginner to advanced. Our Law School helps you build knowledge step by step." },
  { icon: Globe, title: "Jurisdiction Aware", description: "Legal systems vary by country and state. We adapt to your location for accurate information." },
  { icon: Lightbulb, title: "Plain Language", description: "No legal jargon. We explain things in simple terms you can actually understand." },
  { icon: Heart, title: "Trust First", description: "We're here to help, not to upsell. If you need a lawyer, we'll tell you clearly." },
];

export function WhatIsBasicLaw() {
  return (
    <section className="py-20 bg-[var(--accent)]/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-4">What is BasicLaw?</h2>
            <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">A free legal literacy platform helping people understand their rights and navigate legal systems worldwide.</p>
          </motion.div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }} className="p-6 rounded-2xl bg-[var(--background)] border border-[var(--border)]">
              <div className="flex items-center gap-3 mb-4"><div className="p-2 rounded-lg bg-[var(--primary)]/10"><feature.icon className="h-5 w-5 text-[var(--primary)]" /></div><h3 className="font-semibold text-[var(--foreground)]">{feature.title}</h3></div>
              <p className="text-sm text-[var(--muted-foreground)]">{feature.description}</p>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.6 }} className="mt-16 p-8 rounded-2xl bg-[var(--background)] border border-[var(--border)] text-center">
          <p className="text-lg text-[var(--foreground)] font-medium mb-2">BasicLaw is civic infrastructure for the digital age.</p>
          <p className="text-[var(--muted-foreground)]">Just like a public library helps everyone access knowledge, BasicLaw helps everyone understand the law.</p>
        </motion.div>
      </div>
    </section>
  );
}
