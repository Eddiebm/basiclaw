import type { Country } from "@/data/types";
import { getCountry } from "@/lib/jurisdictions";
import { getTopicContent } from "@/lib/topic-content";
import type { UsState, UsStateTopicSlug } from "@/data/us-states";

export interface UsStateTopicSection {
  /** Optional stable key for list rendering; country topic sections include ids from `getTopicContent`. */
  id?: string;
  heading: string;
  body: string;
  bullets?: string[];
}

export interface UsStateTopicFAQ {
  q: string;
  a: string;
}

export interface UsStateTopicContent {
  slug: UsStateTopicSlug;
  stateCode: string;
  title: string;
  intro: string;
  sections: UsStateTopicSection[];
  faqs: UsStateTopicFAQ[];
  prefilledQuestion: string;
}

function usCountry(): Country {
  return getCountry("us")!;
}

function mergeStateNotes(intro: string, state: UsState): string {
  if (!state.notes) return intro;
  return `${intro}\n\n**How ${state.name} often differs:** ${state.notes}`;
}

export function buildUsStateTopicContent(
  state: UsState,
  topic: UsStateTopicSlug,
  options?: { llmSummary?: string | null }
): UsStateTopicContent {
  const us = usCountry();
  const base = getTopicContent(
    us,
    topic === "employment" ? "rights" : topic
  );

  const llm = options?.llmSummary?.trim();
  const stateCardBody =
    llm ||
    `We are expanding state-specific explainers for ${state.name}. For now, start with the federal overview below, then ask the assistant for ${state.name}-aware follow-ups.`;

  const stateLayer: UsStateTopicSection = {
    id: "stateSnapshot",
    heading: `${state.name}-specific snapshot`,
    body: stateCardBody,
    bullets: state.notes
      ? [
          `Capital: ${state.capital} — many filings and agencies are organised at county or city level.`,
          "Tenant, employment, and police-practice rules can differ materially from neighbouring states.",
        ]
      : [`Capital: ${state.capital}.`, "Local ordinances and agency guidance can change faster than this page."],
  };

  if (topic === "employment") {
    const intro = mergeStateNotes(
      `Employment in the United States is mostly "at-will" unless a contract, statute, or union agreement says otherwise — but **${state.name}** layers state wage/hour rules, anti-discrimination agencies, and industry-specific safety regimes on top of federal baselines.`,
      state
    );
    return {
      slug: "employment",
      stateCode: state.code,
      title: `Employment basics in ${state.name}`,
      intro,
      sections: [
        stateLayer,
        {
          id: "employmentFederalState",
          heading: "Federal floor vs state overlays",
          body: `National statutes like the Fair Labor Standards Act set a floor for minimum wage and overtime in many jobs, but ${state.name} may set higher minimums, meal/rest break rules, paid leave, or stricter classification tests for independent contractors.`,
          bullets: [
            "Check whether your role is exempt from overtime — titles alone do not decide exemption.",
            "Look for state wage-theft remedies and shorter deadlines than federal law.",
            "Union contracts and public-sector CBAs can override default at-will rules.",
          ],
        },
        {
          id: "employmentHandbooks",
          heading: "Handbooks, arbitration, and non-competes",
          body: `Employee handbooks and offer letters often sneak in arbitration clauses, IP assignment, moonlighting limits, and restrictive covenants. Enforceability of non-competes in ${state.name} is fact- and statute-specific and changes with legislation and court decisions.`,
        },
        {
          id: "employmentIfWrong",
          heading: "If something goes wrong",
          body: `Document timelines, keep pay stubs and schedules, and identify the right agency: often a state labour commissioner or human-rights commission in parallel with federal EEOC pathways. Deadlines are short — licensed employment counsel in ${state.name} is the safest route for strategy.`,
        },
      ],
      faqs: [
        {
          q: `Is employment law mostly federal in ${state.name}?`,
          a: "Federal law sets important baselines, but states add wage/hour, leave, anti-discrimination, and safety rules. Cities sometimes add more. Your practical answer is usually 'both'.",
        },
        {
          q: "Can I be fired for any reason?",
          a: "At-will is the default in most private-sector jobs, but unlawful motives (discrimination, retaliation for protected activity, union organising) and contract/union protections create exceptions. This is highly fact-specific.",
        },
        {
          q: "Where should I file a wage complaint?",
          a: "Often with a state labour agency and sometimes concurrently under federal rules. The best venue depends on amounts, industry, and timing — a lawyer can route you quickly.",
        },
      ],
      prefilledQuestion: `Summarise the main ways employment law for an ordinary worker in ${state.name} differs from the generic US overview, including wage/hour and termination rules I should ask a lawyer about.`,
    };
  }

  const mergedIntro = mergeStateNotes(base.intro, state);
  const sections = [stateLayer, ...base.sections.map((s) => ({ ...s }))];

  return {
    slug: topic,
    stateCode: state.code,
    title: base.title.replace("United States", state.name).replace("the United States", state.name),
    intro: mergedIntro,
    sections,
    faqs: base.faqs.map((f) => ({
      q: f.q.replace(/United States/g, state.name).replace(/the US/g, state.name),
      a: f.a.replace(/United States/g, state.name).replace(/the US/g, state.name),
    })),
    prefilledQuestion: base.prefilledQuestion.replace(/United States/g, state.name),
  };
}
