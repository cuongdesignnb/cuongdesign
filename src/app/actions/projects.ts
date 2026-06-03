"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function upsertProject(data: {
  id?: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  coverImage: string;
  images: string[];
  category: string;
  demoUrl?: string;
  githubUrl?: string;
  techStack: string[];
  isFeatured: boolean;
  order?: number;
}) {
  try {
    const project = await prisma.project.upsert({
      where: { id: data.id || "new-project" },
      update: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        content: data.content,
        coverImage: data.coverImage,
        images: data.images,
        category: data.category,
        demoUrl: data.demoUrl || null,
        githubUrl: data.githubUrl || null,
        techStack: data.techStack,
        isFeatured: data.isFeatured,
        order: data.order || 0,
      },
      create: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        content: data.content,
        coverImage: data.coverImage,
        images: data.images,
        category: data.category,
        demoUrl: data.demoUrl || null,
        githubUrl: data.githubUrl || null,
        techStack: data.techStack,
        isFeatured: data.isFeatured,
        order: data.order || 0,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/projects");
    return { success: true, project };
  } catch (error: any) {
    console.error("Lỗi lưu dự án:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteProject(id: string) {
  try {
    await prisma.project.delete({
      where: { id },
    });
    
    revalidatePath("/");
    revalidatePath("/admin/projects");
    return { success: true };
  } catch (error: any) {
    console.error("Lỗi xóa dự án:", error);
    return { success: false, error: error.message };
  }
}
