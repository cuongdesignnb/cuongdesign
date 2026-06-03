"use server";

import { prisma } from "@/lib/db";

export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { orders: true, reviews: true } },
      },
    });
    return { success: true, data: users };
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return { success: false, error: error.message };
  }
}

export async function updateUserRole(
  id: string,
  role: "ADMIN" | "CUSTOMER",
  currentUserId: string
) {
  try {
    if (id === currentUserId) {
      return { success: false, error: "Không thể thay đổi vai trò của chính bạn" };
    }
    const updated = await prisma.user.update({
      where: { id },
      data: { role },
    });
    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Error updating user role:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteUser(id: string, currentUserId: string) {
  try {
    if (id === currentUserId) {
      return { success: false, error: "Không thể xóa tài khoản của chính bạn" };
    }
    await prisma.user.delete({ where: { id } });
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return { success: false, error: error.message };
  }
}
