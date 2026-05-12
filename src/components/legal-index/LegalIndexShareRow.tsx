"use client";

import { useState } from "react";
import { Linkedin, Link2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

function twitterSvg() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function LegalIndexShareRow({ shareUrl, shareTitle }: { shareUrl: string; shareTitle: string }) {
  const t = useTranslations("legalIndex");
  const [copied, setCopied] = useState(false);

  const encUrl = encodeURIComponent(shareUrl);
  const encTitle = encodeURIComponent(shareTitle);
  const xHref = `https://twitter.com/intent/tweet?text=${encTitle}&url=${encUrl}`;
  const liHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encUrl}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="outline" size="sm" className="gap-2" asChild>
        <a href={xHref} target="_blank" rel="noreferrer">
          {twitterSvg()}
          {t("shareX")}
        </a>
      </Button>
      <Button type="button" variant="outline" size="sm" className="gap-2" asChild>
        <a href={liHref} target="_blank" rel="noreferrer">
          <Linkedin className="h-4 w-4" aria-hidden />
          {t("shareLinkedIn")}
        </a>
      </Button>
      <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => void copy()}>
        <Link2 className="h-4 w-4" aria-hidden />
        {copied ? t("copied") : t("copyLink")}
      </Button>
    </div>
  );
}
