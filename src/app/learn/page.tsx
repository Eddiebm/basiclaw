"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, PlayCircle, Award, CheckCircle2, Lock, ChevronRight, Trophy, Target, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: "beginner" | "intermediate" | "advanced";
  completed: boolean;
  locked: boolean;
}

interface Course {
  id: string;
  title: string;
  description: string;
  icon: typeof BookOpen;
  lessons: Lesson[];
  progress: number;
  totalLessons: number;
  completedLessons: number;
}

const courses: Course[] = [
  {
    id: "rights",
    title: "Your Constitutional Rights",
    description: "Learn about fundamental rights protected by the constitution",
    icon: BookOpen,
    progress: 60,
    totalLessons: 5,
    completedLessons: 3,
    lessons: [
      { id: "r1", title: "Introduction to Rights", description: "Overview of constitutional protections", duration: "10 min", level: "beginner", completed: true, locked: false },
      { id: "r2", title: "Due Process", description: "Understanding fair treatment under law", duration: "15 min", level: "beginner", completed: true, locked: false },
      { id: "r3", title: "Equal Protection", description: "Equal treatment and anti-discrimination", duration: "12 min", level: "beginner", completed: true, locked: false },
      { id: "r4", title: "First Amendment", description: "Freedom of speech and religion", duration: "20 min", level: "intermediate", completed: false, locked: false },
      { id: "r5", title: "Privacy Rights", description: "Right to privacy and its limits", duration: "18 min", level: "advanced", completed: false, locked: true },
    ]
  },
  {
    id: "contracts",
    title: "Contract Basics",
    description: "Understanding how contracts work in everyday life",
    icon: Award,
    progress: 25,
    totalLessons: 4,
    completedLessons: 1,
    lessons: [
      { id: "c1", title: "What is a Contract?", description: "Essential elements of binding agreements", duration: "12 min", level: "beginner", completed: true, locked: false },
      { id: "c2", title: "Offer and Acceptance", description: "How agreements are formed", duration: "15 min", level: "beginner", completed: false, locked: false },
      { id: "c3", title: "Consideration", description: "What's needed for a valid contract", duration: "14 min", level: "intermediate", completed: false, locked: true },
      { id: "c4", title: "Breach of Contract", description: "What happens when contracts are broken", duration: "16 min", level: "advanced", completed: false, locked: true },
    ]
  },
  {
    id: "housing",
    title: "Tenant Rights",
    description: "Know your rights as a renter",
    icon: PlayCircle,
    progress: 0,
    totalLessons: 4,
    completedLessons: 0,
    lessons: [
      { id: "h1", title: "Lease Agreements", description: "Understanding your rental contract", duration: "11 min", level: "beginner", completed: false, locked: false },
      { id: "h2", title: "Security Deposits", description: "Rules for deposits and returns", duration: "13 min", level: "beginner", completed: false, locked: true },
      { id: "h3", title: "Eviction Process", description: "What landlords can and cannot do", duration: "18 min", level: "intermediate", completed: false, locked: true },
      { id: "h4", title: "Repairs and Maintenance", description: "Landlord obligations and tenant rights", duration: "14 min", level: "intermediate", completed: false, locked: true },
    ]
  },
  {
    id: "family",
    title: "Family Law Fundamentals",
    description: "Essential knowledge for family legal matters",
    icon: Target,
    progress: 0,
    totalLessons: 5,
    completedLessons: 0,
    lessons: [
      { id: "f1", title: "Marriage and Divorce", description: "Legal aspects of relationships", duration: "15 min", level: "beginner", completed: false, locked: false },
      { id: "f2", title: "Child Custody", description: "Understanding custody arrangements", duration: "20 min", level: "intermediate", completed: false, locked: true },
      { id: "f3", title: "Child Support", description: "Obligations and calculations", duration: "16 min", level: "intermediate", completed: false, locked: true },
      { id: "f4", title: "Prenuptial Agreements", description: "Protecting assets before marriage", duration: "14 min", level: "advanced", completed: false, locked: true },
      { id: "f5", title: "Domestic Violence", description: "Legal protections and resources", duration: "18 min", level: "advanced", completed: false, locked: true },
    ]
  },
];

const levelColors = {
  beginner: "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400",
  intermediate: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400",
  advanced: "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400",
};

export default function LearnPage() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const totalCompleted = courses.reduce((acc, c) => acc + c.completedLessons, 0);
  const totalLessons = courses.reduce((acc, c) => acc + c.totalLessons, 0);
  const overallProgress = Math.round((totalCompleted / totalLessons) * 100);

  if (selectedCourse) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-10">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
            <Button variant="ghost" onClick={() => setSelectedCourse(null)}>
              ← Back
            </Button>
            <div>
              <h1 className="font-semibold">{selectedCourse.title}</h1>
              <p className="text-sm text-muted-foreground">{selectedCourse.description}</p>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
          {selectedCourse.lessons.map((lesson, index) => (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border transition-colors",
                  lesson.locked
                    ? "bg-muted/50 cursor-not-allowed"
                    : lesson.completed
                    ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800"
                    : "bg-background hover:bg-secondary/50 cursor-pointer"
                )}
                onClick={() => !lesson.locked && !lesson.completed && alert("Start lesson: " + lesson.title)}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  lesson.completed
                    ? "bg-green-500 text-white"
                    : lesson.locked
                    ? "bg-muted text-muted-foreground"
                    : "bg-primary text-primary-foreground"
                )}>
                  {lesson.completed ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : lesson.locked ? (
                    <Lock className="w-5 h-5" />
                  ) : (
                    <PlayCircle className="w-5 h-5" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium">{lesson.title}</h3>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full", levelColors[lesson.level])}>
                      {lesson.level}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{lesson.description}</p>
                </div>

                <div className="text-sm text-muted-foreground">{lesson.duration}</div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">Law School</h1>
          <p className="text-muted-foreground">
            Learn fundamental legal concepts at your own pace
          </p>
        </div>
      </header>

      {/* Progress Overview */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-1">Your Progress</h2>
              <p className="text-muted-foreground mb-3">
                {totalCompleted} of {totalLessons} lessons completed ({overallProgress}%)
              </p>
              <Progress value={overallProgress} className="h-2" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{totalCompleted}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div
                className="bg-background border rounded-2xl p-6 hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => setSelectedCourse(course)}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <course.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{course.title}</h3>
                    <p className="text-sm text-muted-foreground">{course.description}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {course.completedLessons} / {course.totalLessons} lessons
                    </span>
                    <span className="font-medium">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-1.5" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}