"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function createProductReview(data: {
  productId: string;
  rating: number;
  comment: string;
}) {
  try {
    // 1. Authenticate user session
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return { success: false, error: "Bạn cần đăng nhập để gửi đánh giá sản phẩm." };
    }

    // 2. Find user in database
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!dbUser) {
      return { success: false, error: "Tài khoản không tồn tại trên hệ thống." };
    }

    // Validate rating
    const ratingValue = Math.min(5, Math.max(1, Math.round(data.rating)));

    if (!data.comment || !data.comment.trim()) {
      return { success: false, error: "Nội dung nhận xét không được trống." };
    }

    // 3. Check if user already reviewed this product to avoid spamming
    const existingReview = await prisma.review.findFirst({
      where: {
        productId: data.productId,
        userId: dbUser.id,
      },
    });

    if (existingReview) {
      return { success: false, error: "Bạn đã gửi đánh giá cho sản phẩm này rồi." };
    }

    // 4. Create review (default pending moderation isApproved = false)
    const review = await prisma.review.create({
      data: {
        productId: data.productId,
        userId: dbUser.id,
        rating: ratingValue,
        comment: data.comment.trim(),
        isApproved: false, // Requires admin moderation
      },
    });

    const product = await prisma.product.findUnique({
      where: { id: data.productId },
      select: { slug: true },
    });

    if (product) {
      revalidatePath(`/san-pham/${product.slug}`);
    }

    return { 
      success: true, 
      message: "Đánh giá của bạn đã được gửi thành công và đang chờ quản trị viên phê duyệt." 
    };
  } catch (error: any) {
    console.error("Lỗi gửi đánh giá:", error);
    return { success: false, error: error.message };
  }
}
