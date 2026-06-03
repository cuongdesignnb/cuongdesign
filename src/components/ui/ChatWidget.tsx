"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { MessageSquare, Send, X, Bot, User, Loader2, Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";

interface ChatMessage {
  id: string;
  sender: "USER" | "AI" | "ADMIN";
  content: string;
  createdAt: string;
}

export default function ChatWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<"AI_ACTIVE" | "HUMAN_ACTIVE" | "CLOSED">("AI_ACTIVE");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Hide chat widget on admin and login pages
  const isExcludedRoute = pathname?.startsWith("/admin") || pathname?.startsWith("/login");

  // Load session from localStorage on mount
  useEffect(() => {
    if (isExcludedRoute) return;

    const savedSessionId = localStorage.getItem("cuongdesign_chat_session");
    if (savedSessionId) {
      setSessionId(savedSessionId);
      // Fetch existing messages
      fetchMessages(savedSessionId);
    } else {
      // Add default welcome message
      setMessages([
        {
          id: "welcome",
          sender: "AI",
          content: "Xin chào! Tôi là trợ lý AI của Cường Design. Tôi có thể giúp gì cho bạn hôm nay? (Bạn có thể hỏi về thiết kế website, giá cả, hoặc cách mua source code)",
          createdAt: new Date().toISOString(),
        },
      ]);
    }
  }, [isExcludedRoute]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isOpen]);

  // Poll for message log updates when chat is open (vital for Admin Takeover)
  useEffect(() => {
    if (!isOpen || !sessionId || isExcludedRoute) return;

    const poll = async () => {
      try {
        const res = await fetch(`/api/chat?sessionId=${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setMessages(data.messages);
            setStatus(data.status);
          }
        }
      } catch (err) {
        console.error("Lỗi polling chat widget:", err);
      }
    };

    const interval = setInterval(poll, 4000);
    return () => clearInterval(interval);
  }, [isOpen, sessionId, isExcludedRoute]);

  const fetchMessages = async (sid: string) => {
    try {
      const res = await fetch(`/api/chat?sessionId=${sid}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.messages.length > 0) {
          setMessages(data.messages);
          setStatus(data.status);
        }
      }
    } catch (err) {
      console.error("Lỗi tải lịch sử chat:", err);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    const textToSend = inputText.trim();
    setInputText("");
    
    // Add user message to UI immediately for better UX
    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      sender: "USER",
      content: textToSend,
      createdAt: new Date().toISOString(),
    };
    
    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          content: textToSend,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setMessages(data.messages);
          setStatus(data.status);
          if (data.sessionId && data.sessionId !== sessionId) {
            setSessionId(data.sessionId);
            localStorage.setItem("cuongdesign_chat_session", data.sessionId);
          }
        }
      }
    } catch (err) {
      console.error("Lỗi gửi tin nhắn chat client:", err);
    } finally {
      setLoading(false);
    }
  };

  if (isExcludedRoute) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat window */}
      {isOpen && (
        <div className="w-[320px] sm:w-[380px] h-[480px] mb-4 bg-[#0a081e]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_10px_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#0d092b] to-[#120e36] border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-pink-500/20 border border-pink-500/30 flex items-center justify-center">
                <Bot className="w-4 h-4 text-pink-400" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-bold text-white tracking-wider flex items-center gap-1.5">
                  <span>CUONG DESIGN COPILOT</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                </h4>
                <span className="text-[9px] text-gray-500 uppercase tracking-widest block font-medium">
                  {status === "HUMAN_ACTIVE" ? "🔔 Đang chat với Cường Design" : "🤖 Trợ lý AI đang hoạt động"}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages list */}
          <div className="grow overflow-y-auto p-4 space-y-4 flex flex-col">
            {messages.map((msg) => {
              const isUser = msg.sender === "USER";
              const isAdmin = msg.sender === "ADMIN";
              
              return (
                <div
                  key={msg.id}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div className="flex flex-col max-w-[85%] gap-1 text-left">
                    <span className={`text-[8px] text-gray-500 flex items-center gap-1 ${isUser ? "self-end" : "self-start"}`}>
                      {isUser ? (
                        <>
                          <span>Bạn</span>
                          <User className="w-2 h-2" />
                        </>
                      ) : isAdmin ? (
                        <>
                          <Sparkles className="w-2 h-2 text-purple-400" />
                          <span className="text-purple-400 font-semibold">Cường Design (Quản trị viên)</span>
                        </>
                      ) : (
                        <>
                          <Bot className="w-2 h-2 text-blue-400" />
                          <span className="text-blue-400 font-semibold">AI Trợ Lý</span>
                        </>
                      )}
                    </span>
                    <div
                      className={`px-3 py-2 rounded-2xl text-xs whitespace-pre-wrap leading-relaxed ${
                        isUser
                          ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-tr-none"
                          : isAdmin
                          ? "bg-[#1f163b] text-white border border-purple-500/20 rounded-tl-none font-medium"
                          : "bg-white/5 text-gray-200 border border-white/5 rounded-tl-none"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                </div>
              );
            })}
            {loading && (
              <div className="flex justify-start">
                <div className="flex flex-col gap-1 text-left">
                  <span className="text-[8px] text-gray-500 flex items-center gap-1">
                    <Bot className="w-2 h-2 text-blue-400" />
                    <span>AI đang trả lời...</span>
                  </span>
                  <div className="px-3 py-2 bg-white/5 rounded-2xl rounded-tl-none border border-white/5 flex items-center space-x-1">
                    <Loader2 className="w-3.5 h-3.5 text-gray-400 animate-spin" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Form */}
          <form onSubmit={handleSend} className="p-3 border-t border-white/5 bg-black/30 flex gap-2">
            <input
              type="text"
              disabled={status === "CLOSED" || loading}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={status === "CLOSED" ? "Phiên trò chuyện đã đóng" : "Nhập tin nhắn..."}
              className="grow bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-pink-500/50 disabled:opacity-50"
            />
            <Button
              type="submit"
              disabled={status === "CLOSED" || !inputText.trim() || loading}
              className="bg-pink-600 hover:bg-pink-500 text-white px-3 flex items-center justify-center transition-all"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>
      )}

      {/* Floating Chat Bubble Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white flex items-center justify-center shadow-[0_0_20px_rgba(236,72,153,0.4)] hover:shadow-[0_0_30px_rgba(236,72,153,0.6)] border border-pink-400/20 hover:scale-105 transition-all duration-300 cursor-pointer"
        title="Trò chuyện trực tuyến"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6 animate-pulse" />}
      </button>
    </div>
  );
}
