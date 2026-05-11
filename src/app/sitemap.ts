import type { MetadataRoute } from "next";
import { COUNTRIES } from "@/data/countries";
import { US_STATES, US_STATE_TOPIC_SLUGS } from "@/data/us-states";
import { routing } from "@/i18n/routing";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://basiclaw.app";

const LOCALIZED_STATIC = [
  "/",
  "/constitutions",
  "/pricing",
  "/audit",
  "/audit/lease",
  "/audit/employment",
  "/audit/terms",
  "/faq",
  "/find-a-lawyer",
  "/chat",
  "/learn",
  "/documents",
  "/us/states",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const defaultLocale = routing.defaultLocale;

  const localizedPages: MetadataRoute.Sitemap = routing.locales.flatMap((locale) =>
    LOCALIZED_STATIC.map((path) => ({
      url: `${SITE_URL}/${locale}${path === "/" ? "" : path}`,
      lastModified: now,
      changeFrequency: path === "/" || path === "/constitutions" ? ("weekly" as const) : ("monthly" as const),
      priority:
        path === "/"
          ? 1.0
          : path === "/constitutions" || path === "/audit" || path.startsWith("/audit/")
            ? 0.9
            : path === "/pricing" || path === "/faq" || path === "/find-a-lawyer"
              ? 0.7
              : 0.6,
    }))
  );

  const constitutionPages: MetadataRoute.Sitemap = COUNTRIES.map((country) => ({
    url: `${SITE_URL}/${defaultLocale}/constitutions/${country.code.toLowerCase()}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: country.popular ? 0.85 : 0.6,
  }));

  const TOPIC_SLUGS = ["rights", "police-stop", "landlord"] as const;
  const topicPages: MetadataRoute.Sitemap = COUNTRIES.flatMap((country) =>
    TOPIC_SLUGS.map((slug) => ({
      url: `${SITE_URL}/${defaultLocale}/${country.code.toLowerCase()}/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: country.popular ? 0.75 : 0.55,
    }))
  );

  const usStateTopicPages: MetadataRoute.Sitemap = US_STATES.flatMap((state) =>
    US_STATE_TOPIC_SLUGS.map((topic) => ({
      url: `${SITE_URL}/${defaultLocale}/us/${state.slug}/${topic}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.58,
    }))
  );

  return [...localizedPages, ...constitutionPages, ...topicPages, ...usStateTopicPages];
}
