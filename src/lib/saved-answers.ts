import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { getRedis } from "@/lib/redis-client";
import { stripPIIForPublish } from "@/lib/answer-pii";
import { cosineSimilarity } from "@/lib/rag-embeddings";

const ANSWERS_FILE = path.join(process.cwd(), "tmp", "basiclaw-answers.json");

const PAGE_SIZE_DEFAULT = 20;
const MAX_EMB_SCAN = 400;
const MAX_LIST_SCAN = 2000;

export interface SavedCitation {
  id: string;
  title: string;
  source: string;
  snippet: string;
  url?: string;
  kind?: "snippet" | "case";
}

export interface SavedAnswer {
  id: string;
  question: string;
  answer: string;
  jurisdiction: string;
  locale: string;
  citations: SavedCitation[];
  userId?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  upvotes: number;
  downvotes: number;
  verifiedBy?: string;
  /** Optional reviewer note stored when an admin verifies an answer */
  verificationNote?: string;
}

export type SavedAnswerPublic = Omit<SavedAnswer, "userId">;

type AnswersFileShape = {
  answers: SavedAnswer[];
  embeddingsPublic: Record<string, number[]>;
  voteActors: Record<string, Record<string, "up" | "down">>;
};

async function readAnswersFile(): Promise<AnswersFileShape> {
  try {
    const raw = await fs.readFile(ANSWERS_FILE, "utf-8");
    const p = JSON.parse(raw) as Partial<AnswersFileShape>;
    return {
      answers: Array.isArray(p.answers) ? p.answers : [],
      embeddingsPublic: p.embeddingsPublic && typeof p.embeddingsPublic === "object" ? p.embeddingsPublic : {},
      voteActors: p.voteActors && typeof p.voteActors === "object" ? p.voteActors : {},
    };
  } catch {
    return { answers: [], embeddingsPublic: {}, voteActors: {} };
  }
}

