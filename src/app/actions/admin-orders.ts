"use server";

import { prisma } from "@/lib/db";

export async function getOrders(filter?: {
  status?: string;
  search?: string;
}) {
  try {
    const where: any = {};

    if (filter?.status && ["PENDING", "COMPLETED", "FAILED"].includes(filter.status)) {
      where.status = filter.status;
    }

    if (filter?.search) {
      where.OR = [
        { customerName: { contains: filter.search, mode: "insensitive" } },
        { customerEmail: { contains: filter.search, mode: "insensitive" } },
        { sepayCode: { contains: filter.search, mode: "insensitive" } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        product: {
          select: { title: true, coverImage: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: orders };
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    return { success: false, error: error.message };
  }
}

export async function updateOrderStatus(
  id: string,
  status: "PENDING" | "COMPLETED" | "FAILED"
) {
  try {
    const order = await prisma.order.update({
      where: { id },
      data: { status },
    });
    return { success: true, data: order };
  } catch (error: any) {
    console.error("Error updating order status:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteOrder(id: string) {
  try {
    await prisma.order.delete({
      where: { id },
    });
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting order:", error);
    return { success: false, error: error.message };
  }
}
