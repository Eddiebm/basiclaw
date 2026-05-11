import fs from "node:fs";
import path from "node:path";
import type { CitizenQuestion } from "./types";

let cache: CitizenQuestion[] | null = null;

export function getAllCitizenQuestions(): CitizenQuestion[] {
  if (cache) return cache;
  const filePath = path.join(process.cwd(), "src/data/questions/questions.v1.jsonl");
  const raw = fs.readFileSync(filePath, "utf8");
  cache = raw
    .trim()
    .split("\n")
    .filter((line) => line.length > 0)
    .map((line) => JSON.parse(line) as CitizenQuestion);
  return cache;
}

export function getCitizenQuestionsByStage(stage: CitizenQuestion["stage"]): CitizenQuestion[] {
  return getAllCitizenQuestions().filter((q) => q.stage === stage);
}

export function getStageDomainCounts(): Record<string, Record<string, number>> {
  const out: Record<string, Record<string, number>> = {};
  for (const q of getAllCitizenQuestions()) {
    if (!out[q.stage]) out[q.stage] = {};
    out[q.stage][q.domain] = (out[q.stage][q.domain] ?? 0) + 1;
  }
  return out;
}
