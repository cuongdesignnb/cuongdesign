"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createTestimonial(data: {
  name: string;
  role: string;
  company?: string;
  rating: number;
  quote: string;
}) {
  try {
    if (!data.name || !data.name.trim()) {
      return { success: false, error: "Họ và tên không được trống." };
    }
    if (!data.role || !data.role.trim()) {
      return { success: false, error: "Vai trò/Chức vụ không được trống." };
    }
    if (!data.quote || !data.quote.trim()) {
      return { success: false, error: "Nội dung nhận xét không được trống." };
    }

    const ratingValue = Math.min(5, Math.max(1, Math.round(data.rating)));

    // Create a new testimonial waiting for admin moderation (isPublished = false)
    await prisma.testimonial.create({
      data: {
        name: data.name.trim(),
        role: data.role.trim(),
        company: data.company?.trim() || null,
        avatar: data.name.trim().charAt(0).toUpperCase(),
        rating: ratingValue,
        quote: data.quote.trim(),
        isPublished: false, // Default to false for submission to prevent spam
        order: 0,
      },
    });

    revalidatePath("/danh-gia");
    revalidatePath("/");

    return {
      success: true,
      message: "Đánh giá của bạn đã được gửi thành công và đang chờ quản trị viên phê duyệt.",
    };
  } catch (error: any) {
    console.error("Lỗi gửi testimonial:", error);
    return { success: false, error: error.message || "Đã xảy ra lỗi hệ thống." };
  }
}
