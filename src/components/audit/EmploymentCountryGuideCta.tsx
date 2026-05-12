import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Briefcase } from "lucide-react";

export async function EmploymentCountryGuideCta({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "auditEmploymentPage" });
  return (
    <div className="mt-10 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 text-center space-y-3">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
        <Briefcase className="h-5 w-5" aria-hidden />
      </div>
      <h2 className="text-lg font-semibold text-[var(--foreground)]">{t("countryEmploymentTitle")}</h2>
      <p className="text-sm text-[var(--muted-foreground)] max-w-xl mx-auto">{t("countryEmploymentLead")}</p>
      <Link
        href="/constitutions"
        className="inline-flex items-center gap-2 text-sm font-medium text-[var(--primary)] underline-offset-4 hover:underline"
      >
        {t("countryEmploymentCta")}
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </div>
  );
}
