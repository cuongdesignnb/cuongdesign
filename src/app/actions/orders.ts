"use server";

import { prisma } from "@/lib/db";
import { randomBytes } from "crypto";

export async function createOrder(data: {
  productId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
}) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) {
      return { success: false, error: "Sản phẩm không tồn tại." };
    }

    // Generate a unique 6-digit sepayCode e.g., CD928371
    let sepayCode = "";
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      const randomDigits = Math.floor(100000 + Math.random() * 900000);
      sepayCode = `CD${randomDigits}`;
      
      const existing = await prisma.order.findUnique({
        where: { sepayCode },
      });
      
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return { success: false, error: "Lỗi sinh mã thanh toán, vui lòng thử lại." };
    }

    // Generate download token (secure hash)
    const downloadToken = randomBytes(16).toString("hex");

    const amount = product.salePrice !== null ? product.salePrice : product.price;

    const order = await prisma.order.create({
      data: {
        productId: product.id,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone || null,
        amount,
        status: "PENDING",
        sepayCode,
        downloadToken,
      },
    });

    return { success: true, orderId: order.id, sepayCode };
  } catch (error: any) {
    console.error("Lỗi tạo đơn hàng:", error);
    return { success: false, error: error.message };
  }
}

export async function getOrderStatus(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        status: true,
        downloadToken: true,
      },
    });

    if (!order) {
      return { success: false, error: "Đơn hàng không tồn tại." };
    }

    return { success: true, status: order.status, downloadToken: order.downloadToken };
  } catch (error: any) {
    console.error("Lỗi kiểm tra trạng thái đơn hàng:", error);
    return { success: false, error: error.message };
  }
}
