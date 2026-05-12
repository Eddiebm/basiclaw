import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
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
import { buildOgImageUrl } from "@/lib/og-image-url";

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
  const title = `${label} legal questions`;
  const description = `Educational legal prompts for the ${label} life stage. Not legal advice.`;
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://basiclaw.app";
  const og = buildOgImageUrl(site, {
    kind: "questions",
    title: label.slice(0, 80),
    subtitle: "Citizen questions · BasicLaw",
  });
  return {
    title,
    description,
    alternates: { canonical: `/${locale}/questions/${stage}` },
    openGraph: {
      title,
      description,
      url: `/${locale}/questions/${stage}`,
      type: "website",
      images: [{ url: og, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [og] },
  };
}

export default async function QuestionsStagePage({ params }: Props) {
  const { locale, stage } = await params;
  if (!(STAGES as readonly string[]).includes(stage)) {
    notFound();
  }
  const t = await getTranslations({ locale, namespace: "questionsLibrary" });
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
            <span>{t("constitutionExploreLead")}</span>
            <Link href="/constitutions" className="font-medium text-[var(--primary)] hover:underline">
              {t("browseConstitutions")}
            </Link>
          </div>
          <QuestionsEducationalDisclaimer />
        </div>
      </main>
      <Footer />
    </div>
  );
}
