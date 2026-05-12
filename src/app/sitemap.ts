import type { MetadataRoute } from "next";
import { COUNTRIES } from "@/data/countries";
import { US_STATES, US_STATE_TOPIC_SLUGS } from "@/data/us-states";
import { STAGES } from "@/data/questions/taxonomy";
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
  "/lawyers",
  "/lawyers/apply",
  "/chat",
  "/learn",
  "/documents",
  "/us/states",
  "/extension",
  "/embed",
  "/about",
  "/blog",
  "/privacy",
  "/terms",
  "/disclaimer",
  "/cookies",
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

  const compareDefaultOnly: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/${defaultLocale}/compare`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.82,
    },
  ];

  const legalIndexLanding: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/${defaultLocale}/the-index`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.88,
    },
  ];

  const legalIndexCountries: MetadataRoute.Sitemap = COUNTRIES.map((country) => ({
    url: `${SITE_URL}/${defaultLocale}/the-index/${country.code.toLowerCase()}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: country.popular ? 0.78 : 0.55,
  }));

  const appShellDefaultOnly: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/${defaultLocale}/sign-in`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.25,
    },
    {
      url: `${SITE_URL}/${defaultLocale}/sign-up`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.25,
    },
    {
      url: `${SITE_URL}/${defaultLocale}/dashboard`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.35,
    },
    {
      url: `${SITE_URL}/${defaultLocale}/audit/prenup`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.72,
    },
    {
      url: `${SITE_URL}/${defaultLocale}/audit/divorce`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.72,
    },
    {
      url: `${SITE_URL}/${defaultLocale}/audit/demand-letter-generator`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.72,
    },
  ];

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

  const questionLibraryPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/${defaultLocale}/questions`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.72,
    },
    ...STAGES.map((stage) => ({
      url: `${SITE_URL}/${defaultLocale}/questions/${stage}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.68,
    })),
  ];

  return [
    ...localizedPages,
    ...compareDefaultOnly,
    ...legalIndexLanding,
    ...legalIndexCountries,
    ...appShellDefaultOnly,
    ...constitutionPages,
    ...topicPages,
    ...usStateTopicPages,
    ...questionLibraryPages,
  ];
}
