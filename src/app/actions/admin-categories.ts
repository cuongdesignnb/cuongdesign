"use server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";
import { normalizeSlug } from "@/lib/seo/slug";
import { recordSeoRedirect } from "@/lib/seo/redirects";
import { revalidatePath } from "next/cache";

export async function getCategories() {
  try {
    await requireAdmin();
    const categories = await prisma.category.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: { select: { posts: true } },
      },
    });
    return { success: true, data: categories };
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    return { success: false, error: error.message };
  }
}

export async function upsertCategory(data: {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  coverImage?: string;
  color?: string;
  order?: number;
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
      ? await prisma.category.findUnique({ where: { id: data.id }, select: { slug: true } })
      : null;
    const seoKeywords = Array.isArray(data.seoKeywords)
      ? data.seoKeywords
      : String(data.seoKeywords || "").split(",").map((item) => item.trim()).filter(Boolean);
    const seoData = {
      seoTitle: data.seoTitle || null,
      seoDescription: data.seoDescription || null,
      seoKeywords,
      canonicalPath: data.canonicalPath || null,
      ogTitle: data.ogTitle || null,
      ogDescription: data.ogDescription || null,
      ogImage: data.ogImage || null,
      robotsIndex: data.robotsIndex ?? true,
      robotsFollow: data.robotsFollow ?? true,
    };
    let category;
    if (data.id) {
      category = await prisma.category.update({
        where: { id: data.id },
        data: {
          name: data.name,
          slug,
          description: data.description || null,
          coverImage: data.coverImage || null,
          color: data.color || null,
          order: data.order ?? 0,
          ...seoData,
        },
      });
    } else {
      category = await prisma.category.create({
        data: {
          name: data.name,
          slug,
          description: data.description || null,
          coverImage: data.coverImage || null,
          color: data.color || null,
          order: data.order ?? 0,
          ...seoData,
        },
      });
    }
    if (previous && previous.slug !== category.slug) {
      await recordSeoRedirect(
        `/bai-viet/chuyen-muc/${previous.slug}`,
        `/bai-viet/chuyen-muc/${category.slug}`,
        "category-slug-changed",
      );
    }
    revalidatePath("/bai-viet");
    return { success: true, data: category };
  } catch (error: any) {
    console.error("Error upserting category:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteCategory(id: string) {
  try {
    await requireAdmin();
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { posts: true } } },
    });

    if (!category) {
      return { success: false, error: "Chuyên mục không tồn tại." };
    }

    if (category._count.posts > 0) {
      return {
        success: false,
        error: `Không thể xóa chuyên mục "${category.name}" vì đang có ${category._count.posts} bài viết. Hãy chuyển bài viết sang chuyên mục khác trước.`,
      };
    }

    await prisma.category.delete({ where: { id } });
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting category:", error);
    return { success: false, error: error.message };
  }
}

export async function seedDefaultCategories() {
  try {
    await requireAdmin();
    const defaults = [
      { name: "Thiết kế UI/UX", slug: "thiet-ke-ui-ux", color: "#ec4899", order: 0 },
      { name: "Lập trình Web", slug: "lap-trinh-web", color: "#8b5cf6", order: 1 },
      { name: "Next.js & React", slug: "nextjs-react", color: "#3b82f6", order: 2 },
      { name: "SEO & Marketing", slug: "seo-marketing", color: "#10b981", order: 3 },
      { name: "Công nghệ", slug: "cong-nghe", color: "#f59e0b", order: 4 },
      { name: "Chia sẻ kinh nghiệm", slug: "chia-se-kinh-nghiem", color: "#6366f1", order: 5 },
    ];

    const results = await Promise.all(
      defaults.map((cat) =>
        prisma.category.upsert({
          where: { slug: cat.slug },
          update: { name: cat.name, color: cat.color, order: cat.order },
          create: { name: cat.name, slug: cat.slug, color: cat.color, order: cat.order },
        })
      )
    );

    return { success: true, count: results.length };
  } catch (error: any) {
    console.error("Error seeding default categories:", error);
    return { success: false, error: error.message };
  }
}
