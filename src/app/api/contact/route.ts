import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/mailer";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2, "Tên quá ngắn"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().optional(),
  subject: z.string().min(3, "Chủ đề quá ngắn"),
  message: z.string().min(5, "Nội dung quá ngắn"),
  productId: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = contactSchema.parse(body);

    // Save to Database
    const contact = await prisma.contact.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone || null,
        subject: validatedData.subject,
        message: validatedData.message,
        productId: validatedData.productId || null,
      },
    });

    // Check if it's for a free product
    let productTitle = "";
    if (validatedData.productId) {
      const product = await prisma.product.findUnique({
        where: { id: validatedData.productId },
      });
      if (product) {
        productTitle = product.title;
      }
    }

    // Try sending email notification to Admin
    try {
      const adminSettings = await prisma.setting.findUnique({
        where: { key: "admin_receive_email" },
      });
      const adminEmail = adminSettings?.value || process.env.ADMIN_EMAIL || "admin@cuongdesign.com";

      const subject = productTitle 
        ? `[CUONG DESIGN] Yêu cầu nhận code: ${productTitle}` 
        : `[CUONG DESIGN] Liên hệ mới: ${validatedData.subject}`;

      const emailHtml = `
        <div style="font-family: sans-serif; padding: 20px; max-width: 600px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #ec4899;">Thông tin liên hệ mới</h2>
          <hr style="border: 0; border-top: 1px solid #eee; margin-bottom: 20px;" />
          <p><strong>Họ tên:</strong> ${validatedData.name}</p>
          <p><strong>Email:</strong> ${validatedData.email}</p>
          <p><strong>Số điện thoại:</strong> ${validatedData.phone || "Không cung cấp"}</p>
          <p><strong>Chủ đề:</strong> ${validatedData.subject}</p>
          ${productTitle ? `<p><strong>Sản phẩm đăng ký nhận:</strong> <span style="color: #8b5cf6; font-weight: bold;">${productTitle}</span></p>` : ""}
          <p><strong>Nội dung tin nhắn:</strong></p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 6px; border-left: 4px solid #8b5cf6;">
            ${validatedData.message.replace(/\n/g, "<br>")}
          </div>
          <p style="font-size: 11px; color: #999; margin-top: 30px;">Hệ thống tự động gửi từ Website CUONG DESIGN.</p>
        </div>
      `;

      await sendEmail({
        to: adminEmail,
        subject,
        html: emailHtml,
      });
    } catch (emailErr) {
      console.error("Lỗi gửi email báo cáo liên hệ:", emailErr);
    }

    // Try sending Telegram Bot Notification if configured in Settings
    try {
      const telegramToken = await prisma.setting.findUnique({ where: { key: "telegram_bot_token" } });
      const telegramChatId = await prisma.setting.findUnique({ where: { key: "telegram_chat_id" } });

      if (telegramToken?.value && telegramChatId?.value) {
        const text = `
🔔 *[CUONG DESIGN] CÓ LIÊN HỆ MỚI*
👤 *Họ tên:* ${validatedData.name}
✉️ *Email:* ${validatedData.email}
📞 *SĐT:* ${validatedData.phone || "Không cung cấp"}
📌 *Chủ đề:* ${validatedData.subject}
${productTitle ? `🎁 *Yêu cầu Code Free:* ${productTitle}` : ""}
💬 *Nội dung:* 
_${validatedData.message}_
        `;

        const telegramUrl = `https://api.telegram.org/bot${telegramToken.value}/sendMessage`;
        await fetch(telegramUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: telegramChatId.value,
            text,
            parse_mode: "Markdown",
          }),
        });
      }
    } catch (teleErr) {
      console.warn("Lỗi gửi thông báo Telegram:", teleErr);
    }

    return NextResponse.json({ success: true, contact }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Lỗi API contact:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi hệ thống: " + error.message },
      { status: 500 }
    );
  }
}
