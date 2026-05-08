"use client";

import { motion } from "framer-motion";
import { Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

const exampleQuestions = [
  { category: "Police Interaction", question: "What should I do if police pull me over?", icon: "👮" },
  { category: "Housing", question: "Can my landlord enter my apartment without notice?", icon: "🏠" },
  { category: "Employment", question: "Am I entitled to overtime pay?", icon: "💼" },
  { category: "Contracts", question: "What happens if I sign a contract I don't understand?", icon: "📝" },
  { category: "Family", question: "How do I get a copy of my birth certificate?", icon: "📋" },
  { category: "Consumer Rights", question: "Can I return a product if I changed my mind?", icon: "🛒" },
];

export function ExampleQuestions() {
  return (
    <section className="py-20 bg-[var(--accent)]/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-4">Common Legal Questions</h2>
            <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">Start with questions real people ask every day. We explain in plain language.</p>
          </motion.div>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }} className="max-w-2xl mx-auto mb-16">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--muted-foreground)]" />
            <input type="text" placeholder="Search for any legal topic..." className="w-full h-14 pl-12 pr-4 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
            <Button className="absolute right-2 top-1/2 -translate-y-1/2">Search</Button>
          </div>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exampleQuestions.map((item, index) => (
            <motion.button key={item.question} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }} className="group p-6 rounded-2xl bg-[var(--background)] border border-[var(--border)] text-left hover:border-[var(--primary)] transition-colors">
              <div className="flex items-center gap-3 mb-4"><span className="text-2xl">{item.icon}</span><span className="text-sm font-medium text-[var(--primary)]">{item.category}</span></div>
              <p className="text-[var(--foreground)] font-medium mb-4 group-hover:text-[var(--primary)] transition-colors">{item.question}</p>
              <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]"><span>Ask this question</span><ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></div>
            </motion.button>
          ))}
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.4 }} className="mt-12 text-center">
          <Button variant="outline" className="gap-2">Browse All Topics<ArrowRight className="h-4 w-4" /></Button>
        </motion.div>
      </div>
    </section>
  );
}