async function writeAnswersFile(data: AnswersFileShape): Promise<void> {
  await fs.mkdir(path.dirname(ANSWERS_FILE), { recursive: true });
  await fs.writeFile(ANSWERS_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export function toPublicAnswer(a: SavedAnswer): SavedAnswerPublic {
  const { userId, ...rest } = a;
  void userId;
  return rest;
}

function scoreUpdatedAt(a: SavedAnswer): number {
  return new Date(a.updatedAt).getTime() || 0;
}

function scoreVotes(a: SavedAnswer): number {
  return a.upvotes * 10_000 - a.downvotes + scoreUpdatedAt(a) / 1e15;
}

const kAnswer = (id: string) => `answers:byId:${id}`;
const kPublicZ = () => "answers:public";
const kUserZ = (userId: string) => `answers:user:${userId}`;
const kJurSet = (code: string) => `answers:byJurisdiction:${code.toLowerCase()}`;
const kEmbHash = () => "answers:embeddings:public";
const kVoters = (id: string) => `answers:voters:${id}`;

export async function getAnswer(id: string): Promise<SavedAnswer | null> {
  const redis = getRedis();
  if (redis) {
    const raw = await redis.get<string>(kAnswer(id));
    if (!raw) return null;
    try {
      return JSON.parse(raw) as SavedAnswer;
    } catch {
      return null;
    }
  }
  const store = await readAnswersFile();
  return store.answers.find((a) => a.id === id) ?? null;
}

export async function getAnswerPublicOrOwner(id: string, userId: string | null): Promise<SavedAnswer | null> {
  const a = await getAnswer(id);
  if (!a) return null;
  if (a.isPublic) return a;
  if (userId && a.userId === userId) return a;
  return null;
}

export async function listUserAnswers(userId: string, page = 1, pageSize = PAGE_SIZE_DEFAULT): Promise<SavedAnswer[]> {
  const redis = getRedis();
  const start = Math.max(0, (page - 1) * pageSize);
  const end = start + pageSize - 1;
  if (redis) {
    const ids = await redis.zrange(kUserZ(userId), start, end, { rev: true });
    const out: SavedAnswer[] = [];
    for (const id of ids) {
      const a = await getAnswer(String(id));
      if (a) out.push(a);
    }
    return out;
  }
  const store = await readAnswersFile();
  return store.answers
    .filter((a) => a.userId === userId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(start, end + 1);
}

export async function listPublicAnswers(opts: {
  jurisdiction?: string;
  query?: string;
  queryEmbedding?: number[] | null;
  page?: number;
  pageSize?: number;
  sort?: "recent" | "votes";
}): Promise<SavedAnswerPublic[]> {
  return listPublicAnswersResolved(opts);
}

export async function listPublicAnswersResolved(opts: {
  jurisdiction?: string;
  query?: string;
  queryEmbedding?: number[] | null;
  page?: number;
  pageSize?: number;
  sort?: "recent" | "votes";
}): Promise<SavedAnswerPublic[]> {
  const page = opts.page ?? 1;
  const pageSize = opts.pageSize ?? PAGE_SIZE_DEFAULT;
  const start = Math.max(0, (page - 1) * pageSize);
  const redis = getRedis();

  let candidates: SavedAnswer[] = [];
  if (redis) {
    let ids: string[] = [];
    if (opts.jurisdiction) {
      ids = await redis.smembers(kJurSet(opts.jurisdiction));
    } else {
      ids = (await redis.zrange(kPublicZ(), 0, MAX_LIST_SCAN, { rev: true })).map(String);
    }
    let n = 0;
    for (const id of ids) {
      if (n++ > MAX_LIST_SCAN) break;
      const a = await getAnswer(String(id));
      if (a?.isPublic) candidates.push(a);
    }
  } else {
    const store = await readAnswersFile();
    candidates = store.answers.filter((a) => a.isPublic);
    if (opts.jurisdiction) {
      const jur = opts.jurisdiction.toLowerCase();
      candidates = candidates.filter((a) => a.jurisdiction === jur);
    }
  }

  let list = candidates;
  const q = opts.query?.trim().toLowerCase();
  if (q && !(opts.queryEmbedding && opts.queryEmbedding.length)) {
    list = list.filter((a) => a.question.toLowerCase().includes(q) || a.answer.toLowerCase().includes(q));
  }

  if (opts.queryEmbedding && opts.queryEmbedding.length > 0) {
    const embMap = await getAllPublicEmbeddings();
    const scored = list
      .map((a) => {
        const vec = embMap[a.id];
        const s = vec && vec.length === opts.queryEmbedding!.length ? cosineSimilarity(opts.queryEmbedding!, vec) : -1;
        return { a, s };
      })
      .filter((x) => x.s >= 0)
      .sort((x, y) => y.s - x.s);
    list = scored.map((x) => x.a);
  } else if (opts.sort === "votes") {
    list = [...list].sort((a, b) => scoreVotes(b) - scoreVotes(a));
  } else {
    list = [...list].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  return list.slice(start, start + pageSize).map(toPublicAnswer);
}

export async function listPublicAnswersAdmin(opts: {
  jurisdiction?: string;
  verified?: "all" | "yes" | "no";
  minNetVotes?: number;
  page?: number;
  pageSize?: number;
  sort?: "recent" | "votes";
}): Promise<SavedAnswer[]> {
  const page = opts.page ?? 1;
  const pageSize = opts.pageSize ?? 50;
  const start = Math.max(0, (page - 1) * pageSize);
  const redis = getRedis();

  let candidates: SavedAnswer[] = [];
  if (redis) {
    let ids: string[] = [];
    if (opts.jurisdiction) {
      ids = await redis.smembers(kJurSet(opts.jurisdiction));
    } else {
      ids = (await redis.zrange(kPublicZ(), 0, MAX_LIST_SCAN, { rev: true })).map(String);
    }
    let n = 0;
    for (const id of ids) {
      if (n++ > MAX_LIST_SCAN) break;
      const a = await getAnswer(String(id));
      if (a?.isPublic) candidates.push(a);
    }
  } else {
    const store = await readAnswersFile();
    candidates = store.answers.filter((a) => a.isPublic);
    if (opts.jurisdiction) {
      const jur = opts.jurisdiction.toLowerCase();
      candidates = candidates.filter((a) => a.jurisdiction === jur);
    }
  }

  let list = candidates;
  const v = opts.verified ?? "all";
  if (v === "yes") list = list.filter((a) => Boolean(a.verifiedBy));
  else if (v === "no") list = list.filter((a) => !a.verifiedBy);

  const minNet = opts.minNetVotes ?? 0;
  if (minNet > 0) {
    list = list.filter((a) => a.upvotes - a.downvotes >= minNet);
  }

  if (opts.sort === "votes") {
    list = [...list].sort((a, b) => scoreVotes(b) - scoreVotes(a));
  } else {
    list = [...list].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  return list.slice(start, start + pageSize);
}

async function getAllPublicEmbeddings(): Promise<Record<string, number[]>> {
  const redis = getRedis();
  if (redis) {
    const h = await redis.hgetall<Record<string, string>>(kEmbHash());
    const out: Record<string, number[]> = {};
    if (h) {
      for (const [id, json] of Object.entries(h)) {
        try {
          const v = JSON.parse(json) as number[];
          if (Array.isArray(v)) out[id] = v;
        } catch {
          /* skip */
        }
      }
    }
    return out;
  }
  const store = await readAnswersFile();
  return store.embeddingsPublic;
}

export async function listAllPublicAnswerIds(): Promise<string[]> {
  const redis = getRedis();
  if (redis) {
    return (await redis.zrange(kPublicZ(), 0, -1)).map(String);
  }
  const store = await readAnswersFile();
  return store.answers.filter((a) => a.isPublic).map((a) => a.id);
}

export type SimilarMatch = { id: string; score: number; record: SavedAnswer };

export async function findSimilarPublicAnswers(
  queryEmbedding: number[] | null,
  jurisdiction: string
): Promise<{ cache?: SimilarMatch; related: SimilarMatch[] }> {
  const related: SimilarMatch[] = [];
  if (!queryEmbedding?.length) return { related };

  const jur = jurisdiction.toLowerCase();
  const redis = getRedis();
  const scored: SimilarMatch[] = [];

  if (redis) {
    const ids = await redis.smembers(kJurSet(jur));
    let n = 0;
    for (const id of ids) {
      if (n++ > MAX_EMB_SCAN) break;
      const raw = await redis.hget<string>(kEmbHash(), String(id));
      if (!raw) continue;
      let vec: number[];
      try {
        vec = JSON.parse(raw) as number[];
      } catch {
        continue;
      }
      if (!Array.isArray(vec) || vec.length !== queryEmbedding.length) continue;
      const record = await getAnswer(String(id));
      if (!record?.isPublic) continue;
      scored.push({ id: String(id), score: cosineSimilarity(queryEmbedding, vec), record });
    }
  } else {
    const store = await readAnswersFile();
    for (const a of store.answers) {
      if (!a.isPublic || a.jurisdiction !== jur) continue;
      const vec = store.embeddingsPublic[a.id];
      if (!vec || vec.length !== queryEmbedding.length) continue;
      scored.push({ id: a.id, score: cosineSimilarity(queryEmbedding, vec), record: a });
    }
  }

  scored.sort((x, y) => y.score - x.score);
  const top = scored[0];
  let cache: SimilarMatch | undefined;
  if (top && top.score >= 0.92) {
    const ok = top.record.upvotes >= 1 || Boolean(top.record.verifiedBy);
    if (ok) cache = top;
  }
  for (const s of scored) {
    if (cache && s.id === cache.id) continue;
    if (s.score >= 0.8 && s.score < 0.92) {
      related.push(s);
      if (related.length >= 8) break;
    }
  }
  return { cache, related };
}

async function setPublicEmbedding(id: string, vec: number[]): Promise<void> {
  const redis = getRedis();
  if (redis) {
    await redis.hset(kEmbHash(), { [id]: JSON.stringify(vec) });
    return;
  }
  const store = await readAnswersFile();
  store.embeddingsPublic[id] = vec;
  await writeAnswersFile(store);
}

async function removePublicEmbedding(id: string): Promise<void> {
  const redis = getRedis();
  if (redis) {
    await redis.hdel(kEmbHash(), id);
    return;
  }
  const store = await readAnswersFile();
  delete store.embeddingsPublic[id];
  await writeAnswersFile(store);
}

export async function rebuildPublicEmbeddingsIndex(embedFn: (text: string) => Promise<number[] | null>): Promise<{ count: number }> {
  const redis = getRedis();
  let count = 0;
  if (redis) {
    const ids = await redis.zrange(kPublicZ(), 0, -1);
    await redis.del(kEmbHash());
    for (const id of ids) {
      const a = await getAnswer(String(id));
      if (!a?.isPublic) continue;
      const vec = await embedFn(a.question);
      if (vec) {
        await setPublicEmbedding(a.id, vec);
        count += 1;
      }
    }
  } else {
    const store = await readAnswersFile();
    store.embeddingsPublic = {};
    for (const a of store.answers.filter((x) => x.isPublic)) {
      const vec = await embedFn(a.question);
      if (vec) {
        store.embeddingsPublic[a.id] = vec;
        count += 1;
      }
    }
    await writeAnswersFile(store);
  }
  return { count };
}

export async function voteAnswer(id: string, direction: "up" | "down", actorKey: string): Promise<SavedAnswer | null> {
  const a = await getAnswer(id);
  if (!a) return null;

  const redis = getRedis();
  if (redis) {
    const prev = await redis.hget<string>(kVoters(id), actorKey);
    let up = a.upvotes;
    let down = a.downvotes;
    let next: "up" | "down" | null = direction;
    if (prev === direction) {
      next = null;
      if (direction === "up") up -= 1;
      else down -= 1;
    } else if (prev === "up" && direction === "down") {
      up -= 1;
      down += 1;
    } else if (prev === "down" && direction === "up") {
      down -= 1;
      up += 1;
    } else if (!prev) {
      if (direction === "up") up += 1;
      else down += 1;
    }
    if (next) await redis.hset(kVoters(id), { [actorKey]: next });
    else await redis.hdel(kVoters(id), actorKey);
    const nextRow: SavedAnswer = { ...a, upvotes: Math.max(0, up), downvotes: Math.max(0, down), updatedAt: new Date().toISOString() };
    await redis.set(kAnswer(id), JSON.stringify(nextRow));
    return nextRow;
  }

  const store = await readAnswersFile();
  const idx = store.answers.findIndex((x) => x.id === id);
  if (idx < 0) return null;
  const cur = store.answers[idx];
  const actors = { ...(store.voteActors[id] ?? {}) };
  const prev = actors[actorKey];
  let up = cur.upvotes;
  let down = cur.downvotes;
  if (prev === direction) {
    delete actors[actorKey];
    if (direction === "up") up -= 1;
    else down -= 1;
  } else if (prev === "up" && direction === "down") {
    actors[actorKey] = "down";
    up -= 1;
    down += 1;
  } else if (prev === "down" && direction === "up") {
    actors[actorKey] = "up";
    down -= 1;
    up += 1;
  } else if (!prev) {
    actors[actorKey] = direction;
    if (direction === "up") up += 1;
    else down += 1;
  }
  const nextRow: SavedAnswer = { ...cur, upvotes: Math.max(0, up), downvotes: Math.max(0, down), updatedAt: new Date().toISOString() };
  store.answers[idx] = nextRow;
  if (Object.keys(actors).length) store.voteActors[id] = actors;
  else delete store.voteActors[id];
  await writeAnswersFile(store);
  return nextRow;
}

export async function togglePublic(id: string, userId: string, embedding?: number[] | null): Promise<SavedAnswer | null> {
  const a = await getAnswer(id);
  if (!a || a.userId !== userId) return null;
  const nextPublic = !a.isPublic;
  const now = new Date().toISOString();
  const redis = getRedis();

  if (nextPublic) {
    const q = stripPIIForPublish(a.question);
    const nextRow: SavedAnswer = {
      ...a,
      isPublic: true,
      question: q,
      updatedAt: now,
      userId,
    };
    if (embedding?.length) await setPublicEmbedding(id, embedding);
    if (redis) {
      await redis.set(kAnswer(id), JSON.stringify(nextRow));
      await redis.zadd(kPublicZ(), { score: scoreUpdatedAt(nextRow), member: id });
      await redis.sadd(kJurSet(nextRow.jurisdiction), id);
    } else {
      const store = await readAnswersFile();
      const idx = store.answers.findIndex((x) => x.id === id);
      if (idx >= 0) {
        store.answers[idx] = nextRow;
        if (embedding?.length) store.embeddingsPublic[id] = embedding;
        await writeAnswersFile(store);
      }
    }
    return nextRow;
  }

  const nextRow: SavedAnswer = { ...a, isPublic: false, updatedAt: now, userId };
  await removePublicEmbedding(id);
  if (redis) {
    await redis.set(kAnswer(id), JSON.stringify(nextRow));
    await redis.zrem(kPublicZ(), id);
    await redis.srem(kJurSet(a.jurisdiction), id);
  } else {
    const store = await readAnswersFile();
    const idx = store.answers.findIndex((x) => x.id === id);
    if (idx >= 0) {
      store.answers[idx] = nextRow;
      delete store.embeddingsPublic[id];
      await writeAnswersFile(store);
    }
  }
  return nextRow;
}

export async function deleteAnswer(id: string, userId: string): Promise<boolean> {
  const a = await getAnswer(id);
  if (!a || a.userId !== userId) return false;
  const redis = getRedis();
  if (redis) {
    await redis.del(kAnswer(id));
    await redis.zrem(kPublicZ(), id);
    await redis.srem(kJurSet(a.jurisdiction), id);
    if (a.userId) await redis.zrem(kUserZ(a.userId), id);
    await removePublicEmbedding(id);
    await redis.del(kVoters(id));
    return true;
  }
  const store = await readAnswersFile();
  store.answers = store.answers.filter((x) => x.id !== id);
  delete store.embeddingsPublic[id];
  delete store.voteActors[id];
  await writeAnswersFile(store);
  return true;
}

export async function adminUnpublishAnswer(id: string): Promise<boolean> {
  const a = await getAnswer(id);
  if (!a || !a.isPublic) return false;
  const now = new Date().toISOString();
  const nextRow: SavedAnswer = { ...a, isPublic: false, updatedAt: now };
  await removePublicEmbedding(id);
  const redis = getRedis();
  if (redis) {
    await redis.set(kAnswer(id), JSON.stringify(nextRow));
    await redis.zrem(kPublicZ(), id);
    await redis.srem(kJurSet(a.jurisdiction), id);
    return true;
  }
  const store = await readAnswersFile();
  const idx = store.answers.findIndex((x) => x.id === id);
  if (idx < 0) return false;
  store.answers[idx] = nextRow;
  delete store.embeddingsPublic[id];
  await writeAnswersFile(store);
  return true;
}

export async function adminDeleteAnswer(id: string): Promise<boolean> {
  const a = await getAnswer(id);
  if (!a) return false;
  const redis = getRedis();
  if (redis) {
    await redis.del(kAnswer(id));
    await redis.zrem(kPublicZ(), id);
    await redis.srem(kJurSet(a.jurisdiction), id);
    if (a.userId) await redis.zrem(kUserZ(a.userId), id);
    await removePublicEmbedding(id);
    await redis.del(kVoters(id));
    return true;
  }
  const store = await readAnswersFile();
  store.answers = store.answers.filter((x) => x.id !== id);
  delete store.embeddingsPublic[id];
  delete store.voteActors[id];
  await writeAnswersFile(store);
  return true;
}

export async function verifyAnswer(id: string, lawyerId: string, statement?: string): Promise<SavedAnswer | null> {
  const a = await getAnswer(id);
  if (!a) return null;
  const note = statement?.trim();
  const next: SavedAnswer = {
    ...a,
    verifiedBy: lawyerId,
    updatedAt: new Date().toISOString(),
    ...(note ? { verificationNote: note } : {}),
  };
  const redis = getRedis();
  if (redis) {
    await redis.set(kAnswer(id), JSON.stringify(next));
    return next;
  }
  const store = await readAnswersFile();
  const idx = store.answers.findIndex((x) => x.id === id);
  if (idx >= 0) {
    store.answers[idx] = next;
    await writeAnswersFile(store);
  }
  return next;
}

export async function saveAnswer(input: {
  question: string;
  answer: string;
  jurisdiction: string;
  locale: string;
  citations: SavedCitation[];
  userId: string;
}): Promise<SavedAnswer> {
  return saveChatExchangeAsAnswer(input);
}

export async function saveChatExchangeAsAnswer(input: {
  question: string;
  answer: string;
  jurisdiction: string;
  locale: string;
  citations: SavedCitation[];
  userId: string;
}): Promise<SavedAnswer> {
  const id = randomUUID();
  const now = new Date().toISOString();
  const row: SavedAnswer = {
    id,
    question: input.question.trim(),
    answer: input.answer.trim(),
    jurisdiction: input.jurisdiction.toLowerCase(),
    locale: input.locale || "en",
    citations: input.citations ?? [],
    userId: input.userId,
    isPublic: false,
    createdAt: now,
    updatedAt: now,
    upvotes: 0,
    downvotes: 0,
  };
  const redis = getRedis();
  if (redis) {
    await redis.set(kAnswer(id), JSON.stringify(row));
    await redis.zadd(kUserZ(input.userId), { score: scoreUpdatedAt(row), member: id });
    return row;
  }
  const store = await readAnswersFile();
  store.answers = [row, ...store.answers].slice(0, 50_000);
  await writeAnswersFile(store);
  return row;
}

export async function searchPublicAnswersSemantic(
  queryEmbedding: number[] | null,
  jurisdiction: string | undefined,
  limit = 10
): Promise<Array<{ record: SavedAnswerPublic; score: number; snippet: string }>> {
  if (!queryEmbedding?.length) return [];
  const jur = jurisdiction?.toLowerCase();
  const redis = getRedis();
  const scored: Array<{ record: SavedAnswer; score: number }> = [];

  if (redis) {
    const ids = jur ? await redis.smembers(kJurSet(jur)) : await redis.zrange(kPublicZ(), 0, MAX_LIST_SCAN, { rev: true });
    let n = 0;
    for (const id of ids) {
      if (n++ > MAX_EMB_SCAN * 2) break;
      const raw = await redis.hget<string>(kEmbHash(), String(id));
      if (!raw) continue;
      let vec: number[];
      try {
        vec = JSON.parse(raw) as number[];
      } catch {
        continue;
      }
      if (!Array.isArray(vec) || vec.length !== queryEmbedding.length) continue;
      const record = await getAnswer(String(id));
      if (!record?.isPublic) continue;
      if (jur && record.jurisdiction !== jur) continue;
      scored.push({ record, score: cosineSimilarity(queryEmbedding, vec) });
    }
  } else {
    const store = await readAnswersFile();
    for (const a of store.answers) {
      if (!a.isPublic) continue;
      if (jur && a.jurisdiction !== jur) continue;
      const vec = store.embeddingsPublic[a.id];
      if (!vec || vec.length !== queryEmbedding.length) continue;
      scored.push({ record: a, score: cosineSimilarity(queryEmbedding, vec) });
    }
  }

  scored.sort((x, y) => y.score - x.score);
  return scored.slice(0, limit).map(({ record, score }) => ({
    record: toPublicAnswer(record),
    score,
    snippet: record.answer.slice(0, 220).replace(/\s+/g, " ").trim(),
  }));
}

export async function suggestPublicAnswers(country: string, limit = 6): Promise<SavedAnswerPublic[]> {
  const jur = country.toLowerCase();
  const topVotes = await listPublicAnswersResolved({ jurisdiction: jur, page: 1, pageSize: 40, sort: "votes" });
  const recent = await listPublicAnswersResolved({ jurisdiction: jur, page: 1, pageSize: 40, sort: "recent" });
  const seen = new Set<string>();
  const out: SavedAnswerPublic[] = [];
  for (const x of [...topVotes, ...recent]) {
    if (seen.has(x.id)) continue;
    seen.add(x.id);
    out.push(x);
    if (out.length >= limit) break;
  }
  return out;
}
