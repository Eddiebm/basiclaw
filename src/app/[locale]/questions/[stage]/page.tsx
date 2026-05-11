import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Navigation } from "@/components/sections/Navigation";
import { Footer } from "@/components/sections/Footer";
import { QuestionsStageClient } from "@/components/questions/QuestionsStageClient";
import { QuestionsEducationalDisclaimer } from "@/components/questions/QuestionsEducationalDisclaimer";
import { getCitizenQuestionsByStage } from "@/data/questions/load-questions";
import { STAGES, type Stage } from "@/data/questions/taxonomy";
import { STAGE_LABEL } from "@/components/questions/labels";
import { buildQuestionsFaqJsonLd } from "@/lib/questions-jsonld";

type Props = { params: Promise<{ locale: string; stage: string }> };

export function generateStaticParams(): { stage: string }[] {
  return STAGES.map((stage) => ({ stage }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, stage } = await params;
  if (!(STAGES as readonly string[]).includes(stage)) {
    return { title: "Questions" };
  }
  const label = STAGE_LABEL[stage] ?? stage;
  return {
    title: `${label} legal questions`,
    description: `Educational legal prompts for the ${label} life stage. Not legal advice.`,
    alternates: { canonical: `/${locale}/questions/${stage}` },
  };
}

export default async function QuestionsStagePage({ params }: Props) {
  const { stage } = await params;
  if (!(STAGES as readonly string[]).includes(stage)) {
    notFound();
  }
  const questions = getCitizenQuestionsByStage(stage as Stage);
  const sorted = [...questions].sort((a, b) => a.id.localeCompare(b.id));
  const topFaq = sorted.slice(0, 20);
  const faqLd = buildQuestionsFaqJsonLd(topFaq);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
        <QuestionsStageClient stage={stage} questions={questions} />
        <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-wrap items-center gap-2 text-xs text-[var(--muted-foreground)]">
            <span>Explore the constitution for your country:</span>
            <Link href="/constitutions" className="font-medium text-[var(--primary)] hover:underline">
              Browse constitutions
            </Link>
          </div>
          <QuestionsEducationalDisclaimer />
        </div>
      </main>
      <Footer />
    </div>
  );
}
