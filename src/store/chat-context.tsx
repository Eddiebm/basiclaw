"use client";

import { createContext, useContext, useReducer, useCallback, type ReactNode } from "react";
import { track } from "@/lib/analytics";

export type Jurisdiction = string; // ISO alpha-2 code, lowercase
export type MessageRole = "user" | "assistant" | "system";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  citations?: Citation[];
}

export interface Citation {
  id: string;
  title: string;
  source: string;
  url?: string;
  snippet: string;
  kind?: "snippet" | "case";
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  jurisdiction: Jurisdiction;
  createdAt: Date;
  updatedAt: Date;
}

interface ChatState {
  sessions: ChatSession[];
  currentSessionId: string | null;
  isTyping: boolean;
  error: string | null;
  errorUpgradePath: string | null;
}

type ChatAction =
  | { type: "SET_CURRENT_SESSION"; payload: string | null }
  | { type: "ADD_SESSION"; payload: ChatSession }
  | { type: "DELETE_SESSION"; payload: string }
  | { type: "ADD_MESSAGE"; payload: { sessionId: string; message: Message } }
  | { type: "UPDATE_MESSAGE"; payload: { sessionId: string; messageId: string; content: string } }
  | { type: "SET_TYPING"; payload: boolean }
  | { type: "SET_ERROR"; payload: { message: string | null; upgradePath?: string | null } }
  | { type: "LOAD_SESSIONS"; payload: ChatSession[] }
  | { type: "UPSERT_SESSION"; payload: ChatSession };

const initialState: ChatState = {
  sessions: [],
  currentSessionId: null,
  isTyping: false,
  error: null,
  errorUpgradePath: null,
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "SET_CURRENT_SESSION":
      return { ...state, currentSessionId: action.payload };
    case "ADD_SESSION":
      return { ...state, sessions: [action.payload, ...state.sessions] };
    case "DELETE_SESSION":
      return {
        ...state,
        sessions: state.sessions.filter((s) => s.id !== action.payload),
        currentSessionId: state.currentSessionId === action.payload ? null : state.currentSessionId,
      };
    case "ADD_MESSAGE":
      return {
        ...state,
        sessions: state.sessions.map((session) =>
          session.id === action.payload.sessionId
            ? { ...session, messages: [...session.messages, action.payload.message], updatedAt: new Date() }
            : session
        ),
      };
    case "UPDATE_MESSAGE":
      return {
        ...state,
        sessions: state.sessions.map((session) =>
          session.id === action.payload.sessionId
            ? {
                ...session,
                messages: session.messages.map((msg) =>
                  msg.id === action.payload.messageId ? { ...msg, content: action.payload.content } : msg
                ),
              }
            : session
        ),
      };
    case "SET_TYPING":
      return { ...state, isTyping: action.payload };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload.message,
        errorUpgradePath: action.payload.upgradePath ?? null,
      };
    case "LOAD_SESSIONS":
      return { ...state, sessions: action.payload };
    case "UPSERT_SESSION": {
      const s = action.payload;
      const rest = state.sessions.filter((x) => x.id !== s.id);
      return {
        ...state,
        sessions: [s, ...rest],
        currentSessionId: s.id,
      };
    }
    default:
      return state;
  }
}

interface ChatContextValue extends ChatState {
  currentSession: ChatSession | null;
  createSession: (jurisdiction: Jurisdiction) => ChatSession;
  deleteSession: (sessionId: string) => void;
  sendMessage: (content: string) => Promise<void>;
  setCurrentSession: (sessionId: string | null) => void;
  upsertSession: (session: ChatSession) => void;
  clearError: () => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  const currentSession = state.sessions.find((s) => s.id === state.currentSessionId) || null;

