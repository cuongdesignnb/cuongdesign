"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function upsertPage(data: {
  id?: string;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  seoTitle?: string;
  seoDescription?: string;
}) {
  try {
    const page = await prisma.page.upsert({
      where: { id: data.id || "new-page" },
      update: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        isPublished: data.isPublished,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
      },
      create: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        isPublished: data.isPublished,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
      },
    });

    revalidatePath("/admin/pages");
    revalidatePath(`/${page.slug}`);
    return { success: true, page };
  } catch (error: any) {
    console.error("Lỗi lưu trang chính sách:", error);
    return { success: false, error: error.message };
  }
}

export async function deletePage(id: string) {
  try {
    const page = await prisma.page.delete({
      where: { id },
    });
    
    revalidatePath("/admin/pages");
    revalidatePath(`/${page.slug}`);
    return { success: true };
  } catch (error: any) {
    console.error("Lỗi xóa trang chính sách:", error);
    return { success: false, error: error.message };
  }
}
