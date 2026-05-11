"use client";

import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Plus, Scale, Trash2, X } from "lucide-react";
import { useChat, type Jurisdiction } from "@/store/chat-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/Separator";
import { COUNTRIES } from "@/data/countries";
import { getCountry, getPopularCountries } from "@/lib/jurisdictions";

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const SORTED = COUNTRIES.slice().sort((a, b) => a.name.localeCompare(b.name));

export function ChatSidebar({ isOpen, onClose }: ChatSidebarProps) {
  const { sessions, currentSessionId, createSession, deleteSession, setCurrentSession } = useChat();
  const searchParams = useSearchParams();
  const initialJurisdiction = (() => {
    const param = searchParams.get("country");
    if (param && getCountry(param)) return param.toLowerCase();
    return "us";
  })();
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<Jurisdiction>(initialJurisdiction);

  const popular = useMemo(() => getPopularCountries(), []);

  const handleNewChat = () => {
    createSession(selectedJurisdiction);
    onClose();
  };

  const selectedCountry = getCountry(selectedJurisdiction);

  return (
    <>
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

      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        className="fixed left-0 top-0 h-full w-[300px] bg-background border-r z-50 flex flex-col lg:relative lg:translate-x-0"
      >
        <div className="p-4 border-b flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Scale className="w-5 h-5 text-[var(--primary)]" />
            <span>BasicLaw</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-4 space-y-3">
          <label className="block">
            <span className="block text-xs font-medium text-muted-foreground mb-1.5">Jurisdiction</span>
            <select
              value={selectedJurisdiction}
              onChange={(event) => setSelectedJurisdiction(event.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <optgroup label="Most-explored">
                {popular.map((country) => (
                  <option key={`pop-${country.code}`} value={country.code.toLowerCase()}>
                    {country.flag} {country.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label={`All ${SORTED.length} countries`}>
                {SORTED.map((country) => (
                  <option key={country.code} value={country.code.toLowerCase()}>
                    {country.flag} {country.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </label>
          {selectedCountry && (
            <p className="text-xs text-muted-foreground">
              The assistant will answer for {selectedCountry.name}.{" "}
              <Link
                href={`/constitutions/${selectedCountry.code.toLowerCase()}`}
                className="underline underline-offset-2 hover:text-foreground"
              >
                Read its constitution
              </Link>
              .
            </p>
          )}
          <Button onClick={handleNewChat} className="w-full" size="sm">
            <Plus className="w-4 h-4 mr-1" />
            New chat
          </Button>
        </div>

        <Separator />

        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            <p className="text-xs font-medium text-muted-foreground px-2 mb-2">Recent chats</p>
            {sessions.length === 0 ? (
              <p className="text-sm text-muted-foreground px-2 py-4 text-center">No conversations yet.</p>
            ) : (
              <div className="space-y-1">
                {sessions.map((session) => {
                  const country = getCountry(session.jurisdiction);
                  return (
                    <div
                      key={session.id}
                      className={cn(
                        "group flex items-center gap-2 rounded-lg px-2 py-2 cursor-pointer transition-colors",
                        currentSessionId === session.id ? "bg-secondary" : "hover:bg-secondary/50"
                      )}
                      onClick={() => {
                        setCurrentSession(session.id);
                        onClose();
                      }}
                    >
                      <MessageSquare className="w-4 h-4 shrink-0 text-muted-foreground" />
                      <span className="flex-1 text-sm truncate">{session.title}</span>
                      <span className="text-xs text-muted-foreground" aria-label={country?.name ?? session.jurisdiction}>
                        {country?.flag ?? session.jurisdiction.toUpperCase()}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100"
                        onClick={(event) => {
                          event.stopPropagation();
                          deleteSession(session.id);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  );
}
