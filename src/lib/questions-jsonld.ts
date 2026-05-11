import type { CitizenQuestion } from "@/data/questions/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://basiclaw.app";

function questionUrl(locale: string, id: string): string {
  return `${SITE_URL}/${locale}/questions#${encodeURIComponent(id)}`;
}

export function buildQuestionsItemListJsonLd(args: { locale: string; questions: CitizenQuestion[]; limit?: number }) {
  const limit = args.limit ?? 120;
  const slice = args.questions.slice(0, limit);
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    numberOfItems: args.questions.length,
    itemListElement: slice.map((q, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: q.question,
      url: questionUrl(args.locale, q.id),
    })),
  };
}

export function buildQuestionsFaqJsonLd(questions: CitizenQuestion[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "This is an educational prompt only. BasicLaw does not provide legal advice. Open the in-app chat with your jurisdiction selected for a plain-language overview and pointers to public sources.",
      },
    })),
  };
}