  const createSession = useCallback((jurisdiction: Jurisdiction): ChatSession => {
    const session: ChatSession = {
      id: crypto.randomUUID(),
      title: `Chat ${new Date().toLocaleDateString()}`,
      messages: [],
      jurisdiction,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    dispatch({ type: "ADD_SESSION", payload: session });
    dispatch({ type: "SET_CURRENT_SESSION", payload: session.id });
    return session;
  }, []);

  const deleteSession = useCallback((sessionId: string) => {
    dispatch({ type: "DELETE_SESSION", payload: sessionId });
  }, []);

  const setCurrentSession = useCallback((sessionId: string | null) => {
    dispatch({ type: "SET_CURRENT_SESSION", payload: sessionId });
  }, []);

  const upsertSession = useCallback((session: ChatSession) => {
    dispatch({ type: "UPSERT_SESSION", payload: session });
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!state.currentSessionId) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    dispatch({ type: "ADD_MESSAGE", payload: { sessionId: state.currentSessionId, message: userMessage } });
    dispatch({ type: "SET_TYPING", payload: true });
    dispatch({ type: "SET_ERROR", payload: { message: null, upgradePath: null } });

    const localeHeader =
      typeof window !== "undefined"
        ? (window.location.pathname.split("/").filter(Boolean)[0] ?? "en").toLowerCase()
        : "en";

    try {
      const active = state.sessions.find((s) => s.id === state.currentSessionId);
      const jurisdiction = active?.jurisdiction || "us";
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-basiclaw-locale": localeHeader,
        },
        body: JSON.stringify({
          sessionId: state.currentSessionId,
          message: content,
          jurisdiction,
        }),
      });

      if (response.status === 429) {
        const j = (await response.json().catch(() => null)) as { message?: string; upgradeUrl?: string } | null;
        const upgradePath = j?.upgradeUrl?.trim().startsWith("/") ? j.upgradeUrl.trim() : null;
        dispatch({
          type: "SET_ERROR",
          payload: {
            message: j?.message ?? "Usage limit reached. See pricing to upgrade.",
            upgradePath,
          },
        });
        track("form_submit_error", { form: "chat_message", reason: "quota_429" });
        dispatch({ type: "SET_TYPING", payload: false });
        return;
      }

      if (!response.ok) {
        track("form_submit_error", { form: "chat_message", reason: `http_${response.status}` });
        throw new Error("Failed to send message");
      }

      const data = await response.json();

      const rawCites = data.citations as unknown;
      const citations: Citation[] | undefined = Array.isArray(rawCites)
        ? rawCites.map((c: Record<string, unknown>) => {
            const k = c.kind;
            const kind: Citation["kind"] = k === "case" || k === "snippet" ? k : undefined;
            return {
              id: String(c.id ?? ""),
              title: String(c.title ?? ""),
              source: String(c.source ?? ""),
              url: typeof c.url === "string" ? c.url : undefined,
              snippet: typeof c.snippet === "string" ? c.snippet : "",
              kind,
            };
          })
        : undefined;

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
        citations,
      };

      dispatch({ type: "ADD_MESSAGE", payload: { sessionId: state.currentSessionId, message: assistantMessage } });
      track("form_submit_success", { form: "chat_message" });

      const afterAssistant = [...(active?.messages ?? []), userMessage, assistantMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));
      void fetch(`/api/me/chats/${state.currentSessionId}`, {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          "x-basiclaw-locale": localeHeader,
        },
        body: JSON.stringify({
          jurisdiction,
          messages: afterAssistant,
        }),
      }).catch(() => {
        /* optional persistence when signed out or server 401 */
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to send message";
      dispatch({ type: "SET_ERROR", payload: { message: msg, upgradePath: null } });
      track("form_submit_error", { form: "chat_message", reason: "exception" });
    } finally {
      dispatch({ type: "SET_TYPING", payload: false });
    }
  }, [state.currentSessionId, state.sessions]);

  const clearError = useCallback(() => {
    dispatch({ type: "SET_ERROR", payload: { message: null, upgradePath: null } });
  }, []);

  return (
    <ChatContext.Provider
      value={{
        ...state,
        currentSession,
        createSession,
        deleteSession,
        sendMessage,
        setCurrentSession,
        upsertSession,
        clearError,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within ChatProvider");
  return context;
}