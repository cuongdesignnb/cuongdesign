"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function upsertProduct(data: {
  id?: string;
  title: string;
  slug: string;
  description: string;
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
  isFeatured: boolean;
  order?: number;
}) {
  try {
    const product = await prisma.product.upsert({
      where: { id: data.id || "new-product" },
      update: {
        title: data.title,
        slug: data.slug,
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
      },
      create: {
        title: data.title,
        slug: data.slug,
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
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/products");
    return { success: true, product };
  } catch (error: any) {
    console.error("Lỗi lưu sản phẩm:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteProduct(id: string) {
  try {
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
