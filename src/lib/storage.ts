/**
 * Persistence: chats, audits, usage counters, newsletter subscribers.
 * Prefers Upstash Redis (Vercel Marketplace / KV REST or classic Upstash env names).
 * Falls back to `tmp/basiclaw-storage.json` for local dev (ephemeral on Vercel).
 */

import fs from "node:fs/promises";
import path from "node:path";
import { Redis } from "@upstash/redis";

const FILE_PATH = path.join(process.cwd(), "tmp", "basiclaw-storage.json");

export interface StoredChat {
  id: string;
  userId: string;
  sessionId: string;
  jurisdiction: string;
  state?: string;
  title: string;
  messages: Array<{ role: string; content: string }>;
  updatedAt: string;
}

export interface StoredAudit {
  id: string;
  userId: string;
  auditType: string;
  jurisdiction: string;
  title: string;
  report: unknown;
  updatedAt: string;
}

export interface NewsletterSubscriber {
  email: string;
  jurisdiction: string;
  locale: string;
  userId?: string;
  createdAt: string;
}

export interface LawyerApplicationRecord {
  id: string;
  name: string;
  email: string;
  barNumber?: string;
  country: string;
  practiceAreas: string[];
  sampleStatement: string;
  headshotUrl?: string;
  receivedAt: string;
}

export interface UsageSnapshot {
  chatsToday: number;
  auditsThisMonth: number;
  demandLettersToday: number;
}

type FileStoreShape = {
  chats: StoredChat[];
  audits: StoredAudit[];
  subscribers: NewsletterSubscriber[];
  lawyerApplications: LawyerApplicationRecord[];
  /** Arbitrary string counters, e.g. `chatday:u:user:2026-01-15` */
  usage: Record<string, number>;
};

let redisClient: Redis | null | undefined;

function getRedis(): Redis | null {
  if (redisClient !== undefined) return redisClient;
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    redisClient = new Redis({ url, token });
  } else {
    redisClient = null;
  }
  return redisClient;
}

