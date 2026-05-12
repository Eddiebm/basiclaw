import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";
import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");
const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === "true" });

const EMBED_CSP =
  "default-src 'self'; " +
  "base-uri 'none'; " +
  "form-action 'self'; " +
  "frame-ancestors *; " +
  "img-src 'self' data: https: blob:; " +
  "font-src 'self' data:; " +
  "style-src 'self' 'unsafe-inline'; " +
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
  "connect-src 'self'; " +
  "object-src 'none'; " +
  "upgrade-insecure-requests";

const nextConfig: NextConfig = {
  experimental: {
    optimizeCss: true,
  },
  serverExternalPackages: ["@xenova/transformers"],
  async headers() {
    return [
      {
        source: "/embed/:path*",
        headers: [
          { key: "Content-Security-Policy", value: EMBED_CSP },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};

const withIntl = withNextIntl(nextConfig);

const sentryUploadEnabled = Boolean(process.env.SENTRY_AUTH_TOKEN?.trim());

export default withSentryConfig(withBundleAnalyzer(withIntl), {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  sourcemaps: {
    disable: !sentryUploadEnabled,
  },
});
