import type { MetadataRoute } from "next";
import { COUNTRIES } from "@/data/countries";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://basiclaw.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/constitutions`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/learn`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/chat`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/documents`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  const constitutionPages: MetadataRoute.Sitemap = COUNTRIES.map((country) => ({
    url: `${SITE_URL}/constitutions/${country.code.toLowerCase()}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: country.popular ? 0.85 : 0.6,
  }));

  return [...staticPages, ...constitutionPages];
}
