"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Bot, User, Shield, Send, Check, Loader2, Power } from "lucide-react";
import Button from "@/components/ui/Button";

interface ChatMessage {
  id: string;
  sender: "USER" | "AI" | "ADMIN";
  content: string;
  createdAt: string;
}

interface ChatSession {
  id: string;
  status: "AI_ACTIVE" | "HUMAN_ACTIVE" | "CLOSED";
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

interface AdminChatsClientProps {
  initialSessions: ChatSession[];
}

export default function AdminChatsClient({ initialSessions }: AdminChatsClientProps) {
  const [sessions, setSessions] = useState<ChatSession[]>(initialSessions);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(
    initialSessions.length > 0 ? initialSessions[0].id : null
  );
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  // Poll for messages and updates every 3 seconds
  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const res = await fetch("/api/admin/chats");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            // For the active session, we want to fetch its full list of messages if it updated
            let updatedSessions = [...data.sessions];
            
            // Re-fetch active session's full message log since the API list returns only latest message
            if (activeSessionId) {
              const detailRes = await fetch(`/api/chat?sessionId=${activeSessionId}`);
              if (detailRes.ok) {
                const detailData = await detailRes.json();
                if (detailData.success) {
                  updatedSessions = updatedSessions.map((s) =>
                    s.id === activeSessionId ? { ...s, messages: detailData.messages } : s
                  );
                }
              }
            }

            setSessions(updatedSessions);
          }
        }
      } catch (error) {
        console.error("Lỗi polling chats:", error);
      }
    };

    const interval = setInterval(fetchUpdates, 3000);
    return () => clearInterval(interval);
  }, [activeSessionId]);

  // Scroll to bottom on message load
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages?.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeSessionId || sending) return;

    setSending(true);
    try {
      const res = await fetch("/api/admin/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: activeSessionId, content: replyText }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          // Instantly append local admin message
          setSessions((prev) =>
            prev.map((s) =>
              s.id === activeSessionId
                ? {
                    ...s,
                    messages: [...(s.messages || []), data.message],
                  }
                : s
            )
          );
          setReplyText("");
        }
      }
    } catch (error) {
      console.error("Lỗi gửi tin nhắn:", error);
    } finally {
      setSending(false);
    }
  };

  const handleUpdateStatus = async (status: "AI_ACTIVE" | "HUMAN_ACTIVE" | "CLOSED") => {
    if (!activeSessionId) return;

    try {
      const res = await fetch("/api/admin/chats", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: activeSessionId, status }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSessions((prev) =>
            prev.map((s) => (s.id === activeSessionId ? { ...s, status } : s))
          );
        }
      }
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
    }
  };

  return (
    <>
      {/* Session list - 1/3 width */}
      <div className="w-full md:w-80 border-r border-white/5 flex flex-col h-full bg-[#0a0822]/20">
        <div className="p-4 border-b border-white/5 bg-black/10">
          <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">Hội thoại hoạt động</span>
        </div>

        <div className="grow overflow-y-auto divide-y divide-white/5">
          {sessions.length > 0 ? (
            sessions.map((session) => {
              const lastMsg = session.messages?.[session.messages.length - 1];
              const isSelected = session.id === activeSessionId;
              
              return (
                <button
                  key={session.id}
                  onClick={() => setActiveSessionId(session.id)}
                  className={`w-full text-left p-4 transition-all flex flex-col gap-1 cursor-pointer ${
                    isSelected ? "bg-white/5 text-white" : "hover:bg-white/[0.02] text-gray-400"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">Khách #{session.id.slice(-6)}</span>
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        session.status === "HUMAN_ACTIVE"
                          ? "bg-pink-500 animate-pulse"
                          : session.status === "AI_ACTIVE"
                          ? "bg-blue-500"
                          : "bg-gray-600"
                      }`}
                      title={
                        session.status === "HUMAN_ACTIVE"
                          ? "Đang tiếp quản"
                          : session.status === "AI_ACTIVE"
                          ? "AI đang hỗ trợ"
                          : "Đã đóng"
                      }
                    />
                  </div>
                  <p className="text-xs text-gray-500 truncate max-w-[240px]">
                    {lastMsg ? `${lastMsg.sender === "USER" ? "Khách: " : lastMsg.sender === "ADMIN" ? "Bạn: " : "AI: "}${lastMsg.content}` : "Chưa có tin nhắn"}
                  </p>
                  <span className="text-[10px] text-gray-600 self-end">
                    {new Date(session.updatedAt).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </button>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-gray-600">Không có hội thoại nào.</div>
          )}
        </div>
      </div>

      {/* Message window - 2/3 width */}
      <div className="grow flex flex-col h-full bg-black/10">
        {activeSession ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-white/5 bg-black/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Khách hàng #{activeSession.id.slice(-6)}</span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      activeSession.status === "HUMAN_ACTIVE"
                        ? "bg-pink-500/10 text-pink-400 border-pink-500/20"
                        : activeSession.status === "AI_ACTIVE"
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                    }`}
                  >
                    {activeSession.status === "HUMAN_ACTIVE" && "Đang tiếp quản (Live)"}
                    {activeSession.status === "AI_ACTIVE" && "AI đang trả lời"}
                    {activeSession.status === "CLOSED" && "Đã đóng"}
                  </span>
                </h4>
                <p className="text-[10px] text-gray-600 mt-0.5">ID: {activeSession.id}</p>
              </div>

              {/* Takeover Control buttons */}
              <div className="flex gap-2">
                {activeSession.status === "AI_ACTIVE" && (
                  <button
                    onClick={() => handleUpdateStatus("HUMAN_ACTIVE")}
                    className="px-3 py-1.5 bg-pink-600/25 border border-pink-500/30 hover:bg-pink-500/40 text-pink-400 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>Tiếp quản Chat</span>
                  </button>
                )}
                {activeSession.status === "HUMAN_ACTIVE" && (
                  <button
                    onClick={() => handleUpdateStatus("AI_ACTIVE")}
                    className="px-3 py-1.5 bg-blue-600/25 border border-blue-500/30 hover:bg-blue-500/40 text-blue-400 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>Kích hoạt AI</span>
                  </button>
                )}
                {activeSession.status !== "CLOSED" && (
                  <button
                    onClick={() => handleUpdateStatus("CLOSED")}
                    className="px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>Đóng chat</span>
                  </button>
                )}
                {activeSession.status === "CLOSED" && (
                  <button
                    onClick={() => handleUpdateStatus("AI_ACTIVE")}
                    className="px-3 py-1.5 bg-pink-600 hover:bg-pink-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>Mở lại chat</span>
                  </button>
                )}
              </div>
            </div>

            {/* Message log */}
            <div className="grow overflow-y-auto p-4 space-y-4">
              {activeSession.messages && activeSession.messages.length > 0 ? (
                activeSession.messages.map((msg) => {
                  const isUser = msg.sender === "USER";
                  const isAdmin = msg.sender === "ADMIN";
                  
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      <div className="flex flex-col max-w-[80%] gap-1">
                        {/* Sender Label */}
                        <span className={`text-[9px] text-gray-500 flex items-center gap-1 ${isUser ? "self-end" : "self-start"}`}>
                          {isUser ? (
                            <>
                              <span>Khách</span>
                              <User className="w-2.5 h-2.5" />
                            </>
                          ) : isAdmin ? (
                            <>
                              <Shield className="w-2.5 h-2.5 text-purple-400" />
                              <span className="text-purple-400 font-semibold">Bạn (Admin)</span>
                            </>
                          ) : (
                            <>
                              <Bot className="w-2.5 h-2.5 text-blue-400" />
                              <span className="text-blue-400 font-semibold">AI Assistant</span>
                            </>
                          )}
                        </span>

                        {/* Content bubble */}
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-xs whitespace-pre-wrap ${
                            isUser
                              ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-tr-none"
                              : isAdmin
                              ? "bg-gradient-to-r from-violet-900 to-indigo-950 text-white rounded-tl-none border border-violet-500/20"
                              : "bg-[#14122e] text-gray-200 rounded-tl-none border border-white/5"
                          }`}
                        >
                          {msg.content}
                        </div>

                        {/* Message date */}
                        <span className={`text-[8px] text-gray-600 ${isUser ? "self-end" : "self-start"}`}>
                          {new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-gray-600">Chưa có tin nhắn trong phiên này.</div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input reply form */}
            <form onSubmit={handleSend} className="p-4 border-t border-white/5 bg-black/20 flex gap-2">
              <input
                type="text"
                disabled={activeSession.status === "CLOSED" || sending}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={
                  activeSession.status === "CLOSED"
                    ? "Hội thoại đã đóng. Hãy mở lại để nhắn tin."
                    : activeSession.status === "AI_ACTIVE"
                    ? "Nhập tin nhắn... (Nhấp 'Tiếp quản Chat' để tắt AI trả lời tự động)"
                    : "Nhập tin nhắn trả lời khách hàng..."
                }
                className="grow bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-pink-500/50 disabled:opacity-50"
              />
              <Button
                type="submit"
                disabled={activeSession.status === "CLOSED" || !replyText.trim() || sending}
                className="bg-pink-600 hover:bg-pink-500 text-white px-4 flex items-center justify-center gap-1.5 transition-all"
              >
                {sending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Gửi</span>
                  </>
                )}
              </Button>
            </form>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-600 p-8">
            <MessageSquare className="w-12 h-12 text-gray-700 mb-2" />
            <p className="text-sm font-semibold">Trò chuyện Live Takeover</p>
            <p className="text-xs mt-1">Hãy chọn một cuộc hội thoại từ danh sách bên trái để xem chi tiết.</p>
          </div>
        )}
      </div>
    </>
  );
}
