"use client";

import { useMemo, useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";

export function LanguageSwitcher() {
  const t = useTranslations("languageSwitcher");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const options = useMemo(
    () =>
      routing.locales.map((loc) => ({
        value: loc,
        label: t(`locales.${loc}`),
      })),
    [t]
  );

  return (
    <label className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
      <span className="sr-only">{t("label")}</span>
      <select
        className="h-9 rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] disabled:opacity-60"
        value={locale}
        disabled={pending}
        aria-label={t("label")}
        onChange={(event) => {
          const nextLocale = event.target.value;
          startTransition(() => {
            router.replace(pathname, { locale: nextLocale });
          });
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
