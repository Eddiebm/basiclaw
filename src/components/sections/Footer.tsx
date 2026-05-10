"use client";

import Link from "next/link";
import { Github, Linkedin, Mail, Scale, Twitter } from "lucide-react";
import { Separator } from "@/components/ui/Separator";
import { countryStats } from "@/lib/jurisdictions";

const footerLinks = {
  product: [
    { name: "Constitutions", href: "/constitutions" },
    { name: "Ask the assistant", href: "/chat" },
    { name: "Document help", href: "/documents" },
    { name: "Law School", href: "/learn" },
    { name: "Pricing", href: "/pricing" },
  ],
  jurisdictions: [
    { name: "United States", href: "/constitutions/us" },
    { name: "United Kingdom", href: "/constitutions/gb" },
    { name: "India", href: "/constitutions/in" },
    { name: "Nigeria", href: "/constitutions/ng" },
    { name: "Ghana", href: "/constitutions/gh" },
    { name: "Browse all", href: "/constitutions" },
  ],
  company: [
    { name: "About", href: "/about" },
    { name: "FAQ", href: "/faq" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "mailto:hello@basiclaw.app" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Disclaimer", href: "/disclaimer" },
    { name: "Cookie Policy", href: "/cookies" },
  ],
};

const socialLinks = [
  { name: "Twitter", icon: Twitter, href: "https://twitter.com" },
  { name: "GitHub", icon: Github, href: "https://github.com/Eddiebm/basiclaw" },
  { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com" },
  { name: "Email", icon: Mail, href: "mailto:hello@basiclaw.app" },
];

export function Footer() {
  const stats = countryStats();
  return (
    <footer className="py-16 border-t border-[var(--border)] bg-[var(--accent)]/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-12">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Scale className="h-8 w-8 text-[var(--primary)]" />
              <span className="text-xl font-bold text-[var(--foreground)]">BasicLaw</span>
            </Link>
            <p className="text-sm text-[var(--muted-foreground)] mb-4 max-w-xs">
              The plain-language constitution and rights library for {stats.total} countries. Civic infrastructure for the digital age.
            </p>
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
          <FooterColumn title="Product" links={footerLinks.product} />
          <FooterColumn title="Popular jurisdictions" links={footerLinks.jurisdictions} />
          <FooterColumn title="Company" links={footerLinks.company} />
          <FooterColumn title="Legal" links={footerLinks.legal} />
        </div>
        <Separator className="mb-8" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[var(--muted-foreground)]">
          <p>© {new Date().getFullYear()} BasicLaw. Educational only — not a substitute for a licensed lawyer.</p>
          <p>Built for everyone, everywhere.</p>
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
