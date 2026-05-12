// TODO: replace with full Clerk/Upstash/Stripe implementation.

export function buildSharedAuditHref(locale: string, report: unknown): string {
  const json = JSON.stringify(report ?? {});
  const encoded = Buffer.from(json, "utf-8").toString("base64");
  return `/${locale}/audit/shared#${encoded}`;
}
