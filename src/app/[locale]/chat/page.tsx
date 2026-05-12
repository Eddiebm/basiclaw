"use client";

import { Suspense, useState } from "react";
import { Menu } from "lucide-react";
import { Navigation } from "@/components/sections/Navigation";
import { Button } from "@/components/ui/Button";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatPrefillListener } from "@/components/chat/ChatPrefillListener";
import { ChatSessionHydrator } from "@/components/chat/ChatSessionHydrator";

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      <div className="flex-1 flex">
        <Suspense fallback={null}>
          <ChatSessionHydrator />
          <ChatPrefillListener />
          <ChatSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </Suspense>

        <main className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="h-14 border-b flex items-center px-4 gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="font-semibold">Legal Chat</h1>
            </div>
          </header>

          {/* Chat Area */}
          <ChatInterface />
        </main>
      </div>
    </div>
  );
}