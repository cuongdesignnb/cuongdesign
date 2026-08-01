import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requestChatText } from "@/lib/ai/provider";
import { getAiRuntimeConfig } from "@/lib/ai/settings";

// POST /api/chat - client sends a message
export async function POST(request: Request) {
  try {
    const { sessionId, content } = await request.json();
    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Nội dung tin nhắn trống" }, { status: 400 });
    }

    let session = null;

    // Find or create session
    if (sessionId) {
      session = await prisma.chatSession.findUnique({
        where: { id: sessionId },
      });
    }

    if (!session) {
      session = await prisma.chatSession.create({
        data: {
          status: "AI_ACTIVE",
        },
      });
    }

    // Save user message
    await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        sender: "USER",
        content: content.trim(),
      },
    });

    // If AI is active, query OpenAI GPT-4o
    if (session.status === "AI_ACTIVE") {
      try {
        const aiConfig = await getAiRuntimeConfig();

        if (aiConfig.textApiKey) {
          // Fetch custom system prompt
          const customPromptSetting = await prisma.setting.findUnique({ where: { key: "ai_chat_prompt" } });
          const systemPromptBase = customPromptSetting?.value ||
            `Bạn là trợ lý ảo AI cao cấp đại diện cho Cường Design (CUONG DESIGN) - một Senior Fullstack Developer kiêm UI/UX Designer.
            Thông tin về bạn:
            - Dịch vụ cung cấp: Thiết kế UI/UX hiện đại (Figma), Thiết kế website Landing Page, Lập trình Web Fullstack (Next.js, React, Tailwind v4, Node.js, NestJS), Hệ thống Web Dashboard Admin, E-commerce, Tối ưu SEO, Setup Docker local.
            - Sản phẩm bán: Cung cấp source code, templates, UI kits cao cấp.
            - Nếu giá sản phẩm = 0 (Free), hướng dẫn khách điền Form nhận code hoặc điền form liên hệ trực tiếp.
            - Về thanh toán: Tự động qua ngân hàng thông qua SePay webhook. Khi mua hàng có trả phí, khách sẽ nhận được mã VietQR kèm memo chuyển khoản duy nhất để tự động hoàn thành giao dịch.
            - Thái độ: Lịch sự, chuyên nghiệp, tự tin, ngắn gọn, súc tích. Hãy tư vấn nhiệt tình cho khách và định hướng khách điền form liên hệ hoặc chọn mua code.`;
          const systemPrompt = `${systemPromptBase}

Định dạng câu trả lời bằng Markdown đơn giản: dùng đoạn văn ngắn, danh sách khi cần, **in đậm** cho ý chính, và [nhãn](https://url) cho link. Không dùng HTML.`;

          // Get chat history
          const chatHistory = await prisma.chatMessage.findMany({
            where: { sessionId: session.id },
            orderBy: { createdAt: "asc" },
            take: 20, // Keep last 20 messages for context
          });

          const messagesForAI = [
            { role: "system", content: systemPrompt },
            ...chatHistory.map((msg) => ({
              role: msg.sender === "USER" ? "user" : "assistant",
              content: msg.content,
            })),
          ];

          const aiReply = await requestChatText({
            config: aiConfig,
            messages: messagesForAI as Array<{
              role: "system" | "user" | "assistant";
              content: string;
            }>,
            maxTokens: 500,
          });
          await prisma.chatMessage.create({
            data: {
              sessionId: session.id,
              sender: "AI",
              content: aiReply.trim(),
            },
          });
        } else {
          // If no API Key configured, fallback response
          await prisma.chatMessage.create({
            data: {
              sessionId: session.id,
              sender: "AI",
              content: "Xin chào! Cảm ơn bạn đã liên hệ. Bạn có thể gửi form liên hệ trực tiếp cho Cường Design tại phần cuối trang để nhận phản hồi nhanh nhất.",
            },
          });
        }
      } catch (aiError) {
        console.error(
          "AI Error in Chat API:",
          aiError instanceof Error ? aiError.message : "UNKNOWN_ERROR",
        );
        await prisma.chatMessage.create({
          data: {
            sessionId: session.id,
            sender: "AI",
            content:
              "Tôi xin lỗi, hệ thống AI đang bận một chút. Bạn có thể để lại lời nhắn qua form liên hệ hoặc quay lại sau.",
          },
        });
      }
    }

    // Return the updated chat history
    const allMessages = await prisma.chatMessage.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      messages: allMessages,
      status: session.status,
    });
  } catch (error: any) {
    console.error("Lỗi gửi tin nhắn chat:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET /api/chat - get chat session messages
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ error: "Thiếu sessionId" }, { status: 400 });
    }

    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json({ error: "Không tìm thấy phiên trò chuyện" }, { status: 404 });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      success: true,
      messages,
      status: session.status,
    });
  } catch (error: any) {
    console.error("Lỗi lấy lịch sử chat:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
