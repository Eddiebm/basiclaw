import * as Sentry from "@sentry/nextjs";
import { applyRouteLocaleJurisdictionTags } from "./sentry-tags.shared";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim() || process.env.SENTRY_DSN?.trim();
const isDev = process.env.NODE_ENV === "development";

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    sendDefaultPii: false,
    tracesSampleRate: isDev ? 1.0 : 0.2,
    beforeSend(event) {
      applyRouteLocaleJurisdictionTags(event);
      return event;
    },
  });
}
