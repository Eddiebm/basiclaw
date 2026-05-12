/**
 * Fire-and-forget server-side PostHog capture (no posthog-node dependency).
 */
export async function capturePosthogServer(
  event: string,
  distinctId: string,
  properties?: Record<string, unknown>
): Promise<void> {
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim();
  if (!apiKey) return;
  const host = (process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com").replace(/\/$/, "");
  const url = `${host}/capture/`;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        event,
        distinct_id: distinctId,
        properties: properties ?? {},
      }),
    });
  } catch {
    /* non-fatal */
  }
}
