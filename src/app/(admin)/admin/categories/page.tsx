import React from "react";
import { prisma } from "@/lib/db";
import AdminCategoriesManager from "./AdminCategoriesManager";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: { select: { posts: true } },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Chuyên mục Blog</h1>
        <p className="text-sm text-gray-500 mt-1">
          Quản lý các chuyên mục phân loại bài viết blog.
        </p>
      </div>
      <AdminCategoriesManager initialCategories={JSON.parse(JSON.stringify(categories))} />
    </div>
  );
}
