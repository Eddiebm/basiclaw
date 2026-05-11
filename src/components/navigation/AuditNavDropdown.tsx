"use client";

import { useEffect, useRef, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";

const AUDIT_PATHS = ["/audit", "/audit/lease", "/audit/employment", "/audit/terms"] as const;

export function AuditNavDropdown({
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

  const auditActive = AUDIT_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

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
    { href: "/audit", label: t("auditGeneral") },
    { href: "/audit/lease", label: t("auditLease") },
    { href: "/audit/employment", label: t("auditEmployment") },
    { href: "/audit/terms", label: t("auditTerms") },
  ] as const;

  if (variant === "mobile") {
    return (
      <div className="flex flex-col gap-2 border-l-2 border-[var(--border)] pl-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">{t("auditMobileGroup")}</span>
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
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1 text-sm font-medium transition-colors ${
          auditActive ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        }`}
      >
        {t("auditToolsMenu")}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {open && (
        <ul
          role="menu"
          className="absolute left-0 top-full z-50 mt-1 min-w-[14rem] rounded-xl border border-[var(--border)] bg-[var(--card)] py-1 shadow-lg"
        >
          {items.map((item) => (
            <li key={item.href} role="none">
              <Link
                role="menuitem"
                href={item.href}
                className="block px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--accent)]/60"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
