import * as Sentry from "@sentry/nextjs";
import { clerkClient } from "@clerk/nextjs/server";
import { Resend } from "resend";
import Stripe from "stripe";
import { generateChatCompletionText } from "@/lib/llm-chat-completion";
import {
  getActiveStorageDriver,
  storageHealthRoundTrip,
} from "@/lib/storage";

const CHECK_TIMEOUT_MS = 5000;

export type InternalHealthStatus = "ok" | "degraded" | "error" | "missing";

export type InternalHealthRow = {
  id: string;
  name: string;
  status: InternalHealthStatus;
  latencyMs: number | null;
  lastError?: string;
  /** Env vars to set when status is `missing` */
  envHints?: string[];
  /** e.g. active storage driver */
  note?: string;
};

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms);
    promise.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      }
    );
  });
}

function row(r: Omit<InternalHealthRow, "latencyMs"> & { latencyMs?: number | null }): InternalHealthRow {
  return { ...r, latencyMs: r.latencyMs ?? null };
}

async function embedHealth(baseUrl: string): Promise<InternalHealthRow> {
  const id = "embed";
  const name = "Embed health";
  const t0 = Date.now();
  try {
    const { res, j } = await withTimeout(
      (async () => {
        const res = await fetch(`${baseUrl.replace(/\/$/, "")}/api/embed/health`, { cache: "no-store" });
        const j = (await res.json()) as { ok?: boolean };
        return { res, j };
      })(),
      CHECK_TIMEOUT_MS
    );
    const latencyMs = Date.now() - t0;
    if (!res.ok) {
      return row({
        id,
        name,
        status: "error",
        latencyMs,
        lastError: `HTTP ${res.status}`,
      });
    }
    if (j.ok === true) return row({ id, name, status: "ok", latencyMs });
    return row({
      id,
      name,
      status: "degraded",
      latencyMs,
      lastError: "Expected JSON { ok: true }",
    });
  } catch (e) {
    return row({
      id,
      name,
      status: "error",
      latencyMs: Date.now() - t0,
      lastError: e instanceof Error ? e.message : "fetch failed",
    });
  }
}

async function sentryPing(): Promise<InternalHealthRow> {
  const id = "sentry";
  const name = "Sentry test event";
  const t0 = Date.now();
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN?.trim()) {
    return row({
      id,
      name,
      status: "missing",
      latencyMs: null,
      envHints: ["NEXT_PUBLIC_SENTRY_DSN"],
    });
  }
  try {
    await withTimeout(
      (async () => {
        Sentry.captureMessage("internal-health-ping", "info");
        await Sentry.flush(2000);
      })(),
      CHECK_TIMEOUT_MS
    );
    return row({ id, name, status: "ok", latencyMs: Date.now() - t0 });
  } catch (e) {
    return row({
      id,
      name,
      status: "error",
      latencyMs: Date.now() - t0,
      lastError: e instanceof Error ? e.message : "Sentry error",
    });
  }
}

async function storagePing(): Promise<InternalHealthRow> {
  const id = "storage";
  const name = "Storage round-trip";
  const driver = getActiveStorageDriver();
  const t0 = Date.now();
  const key = `health:ping:${Date.now()}`;
  try {
    await withTimeout(storageHealthRoundTrip(key, "ok"), CHECK_TIMEOUT_MS);
    return row({
      id,
      name,
      status: "ok",
      latencyMs: Date.now() - t0,
      note: `driver: ${driver}`,
    });
  } catch (e) {
    return row({
      id,
      name,
      status: "error",
      latencyMs: Date.now() - t0,
      lastError: e instanceof Error ? e.message : "storage error",
      note: `driver: ${driver}`,
    });
  }
}

