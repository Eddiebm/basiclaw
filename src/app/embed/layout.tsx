import type { Metadata } from "next";
import { EmbedLayoutClient } from "@/components/embed/EmbedLayoutClient";

export const metadata: Metadata = {
  title: "BasicLaw embed",
  robots: { index: false, follow: false },
};

export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-0 w-full bg-background p-2 sm:p-3">
      <EmbedLayoutClient>{children}</EmbedLayoutClient>
    </div>
  );
}
