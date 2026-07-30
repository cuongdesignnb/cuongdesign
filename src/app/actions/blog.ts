"use server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";
import { revalidatePath } from "next/cache";

export interface AddAiTopicsInput {
  topics: string;
  startAt?: string;
  intervalMinutes: number;
  autoPublish: boolean;
  categoryId?: string;
  tone: "professional" | "casual" | "luxury";
  length: "short" | "medium" | "long";
  withImages: boolean;
  imageCount: number;
  sharedKeywords?: string;
}

function parseVietnamDateTime(value?: string) {
  if (!value) return new Date();
  const explicitZone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(value);
  const normalized = explicitZone
    ? value
    : `${value.length === 16 ? `${value}:00` : value}+07:00`;
  const date = new Date(normalized);
  if (!Number.isFinite(date.getTime())) {
    throw new Error("Thời gian bắt đầu không hợp lệ.");
  }
  return date;
}

function splitList(value: string | undefined) {
  return [...new Set(
    String(value || "")
      .split(/[,\n]/)
      .map((item) => item.trim())
      .filter(Boolean),
  )];
}

export async function addKeywordsToQueue(input: AddAiTopicsInput) {
  try {
    await requireAdmin();
    if (typeof input.topics !== "string") {
      return { success: false, error: "Danh sách chủ đề không hợp lệ." };
    }
    const topics = input.topics
      .split("\n")
      .map((topic) => topic.trim())
      .filter(Boolean);
    if (topics.length === 0) {
      return { success: false, error: "Danh sách chủ đề đang trống." };
    }
    if (topics.length > 100) {
      return { success: false, error: "Mỗi lần chỉ tạo tối đa 100 chủ đề." };
    }

    const intervalMinutes = Math.trunc(input.intervalMinutes);
    if (
      !Number.isInteger(input.intervalMinutes) ||
      intervalMinutes < 1 ||
      intervalMinutes > 10_080
    ) {
      return {
        success: false,
        error: "Khoảng cách giữa các bài phải từ 1 đến 10.080 phút.",
      };
    }
    const imageCount = Math.trunc(input.imageCount);
    if (
      !Number.isInteger(input.imageCount) ||
      imageCount < 0 ||
      imageCount > 10
    ) {
      return { success: false, error: "Số ảnh trong bài phải từ 0 đến 10." };
    }
    if (
      typeof input.autoPublish !== "boolean" ||
      typeof input.withImages !== "boolean"
    ) {
      return { success: false, error: "Chế độ đăng bài hoặc sinh ảnh không hợp lệ." };
    }
    if (!["professional", "casual", "luxury"].includes(input.tone)) {
      return { success: false, error: "Giọng văn không hợp lệ." };
    }
    if (!["short", "medium", "long"].includes(input.length)) {
      return { success: false, error: "Độ dài bài viết không hợp lệ." };
    }
    if (input.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: input.categoryId },
        select: { id: true },
      });
      if (!category) {
        return { success: false, error: "Chuyên mục không tồn tại." };
      }
    }

    const startAt = parseVietnamDateTime(input.startAt);
    const sharedKeywords = splitList(input.sharedKeywords);
    await prisma.aiTask.createMany({
      data: topics.map((keyword, index) => ({
        keyword,
        scheduleTime: new Date(
          startAt.getTime() + index * intervalMinutes * 60_000,
        ),
        status: "PENDING",
        categoryId: input.categoryId || null,
        autoPublish: input.autoPublish,
        tone: input.tone,
        length: input.length,
        withImages: input.withImages,
        imageCount: input.withImages ? imageCount : 0,
        sharedKeywords,
      })),
    });

    revalidatePath("/admin/blog");
    return { success: true, count: topics.length };
  } catch (error: unknown) {
    console.error(
      "AI_QUEUE_CREATE_FAILED",
      error instanceof Error ? error.message : error,
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : "Không thể tạo lịch bài viết.",
    };
  }
}

export async function deleteAiTask(id: string) {
  try {
    await requireAdmin();
    const deleted = await prisma.aiTask.deleteMany({
      where: {
        id,
        status: { in: ["PENDING", "FAILED"] },
        generatedPostId: null,
      },
    });
    if (deleted.count !== 1) {
      return {
        success: false,
        error: "Chỉ có thể xóa tác vụ đang chờ hoặc đã lỗi.",
      };
    }
    revalidatePath("/admin/blog");
    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Không thể xóa tác vụ.",
    };
  }
}

export async function retryAiTask(id: string) {
  try {
    await requireAdmin();
    const updated = await prisma.aiTask.updateMany({
      where: { id, status: "FAILED", generatedPostId: null },
      data: {
        status: "PENDING",
        attempts: 0,
        nextAttemptAt: new Date(),
        completedAt: null,
        lockedAt: null,
        claimToken: null,
        errorMessage: null,
      },
    });
    revalidatePath("/admin/blog");
    return updated.count === 1
      ? { success: true }
      : { success: false, error: "Tác vụ không ở trạng thái lỗi." };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Không thể thử lại tác vụ.",
    };
  }
}

export async function retryAllFailedAiTasks() {
  try {
    await requireAdmin();
    const updated = await prisma.aiTask.updateMany({
      where: { status: "FAILED", generatedPostId: null },
      data: {
        status: "PENDING",
        attempts: 0,
        nextAttemptAt: new Date(),
        completedAt: null,
        lockedAt: null,
        claimToken: null,
        errorMessage: null,
      },
    });
    revalidatePath("/admin/blog");
    return { success: true, count: updated.count };
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Không thể thử lại các tác vụ.",
    };
  }
}
