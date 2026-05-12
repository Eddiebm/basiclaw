import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim();
const isDev = process.env.NODE_ENV === "development";

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    sendDefaultPii: false,
    tracesSampleRate: isDev ? 1.0 : 0.2,
    replaysSessionSampleRate: 0.05,
    replaysOnErrorSampleRate: 1.0,
    integrations: [Sentry.replayIntegration()],
    beforeSend(event) {
      if (typeof window !== "undefined") {
        event.tags = { ...event.tags, route: window.location.pathname };
        const parts = window.location.pathname.split("/").filter(Boolean);
        const maybeLocale = parts[0];
        if (maybeLocale && /^[a-z]{2}(-[a-z]+)?$/i.test(maybeLocale)) {
          event.tags = { ...event.tags, locale: maybeLocale };
        }
        const sp = new URLSearchParams(window.location.search);
        const country = sp.get("country") ?? sp.get("jurisdiction");
        if (country) event.tags = { ...event.tags, jurisdiction: country };
        const tenant = sp.get("tenantId") ?? sp.get("tenant");
        if (tenant) event.tags = { ...event.tags, embedTenantId: tenant };
      }
      return event;
    },
  });
}

export const onRouterTransitionStart = dsn
  ? Sentry.captureRouterTransitionStart
  : ((_url: string) => {
      /* no-op without DSN */
    }) as typeof Sentry.captureRouterTransitionStart;
