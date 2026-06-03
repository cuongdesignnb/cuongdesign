import React from "react";
import { prisma } from "@/lib/db";
import AdminChatsClient from "./AdminChatsClient";

export default async function AdminChatsPage() {
  // Fetch initial chat sessions
  const sessions = await prisma.chatSession.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Trò chuyện Trực tuyến</h1>
        <p className="text-sm text-gray-500 mt-1">
          Theo dõi các cuộc hội thoại khách hàng, hỗ trợ trực tuyến và can thiệp live chat (human takeover).
        </p>
      </div>

      <div className="grow bg-[#0a0822]/40 border border-white/5 rounded-2xl overflow-hidden flex">
        <AdminChatsClient initialSessions={JSON.parse(JSON.stringify(sessions))} />
      </div>
    </div>
  );
}
