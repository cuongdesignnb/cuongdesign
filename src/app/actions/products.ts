"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { sanitizeRichHtml } from "@/lib/content/sanitize";
import { normalizeSlug } from "@/lib/seo/slug";
import { recordSeoRedirect } from "@/lib/seo/redirects";
import type { ProductAvailability, ProductPricingMode } from "@prisma/client";

export async function upsertProduct(data: {
  id?: string;
  title: string;
  slug: string;
  description: string;
  content?: string;
  price: number;
  salePrice?: number;
  type: "SOURCE_CODE" | "TEMPLATE" | "UI_KIT" | "SERVICE";
  features: string[];
  techStack: string[];
  coverImage: string;
  images: string[];
  demoUrl?: string;
  downloadUrl?: string;
  maxDownloads?: number;
  currency?: string;
  pricingMode?: ProductPricingMode;
  availability?: ProductAvailability;
  priceValidUntil?: string;
  sku?: string;
  brandName?: string;
  softwareCategory?: string;
  operatingSystem?: string;
  softwareVersion?: string;
  licenseName?: string;
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
      ? await prisma.product.findUnique({
          where: { id: data.id },
          select: { slug: true, publishedAt: true },
        })
      : null;
    const keywords = Array.isArray(data.seoKeywords)
      ? data.seoKeywords
      : String(data.seoKeywords || "").split(",").map((item) => item.trim()).filter(Boolean);
    const pricingMode = data.pricingMode || (data.price === 0 ? "FREE" : "FIXED");
    const seoData = {
      content: data.content ? sanitizeRichHtml(data.content) : null,
      currency: data.currency || "VND",
      pricingMode,
      availability: data.availability || "IN_STOCK" as ProductAvailability,
      priceValidUntil: data.priceValidUntil ? new Date(data.priceValidUntil) : null,
      sku: data.sku || null,
      brandName: data.brandName || "Cường Design",
      softwareCategory: data.softwareCategory || null,
      operatingSystem: data.operatingSystem || null,
      softwareVersion: data.softwareVersion || null,
      licenseName: data.licenseName || null,
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
    const product = await prisma.product.upsert({
      where: { id: data.id || "new-product" },
      update: {
        title: data.title,
        slug,
        description: data.description,
        price: data.price,
        salePrice: data.salePrice !== undefined ? data.salePrice : null,
        type: data.type,
        features: data.features,
        techStack: data.techStack,
        coverImage: data.coverImage,
        images: data.images,
        demoUrl: data.demoUrl || null,
        downloadUrl: data.downloadUrl || null,
        maxDownloads: data.maxDownloads !== undefined ? data.maxDownloads : 5,
        isFeatured: data.isFeatured,
        order: data.order || 0,
        ...seoData,
        publishedAt: seoData.isPublished ? previous?.publishedAt || new Date() : null,
      },
      create: {
        title: data.title,
        slug,
        description: data.description,
        price: data.price,
        salePrice: data.salePrice !== undefined ? data.salePrice : null,
        type: data.type,
        features: data.features,
        techStack: data.techStack,
        coverImage: data.coverImage,
        images: data.images,
        demoUrl: data.demoUrl || null,
        downloadUrl: data.downloadUrl || null,
        maxDownloads: data.maxDownloads !== undefined ? data.maxDownloads : 5,
        isFeatured: data.isFeatured,
        order: data.order || 0,
        ...seoData,
        publishedAt: seoData.isPublished ? new Date() : null,
      },
    });

    if (previous && previous.slug !== product.slug) {
      await recordSeoRedirect(
        `/san-pham/${previous.slug}`,
        `/san-pham/${product.slug}`,
        "product-slug-changed",
      );
      revalidatePath(`/san-pham/${previous.slug}`);
    }
    revalidatePath("/");
    revalidatePath("/san-pham");
    revalidatePath(`/san-pham/${product.slug}`);
    revalidatePath("/admin/products");
    return { success: true, product };
  } catch (error: any) {
    console.error("Lỗi lưu sản phẩm:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteProduct(id: string) {
  try {
    await requireAdmin();
    await prisma.product.delete({
      where: { id },
    });
    
    revalidatePath("/");
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error: any) {
    console.error("Lỗi xóa sản phẩm:", error);
    return { success: false, error: error.message };
  }
}
