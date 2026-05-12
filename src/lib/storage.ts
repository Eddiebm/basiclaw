// TODO: replace with full Clerk/Upstash/Stripe implementation.

import type { BillingPlan } from "@/lib/entitlements";
import { limitsForPlan, type PlanLimits } from "@/lib/limits";

export type StoredChat = {
  id: string;
  title: string;
  jurisdiction: string;
  state?: string | null;
  updatedAt: string;
};

export type UsageSnapshot = {
  chatsToday: number;
  auditsThisMonth: number;
  demandLettersToday: number;
};

export type StoredAuditRecord = {
  id: string;
  title: string;
  auditType: string;
  jurisdiction: string;
  updatedAt: string;
  report: unknown;
};

type DbShape = {
  chatsByUser: Record<string, StoredChat[]>;
  auditsByUser: Record<string, StoredAuditRecord[]>;
  usageByUser: Record<string, UsageSnapshot>;
};

const emptyUsage = (): UsageSnapshot => ({
  chatsToday: 0,
  auditsThisMonth: 0,
  demandLettersToday: 0,
});

const volatileDb: DbShape = { chatsByUser: {}, auditsByUser: {}, usageByUser: {} };

async function readDb(): Promise<DbShape> {
  return volatileDb;
}

async function writeDb(): Promise<void> {}

export async function listChatsForUser(userId: string | null): Promise<StoredChat[]> {
  if (!userId) return [];
  const db = await readDb();
  return db.chatsByUser[userId] ?? [];
}

export async function listAuditsForUser(userId: string | null): Promise<StoredAuditRecord[]> {
  if (!userId) return [];
  const db = await readDb();
  return db.auditsByUser[userId] ?? [];
}

export async function getUsageSnapshot(userId: string | null): Promise<UsageSnapshot> {
  if (!userId) return emptyUsage();
  const db = await readDb();
  return db.usageByUser[userId] ?? emptyUsage();
}

export async function getDashboardUsageBundle(userId: string | null): Promise<{
  plan: BillingPlan;
  usage: UsageSnapshot;
  limits: PlanLimits;
}> {
  const plan: BillingPlan = "free";
  const usage = await getUsageSnapshot(userId);
  return { plan, usage, limits: limitsForPlan(plan) };
}

export async function deleteChatForUser(userId: string | null, chatId: string): Promise<boolean> {
  if (!userId) return false;
  const db = await readDb();
  const list = db.chatsByUser[userId];
  if (!list) return false;
  const next = list.filter((c) => c.id !== chatId);
  if (next.length === list.length) return false;
  db.chatsByUser[userId] = next;
  await writeDb();
  return true;
}

export async function renameChatForUser(userId: string | null, chatId: string, title: string): Promise<boolean> {
  if (!userId || !title.trim()) return false;
  const db = await readDb();
  const list = db.chatsByUser[userId];
  if (!list) return false;
  const idx = list.findIndex((c) => c.id === chatId);
  if (idx === -1) return false;
  list[idx] = { ...list[idx], title: title.trim(), updatedAt: new Date().toISOString() };
  await writeDb();
  return true;
}

export async function upsertChatMessages(
  userId: string | null,
  chatId: string,
  payload: { jurisdiction: string; messages: { role: string; content: string }[] }
): Promise<void> {
  if (!userId) return;
  const db = await readDb();
  const list = db.chatsByUser[userId] ? [...db.chatsByUser[userId]] : [];
  const titleFrom = payload.messages.find((m) => m.role === "user")?.content?.slice(0, 80) ?? "Chat";
  const idx = list.findIndex((c) => c.id === chatId);
  const row: StoredChat = {
    id: chatId,
    title: idx === -1 ? titleFrom : list[idx].title,
    jurisdiction: payload.jurisdiction.toLowerCase(),
    state: idx === -1 ? null : list[idx].state,
    updatedAt: new Date().toISOString(),
  };
  if (idx === -1) list.unshift(row);
  else list[idx] = { ...list[idx], ...row };
  db.chatsByUser[userId] = list;
  await writeDb();
}

export async function deleteAuditForUser(userId: string | null, auditId: string): Promise<boolean> {
  if (!userId) return false;
  const db = await readDb();
  const list = db.auditsByUser[userId];
  if (!list) return false;
  const next = list.filter((a) => a.id !== auditId);
  if (next.length === list.length) return false;
  db.auditsByUser[userId] = next;
  await writeDb();
  return true;
}
