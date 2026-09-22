"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const quickActions = [
  "Make it more luxurious",
  "Suggest sofa under ₹30,000",
  "Reduce budget",
  "Change wall color",
];

export default function AIAssistant() {
  const { getToken } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hi! I'm your Insight Nexsus AI design assistant. I can help you with interior styling ideas, furniture recommendations, budget optimization, and store matches. How can I help you today?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    document.addEventListener("toggle-ai-assistant", handleToggle);
    return () => document.removeEventListener("toggle-ai-assistant", handleToggle);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const token = await getToken();
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: content.trim() }),
      });

      const data = await res.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.data?.reply || data.reply || "I couldn't process that request. Please try again.",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I'm having trouble connecting. Please try again later.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-96 h-[500px] bg-[#F3F1EE] rounded-2xl shadow-2xl border border-[#D5CFC7] flex flex-col overflow-hidden text-[#5F5750]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-[#5F5750] text-[#FFF9F2] border-b border-[#4A433D]">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-[#E5E1DC]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight text-[#FFF9F2]">Insight Nexsus AI</h3>
                  <p className="text-[11px] font-medium text-[#E5E1DC]">Interior Design & Styling Expert</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors text-[#FFF9F2] cursor-pointer"
              >
                <X className="h-4 w-4 stroke-[3]" />
              </button>
            </div>

            {/* Chat message list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FFF9F2]">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[#5F5750] text-[#FFF9F2] font-medium rounded-br-xs shadow-sm"
                        : "bg-[#F3F1EE] text-[#5F5750] border border-[#D5CFC7] rounded-bl-xs shadow-xs"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#F3F1EE] border border-[#D5CFC7] rounded-2xl rounded-bl-xs px-4 py-3 shadow-xs">
                    <div className="flex gap-1.5">
                      <span className="h-2 w-2 bg-[#5F5750] rounded-full animate-bounce" />
                      <span className="h-2 w-2 bg-[#5F5750] rounded-full animate-bounce [animation-delay:0.15s]" />
                      <span className="h-2 w-2 bg-[#5F5750] rounded-full animate-bounce [animation-delay:0.3s]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {messages.length <= 2 && (
              <div className="px-4 py-2 bg-[#F3F1EE] border-t border-[#D5CFC7] flex flex-wrap gap-1.5">
                {quickActions.map((action) => (
                  <button
                    key={action}
                    onClick={() => sendMessage(action)}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-[#E5E1DC] text-[#5F5750] border border-[#D5CFC7] rounded-full hover:bg-[#DCD6CF] transition-colors cursor-pointer"
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 px-4 py-3 border-t border-[#D5CFC7] bg-[#F3F1EE]"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about design, budget, furniture..."
                className="flex-1 px-4 py-2 text-xs sm:text-sm bg-[#E5E1DC] rounded-full border border-[#D5CFC7] focus:outline-none focus:border-[#5F5750] text-[#5F5750] placeholder:text-[#8A8178] transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="h-9 w-9 rounded-full bg-[#5F5750] hover:bg-[#4A433D] text-[#FFF9F2] flex items-center justify-center hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 border border-[#5F5750] cursor-pointer"
              >
                <Send className="h-4 w-4 stroke-[2.5]" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-4 sm:right-6 z-50 h-14 w-14 rounded-full bg-[#5F5750] hover:bg-[#4A433D] text-[#FFF9F2] shadow-xl flex items-center justify-center cursor-pointer border border-[#5F5750]"
      >
        {isOpen ? (
          <X className="h-6 w-6 stroke-[3]" />
        ) : (
          <MessageSquare className="h-6 w-6 stroke-[2.5]" />
        )}
      </motion.button>
    </>
  );
}
