"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { DirectoryLawyerRow } from "@/lib/lawyer-directory";
import type { LawyerFeeStructure, LawyerPartnerTier } from "@/data/verified-lawyers";
import { REGIONS } from "@/lib/jurisdictions";
import { track } from "@/lib/analytics";

export type DirectoryLawyerWithRegion = DirectoryLawyerRow & { region?: string };

const ALL = "__all__" as const;

type AllOr<T extends string> = typeof ALL | T;

const FEE_OPTIONS: LawyerFeeStructure[] = ["free", "sliding-scale", "paid", "contingency"];
const TIER_OPTIONS: (LawyerPartnerTier | "verified")[] = ["verified", "premium", "featured", "directory"];

function tierSelectLabel(ti: (typeof TIER_OPTIONS)[number]): "tierVerified" | "tierDirectory" | "tierFeatured" | "tierPremium" {
  if (ti === "verified") return "tierVerified";
  if (ti === "directory") return "tierDirectory";
  if (ti === "featured") return "tierFeatured";
  return "tierPremium";
}

export function LawyersDirectory({
  lawyers,
  absoluteSite,
  locale,
}: {
  lawyers: DirectoryLawyerWithRegion[];
  absoluteSite: string;
  locale: string;
}) {
  const t = useTranslations("lawyersPage");
  const [country, setCountry] = useState<AllOr<string>>(ALL);
  const [region, setRegion] = useState<AllOr<string>>(ALL);
  const [practice, setPractice] = useState<AllOr<string>>(ALL);
  const [language, setLanguage] = useState<AllOr<string>>(ALL);
  const [fee, setFee] = useState<typeof ALL | LawyerFeeStructure>(ALL);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [tier, setTier] = useState<typeof ALL | LawyerPartnerTier | "verified">(ALL);

  const base = absoluteSite.replace(/\/$/, "");

  const countries = useMemo(() => {
    const s = new Set<string>();
    for (const l of lawyers) s.add(l.country.toUpperCase());
    return [...s].sort();
  }, [lawyers]);

  const practiceAreas = useMemo(() => {
    const s = new Set<string>();
    for (const l of lawyers) for (const a of l.practiceAreas) s.add(a);
    return [...s].sort((a, b) => a.localeCompare(b));
  }, [lawyers]);

  const languages = useMemo(() => {
    const s = new Set<string>();
    for (const l of lawyers) for (const lang of l.languages) s.add(lang);
    return [...s].sort((a, b) => a.localeCompare(b));
  }, [lawyers]);

  const filtered = useMemo(() => {
    return lawyers.filter((l) => {
      if (country !== ALL && l.country.toUpperCase() !== country) return false;
      if (region !== ALL && (l.region ?? "") !== region) return false;
      if (practice !== ALL && !l.practiceAreas.some((a) => a === practice)) return false;
      if (language !== ALL && !l.languages.includes(language)) return false;
      if (fee !== ALL && l.feeStructure !== fee) return false;
      if (remoteOnly && !l.acceptsRemoteClients) return false;
      if (tier !== ALL) {
        if (tier === "verified") {
          if (l.kind !== "verified") return false;
        } else {
          const lt = l.partnerTier ?? "directory";
          if (lt !== tier) return false;
        }
      }
      return true;
    });
  }, [lawyers, country, region, practice, language, fee, remoteOnly, tier]);

  const jsonLd =
    filtered.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: filtered.map((l, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "Person",
              name: l.name,
              jobTitle: "Lawyer",
              url: `${base}/${locale}/lawyers/${l.slug}`,
            },
          })),
        }
      : null;

  return (
    <>
      {jsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      ) : null}
      <div className="space-y-6">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/60 p-4 sm:p-5 space-y-4">
          <p className="text-sm font-medium text-[var(--foreground)]">{t("filtersTitle")}</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-[var(--muted-foreground)]">{t("filterCountry")}</span>
              <select
                className="rounded-lg border border-[var(--border)] bg-background px-2 py-2 text-sm"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              >
                <option value={ALL}>{t("filterAny")}</option>
                {countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-[var(--muted-foreground)]">{t("filterRegion")}</span>
              <select
                className="rounded-lg border border-[var(--border)] bg-background px-2 py-2 text-sm"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              >
                <option value={ALL}>{t("filterAny")}</option>
                {REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-[var(--muted-foreground)]">{t("filterPractice")}</span>
              <select
                className="rounded-lg border border-[var(--border)] bg-background px-2 py-2 text-sm"
                value={practice}
                onChange={(e) => setPractice(e.target.value)}
              >
                <option value={ALL}>{t("filterAny")}</option>
                {practiceAreas.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-[var(--muted-foreground)]">{t("filterLanguage")}</span>
              <select
                className="rounded-lg border border-[var(--border)] bg-background px-2 py-2 text-sm"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value={ALL}>{t("filterAny")}</option>
                {languages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-[var(--muted-foreground)]">{t("filterFee")}</span>
              <select
                className="rounded-lg border border-[var(--border)] bg-background px-2 py-2 text-sm"
                value={fee}
                onChange={(e) => setFee(e.target.value as typeof fee)}
              >
                <option value={ALL}>{t("filterAny")}</option>
                {FEE_OPTIONS.map((f) => (
                  <option key={f} value={f}>
                    {t(`fee.${f}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-[var(--muted-foreground)]">{t("filterTier")}</span>
              <select
                className="rounded-lg border border-[var(--border)] bg-background px-2 py-2 text-sm"
                value={tier}
                onChange={(e) => setTier(e.target.value as typeof tier)}
              >
                <option value={ALL}>{t("filterAny")}</option>
                {TIER_OPTIONS.map((ti) => (
                  <option key={ti} value={ti}>
                    {t(tierSelectLabel(ti))}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="inline-flex items-center gap-2 text-sm cursor-pointer select-none">
            <input type="checkbox" checked={remoteOnly} onChange={(e) => setRemoteOnly(e.target.checked)} className="rounded border-[var(--border)]" />
            <span>{t("filterRemoteOnly")}</span>
          </label>
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">{t("empty")}</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {filtered.map((l) => (
              <LawyerCard key={`${l.kind}-${l.id}`} lawyer={l} />
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function LawyerCard({ lawyer }: { lawyer: DirectoryLawyerWithRegion }) {
  const t = useTranslations("lawyersPage");
  const ref = useRef<HTMLElement | null>(null);
  const seen = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || seen.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !seen.current) {
            seen.current = true;
            track("lawyer_card_viewed", {
              lawyer_id: lawyer.id,
              slug: lawyer.slug,
              kind: lawyer.kind,
              country: lawyer.country,
            });
          }
        }
      },
      { threshold: 0.35 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [lawyer.id, lawyer.slug, lawyer.kind, lawyer.country]);

  return (
    <li key={`${lawyer.kind}-${lawyer.id}`}>
      <article
        ref={ref}
        className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/80 p-4 hover:border-[var(--primary)]/40 transition-colors h-full flex flex-col"
      >
        <div className="flex gap-3">
          <div className="h-14 w-14 rounded-full overflow-hidden bg-[var(--muted)] shrink-0 border border-[var(--border)]">
            {lawyer.headshotUrl ? (
              <Image
                src={lawyer.headshotUrl}
                alt=""
                width={56}
                height={56}
                unoptimized
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-lg font-semibold text-[var(--muted-foreground)]">
                {lawyer.name.slice(0, 1)}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-[var(--foreground)] leading-snug">{lawyer.name}</p>
            {lawyer.firmName ? <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{lawyer.firmName}</p> : null}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-[var(--muted)]/40 text-[var(--foreground)]">
                {lawyer.country}
              </span>
              {lawyer.region ? (
                <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border border-[var(--border)] text-[var(--muted-foreground)]">
                  {lawyer.region}
                </span>
              ) : null}
              <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border border-[var(--primary)]/30 text-[var(--primary)]">
                {lawyer.kind === "verified" ? t("badgeVerified") : t("badgePartner")}
              </span>
            </div>
          </div>
        </div>
        <p className="text-xs text-[var(--muted-foreground)] mt-2 line-clamp-2">{lawyer.jurisdiction}</p>
        <div className="flex flex-wrap gap-1 mt-2">
          {lawyer.practiceAreas.slice(0, 4).map((a) => (
            <span key={a} className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--accent)] text-[var(--foreground)]">
              {a}
            </span>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-[var(--muted-foreground)]">
          {lawyer.feeStructure ? (
            <span>
              {t("feeLabel")}: {t(`fee.${lawyer.feeStructure}`)}
            </span>
          ) : null}
          {lawyer.languages.length > 0 ? (
            <span>
              {t("languagesLabel")}: {lawyer.languages.slice(0, 3).join(", ")}
            </span>
          ) : null}
        </div>
        <div className="mt-auto pt-4">
          <Link
            href={`/lawyers/${lawyer.slug}`}
            className="inline-flex items-center justify-center w-full rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] px-3 py-2 text-sm font-medium"
            onClick={() =>
              track("lawyer_contact_clicked", {
                lawyer_id: lawyer.id,
                slug: lawyer.slug,
                surface: "directory",
                kind: lawyer.kind,
              })
            }
          >
            {t("contactCta")}
          </Link>
        </div>
      </article>
    </li>
  );
}
