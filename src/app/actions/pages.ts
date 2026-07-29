"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { sanitizeRichHtml } from "@/lib/content/sanitize";
import { normalizeSlug } from "@/lib/seo/slug";
import { recordSeoRedirect } from "@/lib/seo/redirects";

export async function upsertPage(data: {
  id?: string;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[] | string;
  canonicalPath?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  robotsIndex?: boolean;
  robotsFollow?: boolean;
}) {
  try {
    await requireAdmin();
    const slug = normalizeSlug(data.slug);
    const previous = data.id
      ? await prisma.page.findUnique({ where: { id: data.id }, select: { slug: true } })
      : null;
    const seoKeywords = Array.isArray(data.seoKeywords)
      ? data.seoKeywords
      : String(data.seoKeywords || "").split(",").map((item) => item.trim()).filter(Boolean);
    const seoData = {
      seoKeywords,
      canonicalPath: data.canonicalPath || null,
      ogTitle: data.ogTitle || null,
      ogDescription: data.ogDescription || null,
      ogImage: data.ogImage || null,
      robotsIndex: data.robotsIndex ?? true,
      robotsFollow: data.robotsFollow ?? true,
    };
    const page = await prisma.page.upsert({
      where: { id: data.id || "new-page" },
      update: {
        title: data.title,
        slug,
        content: sanitizeRichHtml(data.content),
        isPublished: data.isPublished,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        ...seoData,
      },
      create: {
        title: data.title,
        slug,
        content: sanitizeRichHtml(data.content),
        isPublished: data.isPublished,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        ...seoData,
      },
    });

    if (previous && previous.slug !== page.slug) {
      await recordSeoRedirect(
        `/${previous.slug}`,
        `/${page.slug}`,
        "page-slug-changed",
      );
      revalidatePath(`/${previous.slug}`);
    }
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
    await requireAdmin();
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
