import type { Metadata } from "next";
import { Navigation } from "@/components/sections/Navigation";
import { Footer } from "@/components/sections/Footer";
import { QuestionsIndexClient } from "@/components/questions/QuestionsIndexClient";
import { QuestionsEducationalDisclaimer } from "@/components/questions/QuestionsEducationalDisclaimer";
import { getAllCitizenQuestions } from "@/data/questions/load-questions";
import { buildQuestionsFaqJsonLd, buildQuestionsItemListJsonLd } from "@/lib/questions-jsonld";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Citizen questions",
    description:
      "Searchable library of plain-language legal prompts across life stages and domains. Educational only — not legal advice.",
    alternates: { canonical: `/${locale}/questions` },
  };
}

export default async function QuestionsIndexPage({ params }: Props) {
  const { locale } = await params;
  const questions = getAllCitizenQuestions();
  const sorted = [...questions].sort((a, b) => a.id.localeCompare(b.id));
  const topFaq = sorted.slice(0, 50);
  const itemList = buildQuestionsItemListJsonLd({ locale, questions: sorted, limit: 120 });
  const faqLd = buildQuestionsFaqJsonLd(topFaq);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
        <QuestionsIndexClient questions={questions} />
        <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
          <QuestionsEducationalDisclaimer />
        </div>
      </main>
      <Footer />
    </div>
  );
}
