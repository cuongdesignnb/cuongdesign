"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { sanitizeRichHtml } from "@/lib/content/sanitize";
import { normalizeSlug } from "@/lib/seo/slug";
import { recordSeoRedirect } from "@/lib/seo/redirects";
import type { ProjectSchemaKind } from "@prisma/client";

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
  projectType?: ProjectSchemaKind;
  clientName?: string;
  clientIndustry?: string;
  projectRole?: string;
  completedAt?: string;
  projectResult?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[] | string;
  canonicalPath?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  robotsIndex?: boolean;
  robotsFollow?: boolean;
  isPublished?: boolean;
  isFeatured: boolean;
  order?: number;
}) {
  try {
    await requireAdmin();
    const slug = normalizeSlug(data.slug);
    if (!slug) throw new Error("Slug không hợp lệ.");
    const previous = data.id
      ? await prisma.project.findUnique({
          where: { id: data.id },
          select: { slug: true, publishedAt: true },
        })
      : null;
    const keywords = Array.isArray(data.seoKeywords)
      ? data.seoKeywords
      : String(data.seoKeywords || "").split(",").map((item) => item.trim()).filter(Boolean);
    const seoData = {
      projectType: data.projectType || "CREATIVE_WORK" as ProjectSchemaKind,
      clientName: data.clientName || null,
      clientIndustry: data.clientIndustry || null,
      projectRole: data.projectRole || null,
      completedAt: data.completedAt ? new Date(data.completedAt) : null,
      projectResult: data.projectResult ? sanitizeRichHtml(data.projectResult) : null,
      seoTitle: data.seoTitle || null,
      seoDescription: data.seoDescription || null,
      seoKeywords: keywords,
      canonicalPath: data.canonicalPath || null,
      ogTitle: data.ogTitle || null,
      ogDescription: data.ogDescription || null,
      ogImage: data.ogImage || null,
      robotsIndex: data.robotsIndex ?? true,
      robotsFollow: data.robotsFollow ?? true,
      isPublished: data.isPublished ?? false,
    };
    const project = await prisma.project.upsert({
      where: { id: data.id || "new-project" },
      update: {
        title: data.title,
        slug,
        description: data.description,
        content: sanitizeRichHtml(data.content),
        coverImage: data.coverImage,
        images: data.images,
        category: data.category,
        demoUrl: data.demoUrl || null,
        githubUrl: data.githubUrl || null,
        techStack: data.techStack,
        isFeatured: data.isFeatured,
        order: data.order || 0,
        ...seoData,
        publishedAt: seoData.isPublished ? previous?.publishedAt || new Date() : null,
      },
      create: {
        title: data.title,
        slug,
        description: data.description,
        content: sanitizeRichHtml(data.content),
        coverImage: data.coverImage,
        images: data.images,
        category: data.category,
        demoUrl: data.demoUrl || null,
        githubUrl: data.githubUrl || null,
        techStack: data.techStack,
        isFeatured: data.isFeatured,
        order: data.order || 0,
        ...seoData,
        publishedAt: seoData.isPublished ? new Date() : null,
      },
    });

    if (previous && previous.slug !== project.slug) {
      await recordSeoRedirect(
        `/du-an/${previous.slug}`,
        `/du-an/${project.slug}`,
        "project-slug-changed",
      );
      revalidatePath(`/du-an/${previous.slug}`);
    }
    revalidatePath("/");
    revalidatePath("/du-an");
    revalidatePath(`/du-an/${project.slug}`);
    revalidatePath("/admin/projects");
    return { success: true, project };
  } catch (error: any) {
    console.error("Lỗi lưu dự án:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteProject(id: string) {
  try {
    await requireAdmin();
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
