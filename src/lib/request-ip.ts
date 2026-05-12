import { createHash } from "node:crypto";

function normaliseIp(raw: string | null | undefined): string {
  if (!raw) return "unknown";
  const first = raw.split(",")[0]?.trim();
  return first || "unknown";
}

export function clientIpFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return normaliseIp(forwarded);
  const real = headers.get("x-real-ip");
  if (real) return normaliseIp(real);
  return "unknown";
}

export function clientIp(request: Request): string {
  return clientIpFromHeaders(request.headers);
}

export function hashIpForUsage(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}
