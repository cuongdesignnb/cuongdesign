"use server";

import { prisma } from "@/lib/db";
import type { PostStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/auth/require-admin";
import { sanitizeRichHtml } from "@/lib/content/sanitize";
import { revalidatePath } from "next/cache";
import { normalizeSlug } from "@/lib/seo/slug";
import { recordSeoRedirect } from "@/lib/seo/redirects";
import { ensureImageAlt } from "@/lib/ai/html";

function revalidatePost(slug?: string) {
  revalidatePath("/admin/blog/posts");
  revalidatePath("/bai-viet");
  if (slug) revalidatePath(`/bai-viet/${slug}`);
}

export async function createPost(data: {
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  coverImageAlt?: string;
  status?: PostStatus;
  categoryId?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  canonicalPath?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  robotsIndex?: boolean;
  robotsFollow?: boolean;
}) {
  try {
    await requireAdmin();
    const post = await prisma.post.create({
      data: {
        title: data.title,
        slug: normalizeSlug(data.slug),
        excerpt: data.excerpt || null,
        content: ensureImageAlt(
          sanitizeRichHtml(data.content || ""),
          data.title,
        ),
        coverImage: data.coverImage || null,
        coverImageAlt: data.coverImage
          ? data.coverImageAlt?.trim() || data.title
          : null,
        status: data.status || "DRAFT",
        categoryId: data.categoryId || null,
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        seoKeywords: data.seoKeywords
          ? data.seoKeywords.split(",").map((k) => k.trim()).filter(Boolean)
          : [],
        canonicalPath: data.canonicalPath || null,
        ogTitle: data.ogTitle || null,
        ogDescription: data.ogDescription || null,
        ogImage: data.ogImage || null,
        robotsIndex: data.robotsIndex ?? true,
        robotsFollow: data.robotsFollow ?? true,
      },
    });
    revalidatePost(post.slug);
    return { success: true, data: post };
  } catch (error: any) {
    console.error("Error creating post:", error);
    return { success: false, error: error.message };
  }
}

export async function getPosts(filter?: { status?: string }) {
  try {
    await requireAdmin();
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
    coverImageAlt?: string;
    status?: PostStatus;
    categoryId?: string | null;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
    canonicalPath?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    robotsIndex?: boolean;
    robotsFollow?: boolean;
  }
) {
  try {
    await requireAdmin();
    const previous = await prisma.post.findUnique({
      where: { id },
      select: { slug: true, title: true },
    });
    // Build update data, converting seoKeywords string to array
    const updateData: Record<string, unknown> = { ...data };
    if (data.seoKeywords !== undefined) {
      updateData.seoKeywords = data.seoKeywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);
    }
    if (data.content !== undefined) {
      updateData.content = ensureImageAlt(
        sanitizeRichHtml(data.content),
        data.title || previous?.title || "Hình minh họa bài viết",
      );
    }
    if (data.coverImage !== undefined) {
      updateData.coverImage = data.coverImage || null;
      updateData.coverImageAlt = data.coverImage
        ? data.coverImageAlt?.trim() || data.title || previous?.title || "Hình minh họa bài viết"
        : null;
    } else if (data.coverImageAlt !== undefined) {
      updateData.coverImageAlt = data.coverImageAlt.trim() || null;
    }
    if (data.slug !== undefined) updateData.slug = normalizeSlug(data.slug);
    const post = await prisma.post.update({
      where: { id },
      data: updateData,
    });
    if (previous && previous.slug !== post.slug) {
      await recordSeoRedirect(
        `/bai-viet/${previous.slug}`,
        `/bai-viet/${post.slug}`,
        "post-slug-changed",
      );
      revalidatePost(previous.slug);
    }
    revalidatePost(post.slug);
    return { success: true, data: post };
  } catch (error: any) {
    console.error("Error updating post:", error);
    return { success: false, error: error.message };
  }
}

export async function deletePost(id: string) {
  try {
    await requireAdmin();
    const post = await prisma.post.delete({ where: { id } });
    revalidatePost(post.slug);
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting post:", error);
    return { success: false, error: error.message };
  }
}

export async function togglePostStatus(id: string) {
  try {
    await requireAdmin();
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
    revalidatePost(updated.slug);
    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Error toggling post status:", error);
    return { success: false, error: error.message };
  }
}
