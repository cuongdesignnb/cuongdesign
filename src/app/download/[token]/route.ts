import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { promises as fs } from "fs";
import path from "path";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const resolvedParams = await params;
    const token = resolvedParams.token;

    if (!token) {
      return new Response("Thiếu Token tải xuống", { status: 400 });
    }

    // Query order from DB
    const order = await prisma.order.findUnique({
      where: { downloadToken: token },
      include: { product: true },
    });

    if (!order) {
      return new Response("Token tải xuống không hợp lệ hoặc đã hết hạn", { status: 404 });
    }

    if (order.status !== "COMPLETED") {
      return new Response("Đơn hàng chưa hoàn tất thanh toán", { status: 403 });
    }

    const { product } = order;

    if (!product || !product.downloadUrl) {
      return new Response("Sản phẩm không có file đính kèm", { status: 404 });
    }

    // Check download limits
    if (order.downloadCount >= product.maxDownloads) {
      return new Response(
        `Đã vượt quá giới hạn lượt tải tối đa (${product.maxDownloads} lần). Vui lòng liên hệ hỗ trợ.`,
        { status: 403 }
      );
    }

    // Resolve file path. To ensure security, products are stored inside "private/products" folder at root
    const filePath = path.join(process.cwd(), "private", "products", product.downloadUrl);

    try {
      // Check if file exists
      await fs.access(filePath);
    } catch (err) {
      console.error(`Không tìm thấy file source code trên đĩa tại: ${filePath}`);
      return new Response("File mã nguồn đang được cập nhật, vui lòng thử lại sau.", { status: 404 });
    }

    // Read file buffer
    const fileBuffer = await fs.readFile(filePath);

    // Increment download count in DB
    await prisma.order.update({
      where: { id: order.id },
      data: {
        downloadCount: {
          increment: 1,
        },
      },
    });

    // Stream download response
    const filename = `${product.slug}.zip`;
    const responseHeaders = new Headers();
    responseHeaders.set("Content-Disposition", `attachment; filename="${filename}"`);
    responseHeaders.set("Content-Type", "application/zip");
    responseHeaders.set("Content-Length", String(fileBuffer.length));

    return new Response(fileBuffer, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error("Lỗi download handler:", error);
    return new Response("Lỗi hệ thống khi tải file: " + error.message, { status: 500 });
  }
}
