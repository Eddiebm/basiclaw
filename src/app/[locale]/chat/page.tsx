"use client";

import { Suspense, useState } from "react";
import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { Navigation } from "@/components/sections/Navigation";
import { Button } from "@/components/ui/Button";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatPrefillListener } from "@/components/chat/ChatPrefillListener";
import { ChatSessionHydrator } from "@/components/chat/ChatSessionHydrator";

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const t = useTranslations("chat");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      <div className="flex-1 flex min-h-0">
        <Suspense fallback={null}>
          <ChatSessionHydrator />
          <ChatPrefillListener />
          <ChatSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </Suspense>

        <main className="flex-1 flex flex-col min-w-0 min-h-0">
          {/* Header */}
          <header className="border-b flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden shrink-0 self-start sm:self-center"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex-1 min-w-0 space-y-1">
              <h1 className="font-semibold text-base sm:text-lg leading-tight">{t("pageTitle")}</h1>
              <p className="text-sm text-muted-foreground leading-snug">{t("valuePropLine")}</p>
              <p className="text-xs text-muted-foreground leading-snug">{t("historyHint")}</p>
            </div>
          </header>

          {/* Chat Area */}
          <Suspense fallback={<div className="flex-1 min-h-[240px] bg-muted/10 animate-pulse rounded-none" aria-hidden />}>
            <ChatInterface />
          </Suspense>
        </main>
      </div>
    </div>
  );
}