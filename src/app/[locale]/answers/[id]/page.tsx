import type { Metadata } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Navigation } from "@/components/sections/Navigation";
import { Footer } from "@/components/sections/Footer";
import { VERIFIED_LAWYERS } from "@/data/verified-lawyers";
import { getCountry } from "@/lib/jurisdictions";
import { getAnswerPublicOrOwner, toPublicAnswer } from "@/lib/saved-answers";
import { AnswerDetailClient } from "@/components/answers/AnswerDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "answers.detail" });
  const { userId } = await auth();
  const row = await getAnswerPublicOrOwner(id, userId ?? null);
  if (!row) {
    return { title: t("notFoundTitle"), robots: { index: false, follow: false } };
  }
  const titleBase = row.question.slice(0, 72) + (row.question.length > 72 ? "…" : "");
  const isPublic = row.isPublic;
  return {
    title: `${titleBase} | ${t("metaTitle")}`,
    description: row.answer.replace(/\s+/g, " ").trim().slice(0, 160),
    alternates: { canonical: `/${locale}/answers/${id}` },
    robots: isPublic ? { index: true, follow: true } : { index: false, follow: false },
  };
}

export default async function AnswerDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "answers.detail" });
  const { userId } = await auth();
  const row = await getAnswerPublicOrOwner(id, userId ?? null);
  if (!row) notFound();

  const publicRow = row.isPublic ? toPublicAnswer(row) : toPublicAnswer({ ...row, isPublic: false });
  const country = getCountry(row.jurisdiction);
  const jurisdictionLabel = country?.name ?? row.jurisdiction.toUpperCase();

  const lawyer = row.verifiedBy ? VERIFIED_LAWYERS.find((l) => l.id === row.verifiedBy) : undefined;
  const verifiedLine =
    lawyer != null
      ? t("verifiedLine", {
          name: lawyer.name,
          jurisdiction: lawyer.jurisdiction,
        })
      : null;

  const siteBase = (process.env.NEXT_PUBLIC_SITE_URL || "https://basiclaw.app").replace(/\/$/, "");
  const canonicalPath = `/${locale}/answers/${id}`;

  const qaJson = {
    "@context": "https://schema.org",
    "@type": "QAPage",
    mainEntity: {
      "@type": "Question",
      name: publicRow.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: publicRow.answer,
        upvoteCount: publicRow.upvotes,
      },
    },
  };

  return (
    <main className="min-h-screen">
      <Navigation />
      <section className="pt-28 pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Link href="/answers" className="text-sm text-[var(--primary)] hover:underline">
            {t("backToArchive")}
          </Link>
          <div className="mt-6">
            <AnswerDetailClient
              id={publicRow.id}
              question={publicRow.question}
              answerMarkdown={publicRow.answer}
              jurisdictionCode={publicRow.jurisdiction}
              jurisdictionLabel={jurisdictionLabel}
              upvotes={publicRow.upvotes}
              downvotes={publicRow.downvotes}
              verifiedLine={verifiedLine}
              siteBase={siteBase}
              canonicalPath={canonicalPath}
            />
          </div>
        </div>
      </section>
      <Footer />
      {row.isPublic ? (
        <Script id="answer-qapage-jsonld" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify(qaJson)}
        </Script>
      ) : null}
    </main>
  );
}
