"use client";

import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { track } from "@/lib/analytics";

export function LawyerCtaLink({
  href,
  children,
  source,
  className,
}: {
  href: string;
  children: ReactNode;
  source: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => track("lawyer_cta_clicked", { source })}
    >
      {children}
    </Link>
  );
}
