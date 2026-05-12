"use client";

import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

const baseComponents: Components = {
  a: ({ href, children, className }) => {
    const url = href ?? "";
    const external = /^https?:\/\//i.test(url);
    if (external) {
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" className={className}>
          {children}
        </a>
      );
    }
    return (
      <a href={url} className={className}>
        {children}
      </a>
    );
  },
  table: ({ children }) => (
    <div className="my-3 w-full max-w-full overflow-x-auto [-webkit-overflow-scrolling:touch]">
      <table className="w-full min-w-[min(100%,20rem)] border-collapse text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-[var(--border)] bg-muted/50 px-2 py-1.5 text-left text-xs font-semibold uppercase tracking-wide">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-[var(--border)] px-2 py-1.5 align-top text-sm">{children}</td>
  ),
  pre: ({ children }) => (
    <pre className="my-3 overflow-x-auto rounded-lg border border-[var(--border)] bg-muted/40 p-3 text-[0.8125rem] leading-relaxed [&>code]:rounded-none [&>code]:border-0 [&>code]:bg-transparent [&>code]:p-0">
      {children}
    </pre>
  ),
  code: ({ className, children }) => {
    const block = Boolean(className?.includes("language-"));
    if (block) {
      return (
        <code className={cn("block font-mono text-[0.8125rem]", className)}>
          {children}
        </code>
      );
    }
    return (
      <code
        className={cn(
          "rounded bg-muted/80 px-1 py-0.5 font-mono text-[0.85em] [font-size:0.85em]",
          className
        )}
      >
        {children}
      </code>
    );
  },
};

const proseShell =
  "max-w-none text-sm leading-relaxed text-foreground [&_strong]:font-semibold [&_em]:italic " +
  "[&_h1]:mb-2 [&_h1]:mt-4 [&_h1]:text-xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h1]:first:mt-0 " +
  "[&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:first:mt-0 " +
  "[&_h3]:mb-1.5 [&_h3]:mt-3 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:first:mt-0 " +
  "[&_h4]:mb-1 [&_h4]:mt-3 [&_h4]:text-sm [&_h4]:font-semibold [&_h4]:first:mt-0 " +
  "[&_p]:my-2 [&_p]:break-words [&_p]:first:mt-0 [&_p]:last:mb-0 " +
  "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 " +
  "[&_li]:my-1 [&_li]:break-words [&_blockquote]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:border-[var(--border)] [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground " +
  "[&_hr]:my-4 [&_hr]:border-[var(--border)] [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 " +
  "[&_del]:line-through [&_input]:mr-2";

const compactShell = "[&_p]:my-0 [&_p]:inline [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_h1]:mt-0 [&_h2]:mt-0 [&_h3]:mt-0";

export interface MarkdownContentProps {
  markdown: string;
  className?: string;
  /** Tighter vertical rhythm for one-line cells or captions */
  compact?: boolean;
}

export function MarkdownContent({ markdown, className, compact }: MarkdownContentProps) {
  if (!markdown.trim()) return null;

  return (
    <div className={cn(proseShell, compact && compactShell, className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={baseComponents}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
