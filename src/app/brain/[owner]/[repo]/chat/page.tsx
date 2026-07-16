"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import { Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { variants, transition } from "@/lib/motion";
import { useAnalysisStore } from "@/stores/analysis-store";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const STARTER_PROMPTS = [
  "Explain the overall architecture of this project",
  "What design patterns are used and why?",
  "What are the main entry points?",
  "How is error handling implemented?",
];

export default function ChatPage() {
  const params = useParams<{ owner: string; repo: string }>();
  const { results } = useAnalysisStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(content: string) {
    if (!content.trim() || streaming) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setStreaming(true);

    const assistantId = crypto.randomUUID();
    setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          repoContext: {
            owner: params.owner,
            repo: params.repo,
            summary: results?.summary,
            architecture: results?.architecture,
            patterns: results?.patterns,
            dependencies: results?.dependencies,
            insights: results?.insights,
            health: results?.health,
            files: results?.files,
          },
        }),
      });

      if (!res.ok || !res.body) return;

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line === "data: [DONE]") continue;
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6));
            if (data.text) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: m.content + data.text } : m
                )
              );
            }
          }
        }
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, content: "Sorry, something went wrong. Please try again." } : m
        )
      );
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div className="h-screen flex flex-col p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-space-grotesk)]">
          Engineering Brain Chat
        </h1>
        <p className="text-sm text-[#A7A7B2]">
          Ask anything about {params.owner}/{params.repo}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.length === 0 && (
          <motion.div
            className="flex flex-col items-center justify-center h-full"
            variants={variants.fadeUp}
            initial="initial"
            animate="animate"
            transition={transition.medium}
          >
            <div className="p-4 rounded-full bg-gradient-to-br from-[#4F7CFF]/10 to-[#8B5CF6]/10 border border-[rgba(79,124,255,0.15)] mb-6">
              <Bot size={32} className="text-[#4F7CFF]" />
            </div>
            <h2 className="text-lg font-medium text-white mb-2">Start a conversation</h2>
            <p className="text-sm text-[#6B6B76] mb-6 text-center max-w-md">
              Ask questions about the codebase architecture, patterns, dependencies, or any engineering concern.
            </p>
            <div className="grid grid-cols-2 gap-2 max-w-lg">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="text-left text-xs text-[#A7A7B2] px-4 py-3 rounded-[14px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.04)] hover:text-white transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="popLayout">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              layout
              variants={variants.fadeUp}
              initial="initial"
              animate="animate"
              transition={transition.fast}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#4F7CFF] to-[#8B5CF6] flex items-center justify-center shrink-0">
                  <Bot size={14} className="text-white" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-[16px] px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-[#4F7CFF]/10 text-white border border-[rgba(79,124,255,0.2)]"
                    : "bg-[rgba(255,255,255,0.03)] text-[#E0E0E5] border border-[rgba(255,255,255,0.06)]"
                }`}
              >
                <pre className="whitespace-pre-wrap font-[family-name:var(--font-inter)] text-sm">
                  {msg.content}
                  {streaming && msg.role === "assistant" && msg === messages[messages.length - 1] && (
                    <span className="inline-block w-1.5 h-4 bg-[#4F7CFF] ml-0.5 animate-pulse" />
                  )}
                </pre>
              </div>
              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-full bg-[rgba(255,255,255,0.06)] flex items-center justify-center shrink-0">
                  <User size={14} className="text-[#A7A7B2]" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <GlassPanel intensity="medium" className="p-3 flex items-end gap-3">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage(input);
            }
          }}
          placeholder="Ask about the codebase..."
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm text-white placeholder:text-[#6B6B76] focus:outline-none py-2 px-3 max-h-[120px]"
        />
        <Button
          size="icon"
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || streaming}
        >
          <Send size={16} />
        </Button>
      </GlassPanel>
    </div>
  );
}