async function llmPing(): Promise<InternalHealthRow> {
  const id = "llm";
  const name = "AI Gateway / OpenRouter";
  const t0 = Date.now();
  const hasGateway = Boolean(process.env.AI_GATEWAY_API_KEY?.trim());
  const hasOr = Boolean(process.env.OPENROUTER_API_KEY?.trim());
  if (!hasGateway && !hasOr) {
    return row({
      id,
      name,
      status: "missing",
      latencyMs: null,
      envHints: ["AI_GATEWAY_API_KEY", "OPENROUTER_API_KEY"],
    });
  }
  try {
    const { text } = await withTimeout(
      generateChatCompletionText({
        messages: [{ role: "user", content: "ok" }],
        maxTokens: 1,
        temperature: 0,
      }),
      CHECK_TIMEOUT_MS
    );
    const trimmed = text?.trim() ?? "";
    if (!trimmed) {
      return row({
        id,
        name,
        status: "degraded",
        latencyMs: Date.now() - t0,
        lastError: "Empty completion text",
      });
    }
    return row({ id, name, status: "ok", latencyMs: Date.now() - t0 });
  } catch (e) {
    return row({
      id,
      name,
      status: "error",
      latencyMs: Date.now() - t0,
      lastError: e instanceof Error ? e.message : "LLM error",
    });
  }
}

async function stripePing(): Promise<InternalHealthRow> {
  const id = "stripe";
  const name = "Stripe";
  const t0 = Date.now();
  const secret = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secret) {
    return row({
      id,
      name,
      status: "missing",
      latencyMs: null,
      envHints: ["STRIPE_SECRET_KEY"],
    });
  }
  try {
    await withTimeout(
      (async () => {
        const stripe = new Stripe(secret, {
          appInfo: {
            name: "BasicLaw",
            url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://basiclaw.vercel.app",
          },
        });
        await stripe.products.list({ limit: 1 });
      })(),
      CHECK_TIMEOUT_MS
    );
    return row({ id, name, status: "ok", latencyMs: Date.now() - t0 });
  } catch (e) {
    return row({
      id,
      name,
      status: "error",
      latencyMs: Date.now() - t0,
      lastError: e instanceof Error ? e.message : "Stripe error",
    });
  }
}

async function resendPing(): Promise<InternalHealthRow> {
  const id = "resend";
  const name = "Resend";
  const t0 = Date.now();
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) {
    return row({
      id,
      name,
      status: "missing",
      latencyMs: null,
      envHints: ["RESEND_API_KEY"],
    });
  }
  try {
    const resend = new Resend(key);
    const { data, error } = await withTimeout(resend.domains.list(), CHECK_TIMEOUT_MS);
    if (error) {
      return row({
        id,
        name,
        status: "error",
        latencyMs: Date.now() - t0,
        lastError: error.message,
      });
    }
    if (!data) {
      return row({
        id,
        name,
        status: "degraded",
        latencyMs: Date.now() - t0,
        lastError: "Empty domains response",
      });
    }
    return row({ id, name, status: "ok", latencyMs: Date.now() - t0 });
  } catch (e) {
    return row({
      id,
      name,
      status: "error",
      latencyMs: Date.now() - t0,
      lastError: e instanceof Error ? e.message : "Resend error",
    });
  }
}

async function clerkPing(): Promise<InternalHealthRow> {
  const id = "clerk";
  const name = "Clerk";
  const t0 = Date.now();
  if (!process.env.CLERK_SECRET_KEY?.trim()) {
    return row({
      id,
      name,
      status: "missing",
      latencyMs: null,
      envHints: ["CLERK_SECRET_KEY"],
    });
  }
  try {
    await withTimeout(
      (async () => {
        const c = await clerkClient();
        await c.users.getCount();
      })(),
      CHECK_TIMEOUT_MS
    );
    return row({ id, name, status: "ok", latencyMs: Date.now() - t0 });
  } catch (e) {
    return row({
      id,
      name,
      status: "error",
      latencyMs: Date.now() - t0,
      lastError: e instanceof Error ? e.message : "Clerk error",
    });
  }
}

/** Sequential server-side checks for `/internal/health` (5s timeout each). */
export async function runInternalLaunchHealthChecks(baseUrl: string): Promise<InternalHealthRow[]> {
  const embed = await embedHealth(baseUrl);
  const sentry = await sentryPing();
  const storage = await storagePing();
  const llm = await llmPing();
  const stripe = await stripePing();
  const resend = await resendPing();
  const clerk = await clerkPing();
  return [embed, sentry, storage, llm, stripe, resend, clerk];
}
