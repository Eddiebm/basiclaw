import { createHash, randomBytes, randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { getRedis } from "@/lib/redis-client";

export type EmbedTenantPlan = "free" | "pro";

export interface EmbedTenant {
  id: string;
  label: string;
  /** sha256 hex of raw API key */
  apiKeyHash: string;
  /** Non-secret prefix for admin lists */
  keyPrefix: string;
  allowedOrigins: string[];
  plan: EmbedTenantPlan;
  createdAt: string;
}

const FILE_PATH = path.join(process.cwd(), "tmp", "basiclaw-embed-tenants.json");

function hashApiKey(raw: string): string {
  return createHash("sha256").update(raw, "utf8").digest("hex");
}

export function generateEmbedApiKey(): string {
  return `blw_${randomBytes(24).toString("base64url")}`;
}

async function readFileTenants(): Promise<EmbedTenant[]> {
  try {
    const raw = await fs.readFile(FILE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as { tenants?: EmbedTenant[] };
    return Array.isArray(parsed.tenants) ? parsed.tenants : [];
  } catch {
    return [];
  }
}

async function writeFileTenants(rows: EmbedTenant[]): Promise<void> {
  await fs.mkdir(path.dirname(FILE_PATH), { recursive: true });
  await fs.writeFile(FILE_PATH, JSON.stringify({ tenants: rows }, null, 2), "utf-8");
}

function sanitiseTenant(t: EmbedTenant): Omit<EmbedTenant, "apiKeyHash"> {
  const { apiKeyHash: _h, ...rest } = t;
  void _h;
  return rest;
}

export async function listEmbedTenantsPublic(): Promise<Array<Omit<EmbedTenant, "apiKeyHash">>> {
  const all = await listEmbedTenants();
  return all.map(sanitiseTenant);
}

export async function listEmbedTenants(): Promise<EmbedTenant[]> {
  const redis = getRedis();
  if (redis) {
    const ids = await redis.smembers("embed-tenant:index");
    const out: EmbedTenant[] = [];
    for (const id of ids) {
      const raw = await redis.get<string>(`embed-tenant:${id}`);
      if (!raw) continue;
      try {
        out.push(JSON.parse(raw) as EmbedTenant);
      } catch {
        /* skip */
      }
    }
    return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  return readFileTenants();
}

export async function getEmbedTenantByKeyHash(hash: string): Promise<EmbedTenant | null> {
  const redis = getRedis();
  if (redis) {
    const id = await redis.get<string>(`embed-tenant:byhash:${hash}`);
    if (!id) return null;
    const raw = await redis.get<string>(`embed-tenant:${id}`);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as EmbedTenant;
    } catch {
      return null;
    }
  }
  const rows = await readFileTenants();
  return rows.find((r) => r.apiKeyHash === hash) ?? null;
}

export async function createEmbedTenant(input: {
  label: string;
  allowedOrigins: string[];
  plan: EmbedTenantPlan;
}): Promise<{ tenant: EmbedTenant; apiKey: string }> {
  const apiKey = generateEmbedApiKey();
  const apiKeyHash = hashApiKey(apiKey);
  const tenant: EmbedTenant = {
    id: randomUUID(),
    label: input.label.trim() || "Unnamed",
    apiKeyHash,
    keyPrefix: apiKey.slice(0, 14),
    allowedOrigins: [...new Set(input.allowedOrigins.map((o) => o.trim()).filter(Boolean))],
    plan: input.plan === "pro" ? "pro" : "free",
    createdAt: new Date().toISOString(),
  };

  const redis = getRedis();
  if (redis) {
    await redis.set(`embed-tenant:${tenant.id}`, JSON.stringify(tenant));
    await redis.set(`embed-tenant:byhash:${apiKeyHash}`, tenant.id);
    await redis.sadd("embed-tenant:index", tenant.id);
    return { tenant, apiKey };
  }

  const rows = await readFileTenants();
  const others = rows.filter((r) => r.id !== tenant.id);
  await writeFileTenants([tenant, ...others].slice(0, 5000));
  return { tenant, apiKey };
}
