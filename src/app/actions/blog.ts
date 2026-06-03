"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function addKeywordsToQueue(
  keywordsText: string,
  scheduleStart: string,
  gapHours: number
) {
  try {
    const keywords = keywordsText
      .split("\n")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    if (keywords.length === 0) {
      return { success: false, error: "Danh sách từ khóa trống." };
    }

    const startDate = new Date(scheduleStart || Date.now());
    const gapMs = gapHours * 60 * 60 * 1000;

    const promises = keywords.map((keyword, idx) => {
      const scheduleTime = new Date(startDate.getTime() + idx * gapMs);
      return prisma.aiTask.create({
        data: {
          keyword,
          scheduleTime,
          status: "PENDING",
        },
      });
    });

    await Promise.all(promises);

    revalidatePath("/admin/blog");
    return { success: true, count: keywords.length };
  } catch (error: any) {
    console.error("Lỗi thêm từ khóa vào hàng đợi:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteAiTask(id: string) {
  try {
    await prisma.aiTask.delete({
      where: { id },
    });
    revalidatePath("/admin/blog");
    return { success: true };
  } catch (error: any) {
    console.error("Lỗi xóa AI task:", error);
    return { success: false, error: error.message };
  }
}
