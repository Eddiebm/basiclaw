"use client";

import { Scale, Github, Twitter, Linkedin, Mail } from "lucide-react";
import { Separator } from "@/components/ui/Separator";

const footerLinks = {
  product: [{ name: "Features", href: "/features" }, { name: "Law School", href: "/school" }, { name: "Document Help", href: "/documents" }, { name: "Pricing", href: "/pricing" }],
  company: [{ name: "About", href: "/about" }, { name: "Blog", href: "/blog" }, { name: "Careers", href: "/careers" }, { name: "Contact", href: "/contact" }],
  legal: [{ name: "Privacy Policy", href: "/privacy" }, { name: "Terms of Service", href: "/terms" }, { name: "Cookie Policy", href: "/cookies" }, { name: "Disclaimer", href: "/disclaimer" }],
  resources: [{ name: "Help Center", href: "/help" }, { name: "Community", href: "/community" }, { name: "Partners", href: "/partners" }, { name: "API", href: "/api" }],
};

const socialLinks = [{ name: "Twitter", icon: Twitter, href: "#" }, { name: "GitHub", icon: Github, href: "#" }, { name: "LinkedIn", icon: Linkedin, href: "#" }, { name: "Email", icon: Mail, href: "#" }];

export function Footer() {
  return (
    <footer className="py-16 border-t border-[var(--border)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4"><Scale className="h-8 w-8 text-[var(--primary)]" /><span className="text-xl font-bold text-[var(--foreground)]">BasicLaw</span></div>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">Making legal literacy accessible to everyone, everywhere.</p>
            <div className="flex gap-4">{socialLinks.map((link) => (<a key={link.name} href={link.href} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors" aria-label={link.name}><link.icon className="h-5 w-5" /></a>))}</div>
          </div>
          <div><h3 className="font-semibold text-[var(--foreground)] mb-4">Product</h3><ul className="space-y-3">{footerLinks.product.map((link) => (<li key={link.name}><a href={link.href} className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">{link.name}</a></li>))}</ul></div>
          <div><h3 className="font-semibold text-[var(--foreground)] mb-4">Company</h3><ul className="space-y-3">{footerLinks.company.map((link) => (<li key={link.name}><a href={link.href} className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">{link.name}</a></li>))}</ul></div>
          <div><h3 className="font-semibold text-[var(--foreground)] mb-4">Legal</h3><ul className="space-y-3">{footerLinks.legal.map((link) => (<li key={link.name}><a href={link.href} className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">{link.name}</a></li>))}</ul></div>
          <div><h3 className="font-semibold text-[var(--foreground)] mb-4">Resources</h3><ul className="space-y-3">{footerLinks.resources.map((link) => (<li key={link.name}><a href={link.href} className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">{link.name}</a></li>))}</ul></div>
        </div>
        <Separator className="mb-8" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[var(--muted-foreground)]"><p>&copy; 2025 BasicLaw. All rights reserved.</p><p>Built with care for people everywhere.</p></div>
      </div>
    </footer>
  );
}
