import fs from "node:fs/promises";
import path from "node:path";
import * as Sentry from "@sentry/nextjs";
import { Resend } from "resend";
import { generateChatCompletionText } from "@/lib/llm-chat-completion";
import { getRedis } from "@/lib/redis-client";
import { getStripe } from "@/lib/stripe";

export type HealthStatus = "green" | "yellow" | "red";

export type HealthCheckResult = {
  id: string;
  label: string;
  status: HealthStatus;
  latencyMs?: number;
  detail?: string;
};

const HEALTH_TMP = path.join(process.cwd(), "tmp", ".internal-health-ping");

async function checkEmbedApi(baseUrl: string): Promise<HealthCheckResult> {
  const id = "embed_api";
  const label = "Embed API (/api/embed/health)";
  const t0 = Date.now();
  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, "")}/api/embed/health`, { cache: "no-store" });
    const latencyMs = Date.now() - t0;
    if (!res.ok) return { id, label, status: "red", latencyMs, detail: `HTTP ${res.status}` };
    const j = (await res.json()) as { ok?: boolean };
    return j.ok ? { id, label, status: "green", latencyMs } : { id, label, status: "yellow", latencyMs, detail: "Unexpected body" };
  } catch (e) {
    return { id, label, status: "red", latencyMs: Date.now() - t0, detail: e instanceof Error ? e.message : "fetch failed" };
  }
}

async function checkSentry(): Promise<HealthCheckResult> {
  const id = "sentry";
  const label = "Sentry (client capture)";
  const t0 = Date.now();
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim() || process.env.SENTRY_DSN?.trim();
  if (!dsn) {
    return { id, label, status: "yellow", detail: "NEXT_PUBLIC_SENTRY_DSN / SENTRY_DSN not set" };
  }
  try {
    Sentry.captureMessage("basiclaw.internal_health_ping", { level: "info" });
    return { id, label, status: "green", latencyMs: Date.now() - t0 };
  } catch (e) {
    return { id, label, status: "red", latencyMs: Date.now() - t0, detail: e instanceof Error ? e.message : "error" };
  }
}

async function checkStorage(): Promise<HealthCheckResult> {
  const id = "storage";
  const label = "Storage (KV / file round-trip)";
  const t0 = Date.now();
  const token = `ping-${Date.now()}`;
  try {
    const redis = getRedis();
    if (redis) {
      const k = "internal:health:ping";
      await redis.set(k, token, { ex: 120 });
      const got = await redis.get<string>(k);
      await redis.del(k);
      if (got !== token) return { id, label, status: "red", latencyMs: Date.now() - t0, detail: "Redis read mismatch" };
      return { id, label, status: "green", latencyMs: Date.now() - t0 };
    }
    await fs.mkdir(path.dirname(HEALTH_TMP), { recursive: true });
    await fs.writeFile(HEALTH_TMP, token, "utf-8");
    const read = await fs.readFile(HEALTH_TMP, "utf-8");
    if (read !== token) return { id, label, status: "red", latencyMs: Date.now() - t0, detail: "File read mismatch" };
    return { id, label, status: "green", latencyMs: Date.now() - t0, detail: "file backend (ephemeral on serverless)" };
  } catch (e) {
    return { id, label, status: "red", latencyMs: Date.now() - t0, detail: e instanceof Error ? e.message : "error" };
  }
}

async function checkLlm(): Promise<HealthCheckResult> {
  const id = "llm";
  const label = "AI Gateway / OpenRouter";
  const t0 = Date.now();
  const hasKey =
    Boolean(process.env.AI_GATEWAY_API_KEY?.trim()) || Boolean(process.env.OPENROUTER_API_KEY?.trim());
  if (!hasKey) {
    return { id, label, status: "yellow", detail: "No AI_GATEWAY_API_KEY or OPENROUTER_API_KEY" };
  }
  try {
    await generateChatCompletionText({
      messages: [
        { role: "system", content: "Reply with exactly: OK" },
        { role: "user", content: "Ping." },
      ],
      maxTokens: 8,
      temperature: 0,
    });
    return { id, label, status: "green", latencyMs: Date.now() - t0 };
  } catch (e) {
    return { id, label, status: "red", latencyMs: Date.now() - t0, detail: e instanceof Error ? e.message : "LLM error" };
  }
}

async function checkStripe(): Promise<HealthCheckResult> {
  const id = "stripe";
  const label = "Stripe API";
  const t0 = Date.now();
  if (!process.env.STRIPE_SECRET_KEY?.trim()) {
    return { id, label, status: "yellow", detail: "STRIPE_SECRET_KEY not set" };
  }
  try {
    const stripe = getStripe();
    await stripe.products.list({ limit: 1 });
    return { id, label, status: "green", latencyMs: Date.now() - t0 };
  } catch (e) {
    return { id, label, status: "red", latencyMs: Date.now() - t0, detail: e instanceof Error ? e.message : "stripe error" };
  }
}

async function checkResend(): Promise<HealthCheckResult> {
  const id = "resend";
  const label = "Resend API";
  const t0 = Date.now();
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) {
    return { id, label, status: "yellow", detail: "RESEND_API_KEY not set" };
  }
  try {
    const resend = new Resend(key);
    const { data, error } = await resend.domains.list();
    if (error) return { id, label, status: "red", latencyMs: Date.now() - t0, detail: error.message };
    if (!data) return { id, label, status: "yellow", latencyMs: Date.now() - t0, detail: "Empty domains response" };
    return { id, label, status: "green", latencyMs: Date.now() - t0, detail: `${data.data?.length ?? 0} domain(s)` };
  } catch (e) {
    return { id, label, status: "red", latencyMs: Date.now() - t0, detail: e instanceof Error ? e.message : "resend error" };
  }
}

export async function runInternalLaunchHealthChecks(baseUrl: string): Promise<HealthCheckResult[]> {
  const embed = await checkEmbedApi(baseUrl);
  const [sentry, storage, llm, stripe, resend] = await Promise.all([
    checkSentry(),
    checkStorage(),
    checkLlm(),
    checkStripe(),
    checkResend(),
  ]);
  return [embed, sentry, storage, llm, stripe, resend];
}
