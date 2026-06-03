"use server";

import { prisma } from "@/lib/db";

export async function getReviews() {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        product: { select: { title: true } },
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: reviews };
  } catch (error: any) {
    console.error("Error fetching reviews:", error);
    return { success: false, error: error.message };
  }
}

export async function approveReview(id: string) {
  try {
    const review = await prisma.review.update({
      where: { id },
      data: { isApproved: true },
    });
    return { success: true, data: review };
  } catch (error: any) {
    console.error("Error approving review:", error);
    return { success: false, error: error.message };
  }
}

export async function rejectReview(id: string) {
  try {
    const review = await prisma.review.update({
      where: { id },
      data: { isApproved: false },
    });
    return { success: true, data: review };
  } catch (error: any) {
    console.error("Error rejecting review:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteReview(id: string) {
  try {
    await prisma.review.delete({ where: { id } });
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting review:", error);
    return { success: false, error: error.message };
  }
}
