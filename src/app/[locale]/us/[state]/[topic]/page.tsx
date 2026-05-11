import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UsStateTopicPage } from "@/components/topics/UsStateTopicPage";
import { US_STATES, US_STATE_TOPIC_SLUGS, getUsStateBySlug, type UsStateTopicSlug } from "@/data/us-states";
import { routing } from "@/i18n/routing";
import { buildUsStateTopicContent } from "@/lib/us-state-topic-content";
import { fetchBuildTimeStateTopicSummary } from "@/lib/us-state-llm-summary";

type RouteParams = { locale: string; state: string; topic: string };

export const dynamicParams = true;

export function generateStaticParams(): RouteParams[] {
  return [routing.defaultLocale].flatMap((locale) =>
    US_STATES.flatMap((state) =>
      US_STATE_TOPIC_SLUGS.map((topic) => ({
        locale,
        state: state.slug,
        topic,
      }))
    )
  );
}

function isTopic(value: string): value is UsStateTopicSlug {
  return (US_STATE_TOPIC_SLUGS as readonly string[]).includes(value);
}

export async function generateMetadata({ params }: { params: Promise<RouteParams> }): Promise<Metadata> {
  const { locale, state: stateSlug, topic: topicSlug } = await params;
  const state = getUsStateBySlug(stateSlug);
  if (!state || !isTopic(topicSlug)) return { title: "Not found" };
  const content = buildUsStateTopicContent(state, topicSlug);
  const title = `${content.title} | ${state.name}`;
  const description = content.intro.slice(0, 180);
  return {
    title,
    description,
    alternates: { canonical: `/${locale}/us/${state.slug}/${topicSlug}` },
    openGraph: {
      title,
      description,
      url: `/${locale}/us/${state.slug}/${topicSlug}`,
      type: "article",
    },
  };
}

export default async function UsStateTopicRoute({ params }: { params: Promise<RouteParams> }) {
  const { state: stateSlug, topic: topicSlug } = await params;
  const state = getUsStateBySlug(stateSlug);
  if (!state || !isTopic(topicSlug)) notFound();

  const llmSummary = process.env.BUILD_LLM_KEY ? await fetchBuildTimeStateTopicSummary(state, topicSlug) : null;

  const content = buildUsStateTopicContent(state, topicSlug, { llmSummary });
  const showPendingCta = !llmSummary;

  return <UsStateTopicPage state={state} topic={topicSlug} content={content} showPendingCta={showPendingCta} />;
}
