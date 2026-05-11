import type { CitizenQuestion } from "@/data/questions/types";
import type { Domain } from "@/data/questions/taxonomy";
import { domainHasFullCoverageForCountry, isStrongCountry } from "@/data/questions/country-coverage";

export type AnswerAvailability = "full" | "limited";

export function answerAvailabilityForQuestion(
  question: CitizenQuestion,
  activeCountryCodeUpper: string
): AnswerAvailability {
  const upper = activeCountryCodeUpper.trim().toUpperCase();
  if (!isStrongCountry(upper)) return "limited";
  return domainHasFullCoverageForCountry(question.domain as Domain, upper) ? "full" : "limited";
}

export function buildChatPrefillHref(args: {
  questionText: string;
  activeCountryCodeLower: string;
  stage?: string;
  domain?: string;
  risk?: string;
}): string {
  const qs = new URLSearchParams();
  qs.set("prefill", args.questionText);
  qs.set("country", args.activeCountryCodeLower.toLowerCase());
  if (args.stage) qs.set("stage", args.stage);
  if (args.domain) qs.set("domain", args.domain);
  if (args.risk) qs.set("risk", args.risk);
  return `/chat?${qs.toString()}`;
}
