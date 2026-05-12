"use client";

import { useEffect, useRef, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";

const LIBRARY_PREFIXES = ["/constitutions", "/compare", "/learn", "/documents", "/questions"] as const;

export function LearnNavDropdown({
  variant,
  onNavigate,
}: {
  variant: "desktop" | "mobile";
  onNavigate?: () => void;
}) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const libraryActive = LIBRARY_PREFIXES.some((p) =>
    p === "/compare" ? pathname === "/compare" || pathname.startsWith("/compare?") : pathname === p || pathname.startsWith(`${p}/`)
  );

  useEffect(() => {
    if (!open) return;
    function onDocClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const items = [
    {
      href: "/constitutions",
      label: t("libraryConstitutions"),
      desc: t("libraryConstitutionsDesc"),
    },
    {
      href: "/compare?a=US&b=GH&topic=rights",
      label: t("libraryCompare"),
      desc: t("libraryCompareDesc"),
    },
    {
      href: "/questions",
      label: t("libraryQuestions"),
      desc: t("libraryQuestionsDesc"),
    },
    { href: "/learn", label: t("learnLawSchool"), desc: null as string | null },
    { href: "/documents", label: t("learnDocuments"), desc: null as string | null },
  ] as const;

  if (variant === "mobile") {
    return (
      <div className="flex flex-col gap-2 border-l-2 border-[var(--border)] pl-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
          {t("library")}
        </span>
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-sm font-medium text-[var(--foreground)]"
            onClick={() => onNavigate?.()}
          >
            {item.label}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={t("libraryMenuAria")}
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1 text-sm font-medium transition-colors ${
          libraryActive ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        }`}
      >
        {t("library")}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {open && (
        <ul
          role="menu"
          className="absolute left-0 top-full z-50 mt-1 w-[min(100vw-2rem,22rem)] max-w-[calc(100vw-2rem)] rounded-xl border border-[var(--border)] bg-[var(--card)] py-2 px-1 shadow-lg"
        >
          <li className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            {t("libraryMegaEyebrow")}
          </li>
          {items.map((item) => (
            <li key={item.href} role="none">
              <Link
                role="menuitem"
                href={item.href}
                className="block rounded-lg px-2 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--accent)]/60"
                onClick={() => setOpen(false)}
              >
                <span className="font-medium">{item.label}</span>
                {item.desc ? (
                  <span className="mt-0.5 block text-xs text-[var(--muted-foreground)] leading-snug">{item.desc}</span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
