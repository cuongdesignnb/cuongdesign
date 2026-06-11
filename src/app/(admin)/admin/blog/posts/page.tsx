import React from "react";
import { prisma } from "@/lib/db";
import AdminPostsManager from "./AdminPostsManager";

export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: { select: { id: true, name: true, slug: true, color: true } } },
  });

  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    select: { id: true, name: true, slug: true, color: true },
  });

  const mediaLibrary = await prisma.media.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Quản lý bài viết</h1>
        <p className="text-sm text-gray-500 mt-1">
          Xem, chỉnh sửa và quản lý tất cả bài viết blog đã tạo.
        </p>
      </div>
      <AdminPostsManager
        initialPosts={JSON.parse(JSON.stringify(posts))}
        categories={JSON.parse(JSON.stringify(categories))}
        mediaLibrary={JSON.parse(JSON.stringify(mediaLibrary))}
      />
    </div>
  );
}