function utcDay(): string {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function utcMonth(): string {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function usageSubject(userId: string | null, ipHash: string): string {
  return userId ? `u:${userId}` : `ip:${ipHash}`;
}

async function readFileStore(): Promise<FileStoreShape> {
  try {
    const raw = await fs.readFile(FILE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as Partial<FileStoreShape>;
    return {
      chats: Array.isArray(parsed.chats) ? parsed.chats : [],
      audits: Array.isArray(parsed.audits) ? parsed.audits : [],
      subscribers: Array.isArray(parsed.subscribers) ? parsed.subscribers : [],
      lawyerApplications: Array.isArray(parsed.lawyerApplications) ? parsed.lawyerApplications : [],
      usage: parsed.usage && typeof parsed.usage === "object" ? parsed.usage : {},
    };
  } catch {
    return { chats: [], audits: [], subscribers: [], lawyerApplications: [], usage: {} };
  }
}

async function writeFileStore(data: FileStoreShape): Promise<void> {
  await fs.mkdir(path.dirname(FILE_PATH), { recursive: true });
  await fs.writeFile(FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function getUsage(userId: string | null, ipHash: string): Promise<UsageSnapshot> {
  const sub = usageSubject(userId, ipHash);
  const day = utcDay();
  const month = utcMonth();
  const redis = getRedis();
  if (redis) {
    const [c, a, d] = await Promise.all([
      redis.get<string>(`usage:chatday:${sub}:${day}`),
      redis.get<string>(`usage:auditmonth:${sub}:${month}`),
      redis.get<string>(`usage:demandday:${sub}:${day}`),
    ]);
    return {
      chatsToday: c ? Number.parseInt(c, 10) || 0 : 0,
      auditsThisMonth: a ? Number.parseInt(a, 10) || 0 : 0,
      demandLettersToday: d ? Number.parseInt(d, 10) || 0 : 0,
    };
  }
  const store = await readFileStore();
  const kc = `chatday:${sub}:${day}`;
  const ka = `auditmonth:${sub}:${month}`;
  const kd = `demandday:${sub}:${day}`;
  return {
    chatsToday: store.usage[kc] ?? 0,
    auditsThisMonth: store.usage[ka] ?? 0,
    demandLettersToday: store.usage[kd] ?? 0,
  };
}

export async function incrementUsage(
  kind: "chat" | "audit" | "demand_letter",
  userId: string | null,
  ipHash: string
): Promise<UsageSnapshot> {
  const sub = usageSubject(userId, ipHash);
  const day = utcDay();
  const month = utcMonth();
  const redis = getRedis();
  const dayTtl = 60 * 60 * 48;
  const monthTtl = 60 * 60 * 24 * 40;

  if (redis) {
    if (kind === "chat") {
      const key = `usage:chatday:${sub}:${day}`;
      const n = await redis.incr(key);
      if (n === 1) await redis.expire(key, dayTtl);
    } else if (kind === "audit") {
      const key = `usage:auditmonth:${sub}:${month}`;
      const n = await redis.incr(key);
      if (n === 1) await redis.expire(key, monthTtl);
    } else {
      const key = `usage:demandday:${sub}:${day}`;
      const n = await redis.incr(key);
      if (n === 1) await redis.expire(key, dayTtl);
    }
  } else {
    const store = await readFileStore();
    if (kind === "chat") {
      const k = `chatday:${sub}:${day}`;
      store.usage[k] = (store.usage[k] ?? 0) + 1;
    } else if (kind === "audit") {
      const k = `auditmonth:${sub}:${month}`;
      store.usage[k] = (store.usage[k] ?? 0) + 1;
    } else {
      const k = `demandday:${sub}:${day}`;
      store.usage[k] = (store.usage[k] ?? 0) + 1;
    }
    await writeFileStore(store);
  }

  return getUsage(userId, ipHash);
}

export async function saveChatForUser(chat: StoredChat): Promise<void> {
  const redis = getRedis();
  if (redis) {
    await redis.set(`chat:${chat.userId}:${chat.id}`, JSON.stringify(chat), { ex: 60 * 60 * 24 * 120 });
    await redis.sadd(`chat:index:${chat.userId}`, chat.id);
    return;
  }
  const store = await readFileStore();
  const others = store.chats.filter((c) => !(c.userId === chat.userId && c.id === chat.id));
  store.chats = [chat, ...others].slice(0, 500);
  await writeFileStore(store);
}

export async function listChatsForUser(userId: string): Promise<StoredChat[]> {
  const redis = getRedis();
  if (redis) {
    const ids = await redis.smembers(`chat:index:${userId}`);
    const rows: StoredChat[] = [];
    for (const id of ids) {
      const raw = await redis.get<string>(`chat:${userId}:${id}`);
      if (raw) {
        try {
          rows.push(JSON.parse(raw) as StoredChat);
        } catch {
          /* skip */
        }
      }
    }
    return rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }
  const store = await readFileStore();
  return store.chats.filter((c) => c.userId === userId).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function deleteChatForUser(userId: string, id: string): Promise<void> {
  const redis = getRedis();
  if (redis) {
    await redis.del(`chat:${userId}:${id}`);
    await redis.srem(`chat:index:${userId}`, id);
    return;
  }
  const store = await readFileStore();
  store.chats = store.chats.filter((c) => !(c.userId === userId && c.id === id));
  await writeFileStore(store);
}

export async function renameChatForUser(userId: string, id: string, title: string): Promise<void> {
  const redis = getRedis();
  if (redis) {
    const raw = await redis.get<string>(`chat:${userId}:${id}`);
    if (!raw) return;
    const chat = JSON.parse(raw) as StoredChat;
    chat.title = title;
    chat.updatedAt = new Date().toISOString();
    await redis.set(`chat:${userId}:${id}`, JSON.stringify(chat), { ex: 60 * 60 * 24 * 120 });
    return;
  }
  const store = await readFileStore();
  store.chats = store.chats.map((c) =>
    c.userId === userId && c.id === id ? { ...c, title, updatedAt: new Date().toISOString() } : c
  );
  await writeFileStore(store);
}

export async function saveAuditForUser(audit: StoredAudit): Promise<void> {
  const redis = getRedis();
  if (redis) {
    await redis.set(`audit:${audit.userId}:${audit.id}`, JSON.stringify(audit), { ex: 60 * 60 * 24 * 120 });
    await redis.sadd(`audit:index:${audit.userId}`, audit.id);
    return;
  }
  const store = await readFileStore();
  const others = store.audits.filter((a) => !(a.userId === audit.userId && a.id === audit.id));
  store.audits = [audit, ...others].slice(0, 300);
  await writeFileStore(store);
}

export async function listAuditsForUser(userId: string): Promise<StoredAudit[]> {
  const redis = getRedis();
  if (redis) {
    const ids = await redis.smembers(`audit:index:${userId}`);
    const rows: StoredAudit[] = [];
    for (const id of ids) {
      const raw = await redis.get<string>(`audit:${userId}:${id}`);
      if (raw) {
        try {
          rows.push(JSON.parse(raw) as StoredAudit);
        } catch {
          /* skip */
        }
      }
    }
    return rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }
  const store = await readFileStore();
  return store.audits.filter((a) => a.userId === userId).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getChatForUser(userId: string, id: string): Promise<StoredChat | null> {
  const redis = getRedis();
  if (redis) {
    const raw = await redis.get<string>(`chat:${userId}:${id}`);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as StoredChat;
    } catch {
      return null;
    }
  }
  const store = await readFileStore();
  return store.chats.find((c) => c.userId === userId && c.id === id) ?? null;
}

export async function getAuditForUser(userId: string, id: string): Promise<StoredAudit | null> {
  const redis = getRedis();
  if (redis) {
    const raw = await redis.get<string>(`audit:${userId}:${id}`);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as StoredAudit;
    } catch {
      return null;
    }
  }
  const store = await readFileStore();
  return store.audits.find((a) => a.userId === userId && a.id === id) ?? null;
}

export async function deleteAuditForUser(userId: string, id: string): Promise<void> {
  const redis = getRedis();
  if (redis) {
    await redis.del(`audit:${userId}:${id}`);
    await redis.srem(`audit:index:${userId}`, id);
    return;
  }
  const store = await readFileStore();
  store.audits = store.audits.filter((a) => !(a.userId === userId && a.id === id));
  await writeFileStore(store);
}

export async function addNewsletterSubscriber(row: NewsletterSubscriber): Promise<void> {
  const redis = getRedis();
  const email = row.email.toLowerCase();
  if (redis) {
    await redis.hset(`subscriber:${email}`, {
      email,
      jurisdiction: row.jurisdiction,
      locale: row.locale || "en",
      userId: row.userId ?? "",
      createdAt: row.createdAt,
    });
    await redis.sadd("subscribers:index", email);
    return;
  }
  const store = await readFileStore();
  const next: NewsletterSubscriber = {
    email,
    jurisdiction: row.jurisdiction,
    locale: row.locale || "en",
    userId: row.userId,
    createdAt: row.createdAt,
  };
  const others = store.subscribers.filter((s) => s.email !== email);
  store.subscribers = [next, ...others].slice(0, 50_000);
  await writeFileStore(store);
}

export async function appendLawyerApplication(row: LawyerApplicationRecord): Promise<void> {
  const redis = getRedis();
  if (redis) {
    await redis.set(`lawyer-application:${row.id}`, JSON.stringify(row), { ex: 60 * 60 * 24 * 365 * 2 });
    await redis.sadd("lawyer-applications:index", row.id);
    return;
  }
  const store = await readFileStore();
  const prev = Array.isArray(store.lawyerApplications) ? store.lawyerApplications : [];
  store.lawyerApplications = [row, ...prev].slice(0, 20_000);
  await writeFileStore(store);
}

export async function removeNewsletterSubscriber(email: string): Promise<void> {
  const e = email.toLowerCase();
  const redis = getRedis();
  if (redis) {
    await redis.del(`subscriber:${e}`);
    await redis.srem("subscribers:index", e);
    return;
  }
  const store = await readFileStore();
  store.subscribers = store.subscribers.filter((s) => s.email !== e);
  await writeFileStore(store);
}

export async function listNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
  const redis = getRedis();
  if (redis) {
    const emails = await redis.smembers("subscribers:index");
    const out: NewsletterSubscriber[] = [];
    for (const email of emails) {
      const h = await redis.hgetall<Record<string, string>>(`subscriber:${email}`);
      if (h?.email) {
        out.push({
          email: h.email,
          jurisdiction: h.jurisdiction ?? "us",
          locale: h.locale ?? "en",
          userId: h.userId || undefined,
          createdAt: h.createdAt ?? "",
        });
      }
    }
    return out;
  }
  const store = await readFileStore();
  return store.subscribers;
}

/** User-requested aliases */
export const getUserChats = listChatsForUser;
export const saveChat = saveChatForUser;
export const getUserAudits = listAuditsForUser;
export const saveAudit = saveAuditForUser;
export const getSubscribers = listNewsletterSubscribers;
export const addSubscriber = addNewsletterSubscriber;
export const removeSubscriber = removeNewsletterSubscriber;
