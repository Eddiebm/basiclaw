"use client";

import { useState } from "react";
import Link from "next/link";
import { useChat, type Jurisdiction } from "@/store/chat-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/Separator";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  MessageSquare,
  Trash2,
  ChevronRight,
  Globe,
  Scale,
  X,
  Menu,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeProvider";
import { Toggle } from "@/components/ui/Toggle";

const jurisdictions: { id: Jurisdiction; name: string; flag: string }[] = [
  { id: "us", name: "United States", flag: "US" },
  { id: "ghana", name: "Ghana", flag: "GH" },
  { id: "nigeria", name: "Nigeria", flag: "NG" },
];

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatSidebar({ isOpen, onClose }: ChatSidebarProps) {
  const { sessions, currentSessionId, createSession, deleteSession, setCurrentSession } = useChat();
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<Jurisdiction>("us");

  const handleNewChat = () => {
    createSession(selectedJurisdiction);
    onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: isOpen ? 0 : -280 }}
        className="fixed left-0 top-0 h-full w-[280px] bg-background border-r z-50 flex flex-col lg:relative lg:translate-x-0"
      >
        <div className="p-4 border-b flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Scale className="w-5 h-5 text-primary" />
            <span>BasicLaw</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* New Chat */}
        <div className="p-4">
          <div className="mb-3">
            <label className="text-xs font-medium text-muted-foreground mb-2 block">
              Jurisdiction
            </label>
            <div className="grid grid-cols-3 gap-2">
              {jurisdictions.map((jur) => (
                <button
                  key={jur.id}
                  onClick={() => setSelectedJurisdiction(jur.id)}
                  className={cn(
                    "text-xs py-2 px-3 rounded-lg border transition-colors",
                    selectedJurisdiction === jur.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-secondary"
                  )}
                >
                  {jur.flag}
                </button>
              ))}
            </div>
          </div>
          <Button onClick={handleNewChat} className="w-full" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>

        <Separator />

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            <p className="text-xs font-medium text-muted-foreground px-2 mb-2">Recent Chats</p>
            {sessions.length === 0 ? (
              <p className="text-sm text-muted-foreground px-2 py-4 text-center">
                No conversations yet
              </p>
            ) : (
              <div className="space-y-1">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={cn(
                      "group flex items-center gap-2 rounded-lg px-2 py-2 cursor-pointer transition-colors",
                      currentSessionId === session.id
                        ? "bg-secondary"
                        : "hover:bg-secondary/50"
                    )}
                    onClick={() => {
                      setCurrentSession(session.id);
                      onClose();
                    }}
                  >
                    <MessageSquare className="w-4 h-4 shrink-0 text-muted-foreground" />
                    <span className="flex-1 text-sm truncate">{session.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {session.jurisdiction.toUpperCase()}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(session.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Theme</span>
            <Toggle />
          </div>
        </div>
      </motion.aside>
    </>
  );
}