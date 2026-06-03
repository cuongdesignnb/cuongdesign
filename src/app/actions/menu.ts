"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export interface MenuItemInput {
  id?: string;
  label: string;
  href: string | null;
  order: number;
  parentId: string | null;
}

// 1. Fetch menu tree
export async function getMenuItems() {
  try {
    const items = await prisma.menuItem.findMany({
      orderBy: [
        { parentId: "asc" },
        { order: "asc" }
      ],
      include: {
        children: {
          orderBy: { order: "asc" }
        }
      }
    });

    // Return root nodes (those without parentId)
    return {
      success: true,
      items: items.filter(item => !item.parentId)
    };
  } catch (error: any) {
    console.error("Lỗi lấy danh mục menu:", error);
    return { success: false, error: error.message };
  }
}

// 2. Save entire menu tree (overwrites or updates hierarchy in transactional way)
export async function saveMenuItems(menuTree: MenuItemInput[]) {
  try {
    // Check auth
    const session = await auth();
    if (!session || (session.user as any).role !== "ADMIN") {
      return { success: false, error: "Bạn không có quyền thực hiện hành động này." };
    }

    // Run transaction
    await prisma.$transaction(async (tx) => {
      // 1. Delete all existing items to perform clean write of tree
      await tx.menuItem.deleteMany();

      // Helper map to trace client temporary ids to database actual ids
      const idMap = new Map<string, string>();

      // 2. Insert root level items first
      const roots = menuTree.filter(i => !i.parentId);
      for (const root of roots) {
        const tempId = root.id || "";
        const created = await tx.menuItem.create({
          data: {
            label: root.label,
            href: root.href || null,
            order: root.order,
          }
        });
        idMap.set(tempId, created.id);
      }

      // 3. Insert child items mapping to new parent ids
      const children = menuTree.filter(i => i.parentId);
      for (const child of children) {
        const newParentId = idMap.get(child.parentId || "") || null;
        if (newParentId) {
          await tx.menuItem.create({
            data: {
              label: child.label,
              href: child.href || null,
              order: child.order,
              parentId: newParentId
            }
          });
        }
      }
    });

    revalidatePath("/");
    revalidatePath("/gioi-thieu");
    revalidatePath("/du-an");
    revalidatePath("/san-pham");
    revalidatePath("/dich-vu");
    revalidatePath("/quy-trinh");
    revalidatePath("/ky-nang");
    revalidatePath("/danh-gia");
    revalidatePath("/lien-he");
    revalidatePath("/bai-viet");

    return { success: true, message: "Đồng bộ cấu hình Menu thành công!" };
  } catch (error: any) {
    console.error("Lỗi đồng bộ menu:", error);
    return { success: false, error: error.message };
  }
}

// 3. Fetch auto-suggest routing paths
export async function getRouteSuggestions() {
  try {
    // 1. Common static paths
    const suggestions = [
      { label: "Trang chủ (/) ", value: "/" },
      { label: "Giới thiệu (/gioi-thieu)", value: "/gioi-thieu" },
      { label: "Dịch vụ (/dich-vu)", value: "/dich-vu" },
      { label: "Dự án (/du-an)", value: "/du-an" },
      { label: "Quy trình (/quy-trinh)", value: "/quy-trinh" },
      { label: "Kỹ năng (/ky-nang)", value: "/ky-nang" },
      { label: "Sản phẩm (/san-pham)", value: "/san-pham" },
      { label: "Đánh giá (/danh-gia)", value: "/danh-gia" },
      { label: "Liên hệ & FAQ (/lien-he)", value: "/lien-he" },
      { label: "Bài viết & Blog (/bai-viet)", value: "/bai-viet" }
    ];

    // 2. Fetch projects slugs
    const projects = await prisma.project.findMany({
      select: { title: true, slug: true }
    });
    projects.forEach(p => {
      suggestions.push({
        label: `Dự án: ${p.title} (/du-an/${p.slug})`,
        value: `/du-an/${p.slug}`
      });
    });

    // 3. Fetch products slugs
    const products = await prisma.product.findMany({
      select: { title: true, slug: true }
    });
    products.forEach(p => {
      suggestions.push({
        label: `Sản phẩm: ${p.title} (/san-pham/${p.slug})`,
        value: `/san-pham/${p.slug}`
      });
    });

    // 4. Fetch blog posts slugs (with category for new URL pattern)
    const posts = await prisma.post.findMany({
      where: { status: "PUBLISHED" },
      select: { title: true, slug: true, category: { select: { slug: true } } }
    });
    posts.forEach(post => {
      const catSlug = post.category?.slug || "chua-phan-loai";
      suggestions.push({
        label: `Bài viết: ${post.title} (/bai-viet/${catSlug}/${post.slug})`,
        value: `/bai-viet/${catSlug}/${post.slug}`
      });
    });

    // 5. Fetch blog category slugs
    const blogCategories = await prisma.category.findMany({
      select: { name: true, slug: true }
    });
    blogCategories.forEach(cat => {
      suggestions.push({
        label: `Chuyên mục: ${cat.name} (/bai-viet/${cat.slug})`,
        value: `/bai-viet/${cat.slug}`
      });
    });

    return { success: true, suggestions };
  } catch (error: any) {
    console.error("Lỗi lấy gợi ý đường dẫn:", error);
    return { success: false, error: error.message };
  }
}
