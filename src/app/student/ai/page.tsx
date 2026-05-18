"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AiMessage } from "@/components/shared/AiMessage";
import { UserMessage } from "@/components/shared/UserMessage";
import { TypingIndicator } from "@/components/shared/TypingIndicator";
import { apiFetch } from "@/lib/api";
import { suggestedQuestions } from "@/lib/mock-data";
import type { ChatMessage, ChatSession } from "@/lib/types";
import { Plus, Send, Mic, Sparkles, MessageSquare, Trash2 } from "lucide-react";

export default function AIPage() {
  const welcomeMessage: ChatMessage = {
    id: "welcome",
    role: "assistant",
    content: "Hello! I'm CampusOS AI Assistant. Ask me anything about your university — exam schedules, fee policies, hostel rules, and more!",
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };

  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChat = chatSessions.find((s) => s.id === activeChatId) || null;

  const fetchSessions = useCallback(async () => {
    try {
      const data = await apiFetch<{ sessions: { id: string; title: string; messageCount: number; createdAt: string; updatedAt: string }[] }>("/api/ai/sessions");
      const sessions: ChatSession[] = data.sessions.map((s) => ({
        id: s.id,
        title: s.title,
        messages: [],
      }));
      setChatSessions(sessions);
      if (sessions.length > 0) {
        setActiveChatId(sessions[0].id);
      }
    } catch {
      setChatSessions([]);
      setActiveChatId(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (sessionId: string) => {
    try {
      const data = await apiFetch<{
        session: { id: string; title: string };
        messages: ChatMessage[];
      }>(`/api/ai/sessions/${sessionId}`);
      setChatSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? { id: s.id, title: data.session.title, messages: data.messages }
            : s
        )
      );
    } catch {}
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    if (activeChatId) {
      fetchMessages(activeChatId);
    }
  }, [activeChatId, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages, isTyping]);

  const createNewChat = async () => {
    try {
      const data = await apiFetch<{ session: { id: string; title: string } }>("/api/ai/sessions", {
        method: "POST",
        body: JSON.stringify({ title: "New conversation" }),
      });
      const newSession: ChatSession = {
        id: data.session.id,
        title: data.session.title,
        messages: [welcomeMessage],
      };
      setChatSessions((prev) => [...prev, newSession]);
      setActiveChatId(data.session.id);
    } catch {}
  };

  const deleteChat = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    try {
      await apiFetch(`/api/ai/sessions/${sessionId}`, { method: "DELETE" });
      setChatSessions((prev) => {
        const updated = prev.filter((s) => s.id !== sessionId);
        if (activeChatId === sessionId) {
          setActiveChatId(updated.length > 0 ? updated[0].id : null);
        }
        return updated;
      });
    } catch {}
  };

  const addOptimisticMessage = (sessionId: string, msg: ChatMessage) => {
    setChatSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId ? { ...s, messages: [...s.messages, msg] } : s
      )
    );
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    if (!activeChatId) {
      try {
        const data = await apiFetch<{ session: { id: string; title: string } }>("/api/ai/sessions", {
          method: "POST",
          body: JSON.stringify({ title: "New conversation" }),
        });
        const newSession: ChatSession = { id: data.session.id, title: data.session.title, messages: [] };
        setChatSessions((prev) => [...prev, newSession]);
        setActiveChatId(data.session.id);

        const userMsg: ChatMessage = {
          id: `msg-${Date.now()}`,
          role: "user",
          content: text,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        addOptimisticMessage(data.session.id, userMsg);
        setInput("");
        setIsTyping(true);

        const reply = await apiFetch<{ reply: string; source: string | null; timestamp: string }>("/api/ai/chat", {
          method: "POST",
          body: JSON.stringify({ message: text, sessionId: data.session.id }),
        });

        const aiMsg: ChatMessage = {
          id: `msg-${Date.now()}-ai`,
          role: "assistant",
          content: reply.reply,
          sourceDoc: reply.source || undefined,
          timestamp: reply.timestamp || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        addOptimisticMessage(data.session.id, aiMsg);
        setIsTyping(false);
        return;
      } catch {
        setIsTyping(false);
        return;
      }
    }

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    addOptimisticMessage(activeChatId, userMsg);
    setInput("");
    setIsTyping(true);

    try {
      const data = await apiFetch<{ reply: string; source: string | null; timestamp: string }>("/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({ message: text, sessionId: activeChatId }),
      });

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: "assistant",
        content: data.reply,
        sourceDoc: data.source || undefined,
        timestamp: data.timestamp || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      addOptimisticMessage(activeChatId, aiMsg);
    } catch {
      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: "assistant",
        content: "Sorry, I couldn't process your request. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      addOptimisticMessage(activeChatId, aiMsg);
    }
    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  const clearMessages = async () => {
    if (!activeChatId) return;
    try {
      await apiFetch(`/api/ai/sessions/${activeChatId}`, { method: "DELETE" });
      await createNewChat();
    } catch {}
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-full flex"
    >
      {/* Left sidebar — Conversations */}
      <div className="w-[180px] shrink-0 border-r border-border/80 bg-white hidden md:flex flex-col">
        <div className="p-3">
          <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70 mb-3">
            Conversations
          </div>
          <div className="space-y-0.5">
            {chatSessions.map((session) => (
              <div key={session.id} className="flex items-center gap-1 group">
                <button
                  onClick={() => setActiveChatId(session.id)}
                  className={`flex-1 text-left px-2.5 py-2 rounded-md text-[12px] transition-all truncate ${
                    activeChatId === session.id
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  {session.title}
                </button>
                <button
                  onClick={(e) => deleteChat(e, session.id)}
                  className="shrink-0 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 transition-all text-muted-foreground/50"
                  title="Delete conversation"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={createNewChat}
            className="mt-3 w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-[12px] font-medium text-primary bg-blue-50 hover:bg-blue-100 transition-colors"
          >
            <Plus size={14} />
            New chat
          </button>
        </div>

        <div className="mt-auto border-t border-border/60 p-3">
          <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70 mb-2">
            Suggested
          </div>
          <div className="flex flex-col gap-1.5">
            {suggestedQuestions.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="text-left px-2.5 py-1.5 rounded-md text-[11px] text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all border border-border/60"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Top bar */}
        <div className="h-[52px] shrink-0 flex items-center justify-between px-5 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            {activeChat ? (
              <>
                <span className="text-[13px] font-medium text-foreground">
                  {activeChat.title}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-full">
                  <Sparkles size={10} />
                  Gemini
                </span>
              </>
            ) : (
              <span className="text-[13px] text-muted-foreground">Start a new conversation</span>
            )}
          </div>
          {activeChat && activeChat.messages.length > 1 && (
            <button
              onClick={clearMessages}
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 scrollbar-thin">
          {activeChat ? (
            <>
              <AnimatePresence>
                {activeChat.messages.map((msg) =>
                  msg.role === "assistant" ? (
                    <AiMessage key={msg.id} content={msg.content} source={msg.sourceDoc} />
                  ) : (
                    <UserMessage key={msg.id} content={msg.content} />
                  )
                )}
              </AnimatePresence>
              {isTyping && <TypingIndicator />}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <MessageSquare size={32} className="mb-2 opacity-40" />
              <p className="text-sm">Start a new conversation</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick buttons (mobile) */}
        <div className="md:hidden px-5 pb-2 flex gap-2 overflow-x-auto">
          {suggestedQuestions.map((q) => (
            <button
              key={q}
              onClick={() => handleSend(q)}
              className="shrink-0 px-3 py-1.5 rounded-full text-[11px] border border-border/80 text-muted-foreground hover:bg-muted/50 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input row */}
        <div className="px-4 py-3 border-t border-border/60 bg-white">
          <div className="flex items-center gap-2 bg-muted/50 border border-border/80 rounded-xl px-4 py-2 focus-within:border-primary/40 focus-within:bg-white transition-all">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your university…"
              rows={1}
              className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground/50 outline-none resize-none py-1 max-h-20"
            />
            <button
              className="shrink-0 p-1.5 rounded-full text-muted-foreground/50 hover:text-muted-foreground transition-colors"
              title="Voice input (coming soon)"
              disabled
            >
              <Mic size={16} />
            </button>
            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim()}
              className="shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary-dark transition-colors"
            >
              <Send size={14} />
            </button>
          </div>
          {input.length > 0 && (
            <div className="text-[10px] text-muted-foreground/60 text-right mt-1">
              {input.length} characters
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
