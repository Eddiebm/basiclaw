import type { Metadata } from "next";
import Script from "next/script";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Navigation } from "@/components/sections/Navigation";
import { Footer } from "@/components/sections/Footer";
import { getPopularCountries } from "@/lib/jurisdictions";
import { embedQueryForRag } from "@/lib/query-embed";
import { getMeta, loadSnippetEmbeddingsFile } from "@/lib/rag-embeddings";
import { listPublicAnswersResolved } from "@/lib/saved-answers";
import { AnswersSearchTracker } from "@/components/answers/AnswersSearchTracker";

const PAGE_SIZE = 20;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "answers.archive" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: `/${locale}/answers` },
    robots: { index: true, follow: true },
  };
}

export default async function AnswersArchivePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: "answers.archive" });

  const qRaw = typeof sp.q === "string" ? sp.q : "";
  const q = qRaw.trim();
  const country = typeof sp.country === "string" && sp.country.trim() ? sp.country.trim().toLowerCase() : "";
  const sort = sp.sort === "votes" ? "votes" : "recent";
  const page = Math.max(1, Number.parseInt(typeof sp.page === "string" ? sp.page : "1", 10) || 1);

  const snippetEmbFile = await loadSnippetEmbeddingsFile();
  const embMeta = getMeta(snippetEmbFile) ?? { dim: 384, model: "Xenova/all-MiniLM-L6-v2", provider: "xenova" as const };

  let items = await listPublicAnswersResolved({
    jurisdiction: country || undefined,
    page,
    pageSize: PAGE_SIZE,
    sort,
  });

  if (q) {
    const queryEmbedding = await embedQueryForRag(q, embMeta);
    const semantic = await listPublicAnswersResolved({
      jurisdiction: country || undefined,
      queryEmbedding,
      page,
      pageSize: PAGE_SIZE,
      sort: "recent",
    });
    if (semantic.length > 0) {
      items = semantic;
    } else {
      items = await listPublicAnswersResolved({
        jurisdiction: country || undefined,
        query: q,
        page,
        pageSize: PAGE_SIZE,
        sort,
      });
    }
  }

  const hasNext = items.length === PAGE_SIZE;
  const popular = getPopularCountries().slice(0, 24);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://basiclaw.app";
  const itemListJson = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((a, i) => ({
      "@type": "ListItem",
      position: (page - 1) * PAGE_SIZE + i + 1,
      url: `${siteUrl}/${locale}/answers/${a.id}`,
      name: a.question.slice(0, 200),
    })),
  };

  const qs = (overrides: Record<string, string | number | undefined>) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (country) p.set("country", country);
    p.set("sort", (overrides.sort as string) ?? sort);
    const pg = overrides.page != null ? String(overrides.page) : String(page);
    if (pg !== "1") p.set("page", pg);
    const s = p.toString();
    return s ? `?${s}` : "";
  };

  return (
    <main className="min-h-screen">
      <Navigation />
      {q ? <AnswersSearchTracker query={q} /> : null}
      <section className="pt-28 pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)]">{t("title")}</h1>
          <p className="mt-3 text-[var(--muted-foreground)]">{t("subtitle")}</p>

          <form method="get" className="mt-8 space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="answers-q" className="text-xs font-medium text-[var(--muted-foreground)]">
                  {t("searchPlaceholder")}
                </label>
                <input
                  id="answers-q"
                  name="q"
                  type="search"
                  defaultValue={q}
                  placeholder={t("searchPlaceholder")}
                  className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
                />
              </div>
              <div>
                <label htmlFor="answers-country" className="text-xs font-medium text-[var(--muted-foreground)]">
                  {t("jurisdictionLabel")}
                </label>
                <select
                  id="answers-country"
                  name="country"
                  defaultValue={country || ""}
                  className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
                >
                  <option value="">{t("allJurisdictions")}</option>
                  {popular.map((c) => (
                    <option key={c.code} value={c.code.toLowerCase()}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="answers-sort" className="text-xs font-medium text-[var(--muted-foreground)]">
                  {t("sortLabel")}
                </label>
                <select
                  id="answers-sort"
                  name="sort"
                  defaultValue={sort}
                  className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
                >
                  <option value="recent">{t("sortRecent")}</option>
                  <option value="votes">{t("sortVotes")}</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)]"
            >
              {t("submitSearch")}
            </button>
          </form>

          {items.length === 0 ? (
            <p className="mt-10 text-sm text-[var(--muted-foreground)]">{t("empty")}</p>
          ) : (
            <ul className="mt-10 space-y-4">
              {items.map((a) => (
                <li
                  key={a.id}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5 hover:border-[var(--primary)]/40 transition-colors"
                >
                  <Link href={`/answers/${a.id}`} className="font-semibold text-[var(--foreground)] hover:underline">
                    {a.question}
                  </Link>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)] line-clamp-2">{a.answer.replace(/\s+/g, " ").trim().slice(0, 220)}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[var(--muted-foreground)]">
                    <span className="rounded-full border border-[var(--border)] px-2 py-0.5 uppercase">{a.jurisdiction}</span>
                    <span>{t("votes", { count: a.upvotes })}</span>
                    <Link href={`/answers/${a.id}`} className="text-[var(--primary)] font-medium hover:underline">
                      {t("cardCta")}
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8 flex justify-between gap-4 text-sm">
            {page > 1 ? (
              <Link href={`/answers${qs({ page: page - 1 })}`} className="text-[var(--primary)] hover:underline">
                {t("prevPage")}
              </Link>
            ) : (
              <span />
            )}
            {hasNext ? (
              <Link href={`/answers${qs({ page: page + 1 })}`} className="text-[var(--primary)] hover:underline">
                {t("nextPage")}
              </Link>
            ) : null}
          </div>
        </div>
      </section>
      <Footer />
      {items.length > 0 ? (
        <Script id="answers-itemlist-jsonld" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify(itemListJson)}
        </Script>
      ) : null}
    </main>
  );
}
