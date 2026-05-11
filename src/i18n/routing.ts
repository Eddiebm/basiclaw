import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "es", "fr", "ar", "pt", "hi", "zh"],
  defaultLocale: "en",
  localePrefix: "always",
});
