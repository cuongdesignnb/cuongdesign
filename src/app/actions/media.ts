"use server";

import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";
import { getMediaUsage } from "@/lib/media/usage";
import { revalidatePath } from "next/cache";

export async function updateMediaMetadata(input: {
  id: string;
  name?: string;
  alt?: string;
  caption?: string;
}) {
  try {
    await requireAdmin();
    const media = await prisma.media.update({
      where: { id: input.id },
      data: {
        name: input.name?.trim(),
        alt: input.alt?.trim() || null,
        caption: input.caption?.trim() || null,
      },
    });
    revalidatePath("/admin/media");
    return { success: true, data: media };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Không thể cập nhật hình ảnh.",
    };
  }
}

export async function archiveMedia(id: string) {
  try {
    await requireAdmin();
    const media = await prisma.media.findFirst({ where: { id, deletedAt: null } });
    if (!media) return { success: false, error: "Không tìm thấy hình ảnh." };

    const usage = await getMediaUsage(media.id, media.url);
    if (usage.count > 0) {
      return { success: false, error: "Hình ảnh đang được sử dụng.", usage };
    }

    await prisma.media.update({ where: { id }, data: { deletedAt: new Date() } });
    revalidatePath("/admin/media");
    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Không thể lưu trữ hình ảnh.",
    };
  }
}
