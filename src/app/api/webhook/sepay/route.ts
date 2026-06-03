import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/mailer";
import { siteConfig } from "@/data/site";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // SePay Webhook Payload structure
    const {
      id,              // Transaction ID
      gateway,         // Bank (e.g. VCB, MB)
      amount,          // Amount transferred
      content,         // Transaction description / memo
      transferType,    // "in" or "out"
      transferDate,    // Date of transfer
    } = body;

    // Verify token from header for security if set in DB
    const sepayTokenSetting = await prisma.setting.findUnique({
      where: { key: "sepay_webhook_token" },
    });
    
    if (sepayTokenSetting && sepayTokenSetting.value) {
      const authHeader = request.headers.get("Authorization");
      const expectedAuth = `Apikey ${sepayTokenSetting.value}`;
      if (authHeader !== expectedAuth) {
        return NextResponse.json({ error: "Chưa xác thực webhook" }, { status: 401 });
      }
    }

    // Check if it's an incoming transaction (deposit)
    if (transferType !== "in" && transferType !== "IN") {
      return NextResponse.json({ message: "Bỏ qua giao dịch rút tiền" }, { status: 200 });
    }

    // Extract the order code (e.g. CDV1089) from transaction content
    // We search the DB for a pending order whose sepayCode is contained in the transaction description
    const contentUpper = (content || "").toUpperCase();
    
    // Find pending orders
    const pendingOrders = await prisma.order.findMany({
      where: { status: "PENDING" },
      include: { product: true },
    });

    // Find matching order
    const matchedOrder = pendingOrders.find((order) => 
      contentUpper.includes(order.sepayCode.toUpperCase())
    );

    if (!matchedOrder) {
      console.warn(`Không tìm thấy đơn hàng phù hợp cho nội dung: "${content}"`);
      return NextResponse.json({ error: "Không tìm thấy đơn hàng khớp mã" }, { status: 404 });
    }

    // Verify transaction amount
    if (amount < matchedOrder.amount) {
      console.warn(`Đơn hàng ${matchedOrder.id} yêu cầu ${matchedOrder.amount} nhưng chỉ nhận được ${amount}`);
      // Mark order as failed or keep pending and wait for human review
      return NextResponse.json({ error: "Số tiền chuyển khoản không đủ" }, { status: 400 });
    }

    // Order matched and amount verified successfully!
    // Generate secure download token (UUID)
    const downloadToken = crypto.randomUUID();

    // Update order status in DB
    const updatedOrder = await prisma.order.update({
      where: { id: matchedOrder.id },
      data: {
        status: "COMPLETED",
        downloadToken,
      },
    });

    // Send email to customer with secure download link
    try {
      const downloadUrl = `${siteConfig.url}/download/${downloadToken}`;
      
      const emailHtml = `
        <div style="font-family: sans-serif; padding: 20px; max-width: 600px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #ec4899;">Thanh toán thành công!</h2>
          <p>Chào <strong>${matchedOrder.customerName}</strong>,</p>
          <p>Cảm ơn bạn đã mua sản phẩm số từ **CUONG DESIGN**. Giao dịch của bạn đã được xác nhận tự động thành công.</p>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
            <p style="margin: 0 0 10px 0;"><strong>Sản phẩm:</strong> ${matchedOrder.product.title}</p>
            <p style="margin: 0 0 10px 0;"><strong>Số tiền:</strong> ${new Intl.NumberFormat("vi-VN").format(matchedOrder.amount)}vnđ</p>
            <p style="margin: 0 0 10px 0;"><strong>Mã giao dịch SePay:</strong> ${id}</p>
            <p style="margin: 0 0 15px 0;"><strong>Giới hạn tải xuống:</strong> Tối đa ${matchedOrder.product.maxDownloads} lần</p>
            
            <a href="${downloadUrl}" style="display: inline-block; background: linear-gradient(to right, #ec4899, #8b5cf6); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              Tải mã nguồn / Download Source Code
            </a>
          </div>

          <p style="color: #ef4444; font-size: 12px; font-weight: 500;">
            * Lưu ý: Đường dẫn tải xuống này là bảo mật và chỉ hỗ trợ tải tối đa ${matchedOrder.product.maxDownloads} lần. Xin vui lòng không chia sẻ liên kết này.
          </p>

          <hr style="border: 0; border-top: 1px solid #eee; margin-top: 30px; margin-bottom: 20px;" />
          <p style="font-size: 11px; color: #999;">Hệ thống gửi thư tự động từ Website CUONG DESIGN. Hỗ trợ kỹ thuật: ${siteConfig.contact.email}</p>
        </div>
      `;

      await sendEmail({
        to: matchedOrder.customerEmail,
        subject: `[CUONG DESIGN] Link tải mã nguồn: ${matchedOrder.product.title}`,
        html: emailHtml,
      });
    } catch (emailErr) {
      console.error("Lỗi gửi mail tải source code:", emailErr);
    }

    // Try sending Telegram notification to Admin
    try {
      const telegramToken = await prisma.setting.findUnique({ where: { key: "telegram_bot_token" } });
      const telegramChatId = await prisma.setting.findUnique({ where: { key: "telegram_chat_id" } });

      if (telegramToken?.value && telegramChatId?.value) {
        const text = `
✅ *[CUONG DESIGN] ĐƠN HÀNG HOÀN TẤT*
📦 *Sản phẩm:* ${matchedOrder.product.title}
💰 *Doanh thu:* ${new Intl.NumberFormat("vi-VN").format(matchedOrder.amount)}đ
👤 *Khách hàng:* ${matchedOrder.customerName} (${matchedOrder.customerEmail})
🏦 *Ngân hàng:* ${gateway}
🧾 *Mã GD SePay:* ${id}
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
      console.warn("Lỗi gửi tin nhắn Telegram đơn hàng:", teleErr);
    }

    return NextResponse.json({ success: true, orderId: updatedOrder.id }, { status: 200 });
  } catch (error: any) {
    console.error("Lỗi xử lý SePay webhook:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống xử lý thanh toán: " + error.message },
      { status: 500 }
    );
  }
}
