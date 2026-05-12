import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

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

export default withNextIntl(nextConfig);