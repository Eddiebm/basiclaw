"use client";

import { motion } from "framer-motion";
import { BookOpen, PlayCircle, Award, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

const lessons = [
  { title: "Understanding Your Rights", description: "Learn the basics of what rights you have in everyday situations.", topics: 12, duration: "2 hours", level: "Beginner", icon: "🛡️" },
  { title: "Police Interactions", description: "Know what to do when you encounter law enforcement.", topics: 8, duration: "1.5 hours", level: "Beginner", icon: "👮" },
  { title: "Contracts 101", description: "Understand what you're signing and your obligations.", topics: 10, duration: "2 hours", level: "Intermediate", icon: "📝" },
  { title: "Housing Rights", description: "Learn about tenant rights and landlord responsibilities.", topics: 15, duration: "3 hours", level: "Beginner", icon: "🏠" },
  { title: "Starting a Business", description: "Legal basics for entrepreneurs and small business owners.", topics: 14, duration: "2.5 hours", level: "Intermediate", icon: "💼" },
  { title: "Family Law Basics", description: "Understanding marriage, divorce, and child custody.", topics: 11, duration: "2 hours", level: "Intermediate", icon: "👨‍👩‍👧" },
];

const levelColors: Record<string, string> = { Beginner: "bg-green-500/10 text-green-600", Intermediate: "bg-yellow-500/10 text-yellow-600", Advanced: "bg-red-500/10 text-red-600" };

export function LawSchool() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-sm font-medium mb-4"><BookOpen className="h-4 w-4" />Law School for Ordinary People</div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-4">Learn Legal Literacy Step by Step</h2>
            <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">No prior knowledge needed. We start from the basics and build your understanding over time.</p>
          </motion.div>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }} className="mb-12 p-8 rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/60 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-sm mb-4"><Award className="h-4 w-4" />Most Popular</div>
              <h3 className="text-2xl font-bold mb-2">Start Here: Your Legal Rights</h3>
              <p className="text-white/80 mb-4">The perfect starting point. Learn what rights you have and how to protect them.</p>
              <div className="flex items-center gap-4 text-sm text-white/80"><span>12 Topics</span><span>•</span><span>2 Hours</span><span>•</span><span>Beginner Level</span></div>
            </div>
            <Button size="lg" className="bg-white text-[var(--primary)] hover:bg-white/90 gap-2"><PlayCircle className="h-5 w-5" />Start Learning</Button>
          </div>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson, index) => (
            <motion.div key={lesson.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }} className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--primary)] transition-colors">
              <div className="flex items-center gap-3 mb-4"><span className="text-3xl">{lesson.icon}</span><span className={`px-2 py-1 text-xs font-medium rounded-full ${levelColors[lesson.level]}`}>{lesson.level}</span></div>
              <h3 className="font-semibold text-[var(--foreground)] mb-2">{lesson.title}</h3>
              <p className="text-sm text-[var(--muted-foreground)] mb-4">{lesson.description}</p>
              <div className="flex items-center justify-between text-sm text-[var(--muted-foreground)]"><span>{lesson.topics} Topics</span><span>{lesson.duration}</span></div>
              <Button variant="ghost" className="w-full mt-4 gap-2">View Course<ChevronRight className="h-4 w-4" /></Button>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.4 }} className="mt-12 text-center">
          <Button variant="outline" size="lg" className="gap-2">Explore All Courses<ChevronRight className="h-4 w-4" /></Button>
        </motion.div>
      </div>
    </section>
  );
}
