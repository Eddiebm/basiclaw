import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { mergeMessages } from "./mergeMessages";
import baseMessages from "../messages/en.json";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !(routing.locales as readonly string[]).includes(locale)) {
    locale = routing.defaultLocale;
  }

  let messages: Record<string, unknown> = baseMessages as unknown as Record<string, unknown>;
  if (locale !== routing.defaultLocale) {
    try {
      const patch = (await import(`../messages/${locale}.json`)).default as Record<string, unknown>;
      messages = mergeMessages(messages, patch);
    } catch {
      /* non-en catalogs are partial overlays on English */
    }
  }

  return {
    locale,
    messages,
  };
});
