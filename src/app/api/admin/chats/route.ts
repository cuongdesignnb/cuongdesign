import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

// Middleware/Guard helper to secure admin API
async function checkAdminAuth() {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") {
    return false;
  }
  return true;
}

// GET /api/admin/chats - list all chats
export async function GET() {
  const isAuthorized = await checkAdminAuth();
  if (!isAuthorized) {
    return NextResponse.json({ error: "Không được phép" }, { status: 401 });
  }

  try {
    const sessions = await prisma.chatSession.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1, // Only get the latest message for preview
        },
      },
    });

    return NextResponse.json({
      success: true,
      sessions,
    });
  } catch (error: any) {
    console.error("Lỗi lấy danh sách chats admin:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/admin/chats - send message from admin
export async function POST(request: Request) {
  const isAuthorized = await checkAdminAuth();
  if (!isAuthorized) {
    return NextResponse.json({ error: "Không được phép" }, { status: 401 });
  }

  try {
    const { sessionId, content } = await request.json();
    if (!sessionId || !content || !content.trim()) {
      return NextResponse.json({ error: "Thiếu dữ liệu" }, { status: 400 });
    }

    const message = await prisma.chatMessage.create({
      data: {
        sessionId,
        sender: "ADMIN",
        content: content.trim(),
      },
    });

    // Update session timestamp
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error: any) {
    console.error("Lỗi gửi tin nhắn admin:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/admin/chats - takeover / change status
export async function PUT(request: Request) {
  const isAuthorized = await checkAdminAuth();
  if (!isAuthorized) {
    return NextResponse.json({ error: "Không được phép" }, { status: 401 });
  }

  try {
    const { sessionId, status } = await request.json();
    if (!sessionId || !status) {
      return NextResponse.json({ error: "Thiếu dữ liệu" }, { status: 400 });
    }

    const session = await prisma.chatSession.update({
      where: { id: sessionId },
      data: { status },
    });

    // Create a system notification message inside the chat log to inform the user
    let notificationText = "";
    if (status === "HUMAN_ACTIVE") {
      notificationText = "🔔 Admin (Cường Design) đã tham gia cuộc trò chuyện. Chatbot tạm ngưng.";
    } else if (status === "AI_ACTIVE") {
      notificationText = "🔔 Admin đã rời cuộc trò chuyện. Trợ lý AI được kích hoạt lại.";
    } else if (status === "CLOSED") {
      notificationText = "🔔 Cuộc trò chuyện đã đóng.";
    }

    if (notificationText) {
      await prisma.chatMessage.create({
        data: {
          sessionId,
          sender: "AI", // System messages can be styled like AI or neutral messages
          content: notificationText,
        },
      });
    }

    return NextResponse.json({
      success: true,
      session,
    });
  } catch (error: any) {
    console.error("Lỗi thay đổi trạng thái chat:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
