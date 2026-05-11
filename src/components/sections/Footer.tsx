"use client";

import { Link } from "@/i18n/navigation";
import { Github, Linkedin, Mail, Scale, Twitter } from "lucide-react";
import { useTranslations } from "next-intl";
import { Separator } from "@/components/ui/Separator";
import { countryStats } from "@/lib/jurisdictions";

const socialLinks = [
  { name: "Twitter", icon: Twitter, href: "https://twitter.com" },
  { name: "GitHub", icon: Github, href: "https://github.com/Eddiebm/basiclaw" },
  { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com" },
  { name: "Email", icon: Mail, href: "mailto:hello@basiclaw.app" },
];

export function Footer() {
  const t = useTranslations("footer");
  const tc = useTranslations("footer.columns");
  const tl = useTranslations("footer.links");
  const tNav = useTranslations("nav");
  const stats = countryStats();

  const productLinks = [
    { name: tl("constitutions"), href: "/constitutions" },
    { name: tl("usStates"), href: "/us/states" },
    { name: tl("audit"), href: "/audit" },
    { name: tl("auditLease"), href: "/audit/lease" },
    { name: tl("auditEmployment"), href: "/audit/employment" },
    { name: tl("auditTerms"), href: "/audit/terms" },
    { name: tl("ask"), href: "/chat" },
    { name: tl("documents"), href: "/documents" },
    { name: tl("pricing"), href: "/pricing" },
    { name: tl("findLawyer"), href: "/find-a-lawyer" },
  ];

  const jurisdictionLinks = [
    { name: tl("us"), href: "/constitutions/us" },
    { name: tl("uk"), href: "/constitutions/gb" },
    { name: tl("in"), href: "/constitutions/in" },
    { name: tl("ng"), href: "/constitutions/ng" },
    { name: tl("gh"), href: "/constitutions/gh" },
    { name: tl("browseAll"), href: "/constitutions" },
  ];

  const companyLinks = [
    { name: tl("about"), href: "/about", external: false },
    { name: tl("faq"), href: "/faq", external: false },
    { name: tl("blog"), href: "/blog", external: false },
    { name: tl("contact"), href: "mailto:hello@basiclaw.app", external: true },
  ];

  const legalLinks = [
    { name: tl("privacy"), href: "/privacy" },
    { name: tl("terms"), href: "/terms" },
    { name: tl("disclaimer"), href: "/disclaimer" },
    { name: tl("cookies"), href: "/cookies" },
  ];

  return (
    <footer className="py-16 border-t border-[var(--border)] bg-[var(--accent)]/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-12">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Scale className="h-8 w-8 text-[var(--primary)]" />
              <span className="text-xl font-bold text-[var(--foreground)]">{tNav("brand")}</span>
            </Link>
            <p className="text-sm text-[var(--muted-foreground)] mb-4 max-w-xs">{t("tagline", { count: stats.total })}</p>
            <div className="flex gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                  aria-label={link.name}
                  rel="noreferrer"
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                >
                  <link.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
          <FooterColumn title={tc("product")} links={productLinks} />
          <FooterColumn title={tc("jurisdictions")} links={jurisdictionLinks} />
          <FooterColumnMixed title={tc("company")} links={companyLinks} />
          <FooterColumn title={tc("legal")} links={legalLinks} />
        </div>
        <Separator className="mb-8" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[var(--muted-foreground)]">
          <p>{t("copyright", { year: new Date().getFullYear() })}</p>
          <p>{t("builtFor")}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { name: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="font-semibold text-[var(--foreground)] mb-4 text-sm">{title}</h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.name}>
            <Link
              href={link.href}
              className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FooterColumnMixed({
  title,
  links,
}: {
  title: string;
  links: { name: string; href: string; external?: boolean }[];
}) {
  return (
    <div>
      <h3 className="font-semibold text-[var(--foreground)] mb-4 text-sm">{title}</h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.name}>
            {link.external ? (
              <a
                href={link.href}
                className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              >
                {link.name}
              </a>
            ) : (
              <Link
                href={link.href}
                className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              >
                {link.name}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
