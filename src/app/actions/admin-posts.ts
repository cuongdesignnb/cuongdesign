"use server";

import { prisma } from "@/lib/db";
import type { PostStatus } from "@prisma/client";

export async function createPost(data: {
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  status?: PostStatus;
  categoryId?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}) {
  try {
    const post = await prisma.post.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || null,
        content: data.content || "",
        coverImage: data.coverImage || null,
        status: data.status || "DRAFT",
        categoryId: data.categoryId || null,
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        seoKeywords: data.seoKeywords
          ? data.seoKeywords.split(",").map((k) => k.trim()).filter(Boolean)
          : [],
      },
    });
    return { success: true, data: post };
  } catch (error: any) {
    console.error("Error creating post:", error);
    return { success: false, error: error.message };
  }
}

export async function getPosts(filter?: { status?: string }) {
  try {
    const where = filter?.status ? { status: filter.status as PostStatus } : {};
    const posts = await prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: posts };
  } catch (error: any) {
    console.error("Error fetching posts:", error);
    return { success: false, error: error.message };
  }
}

export async function updatePost(
  id: string,
  data: {
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    coverImage?: string;
    status?: PostStatus;
    categoryId?: string | null;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
  }
) {
  try {
    // Build update data, converting seoKeywords string to array
    const updateData: Record<string, unknown> = { ...data };
    if (data.seoKeywords !== undefined) {
      updateData.seoKeywords = data.seoKeywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);
    }
    const post = await prisma.post.update({
      where: { id },
      data: updateData,
    });
    return { success: true, data: post };
  } catch (error: any) {
    console.error("Error updating post:", error);
    return { success: false, error: error.message };
  }
}

export async function deletePost(id: string) {
  try {
    await prisma.post.delete({ where: { id } });
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting post:", error);
    return { success: false, error: error.message };
  }
}

export async function togglePostStatus(id: string) {
  try {
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return { success: false, error: "Post not found" };
    }
    const newStatus = post.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    const updated = await prisma.post.update({
      where: { id },
      data: {
        status: newStatus,
        publishedAt: newStatus === "PUBLISHED" ? new Date() : null,
      },
    });
    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Error toggling post status:", error);
    return { success: false, error: error.message };
  }
}
