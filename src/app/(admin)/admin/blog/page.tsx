import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { addKeywordsToQueue, deleteAiTask } from "@/app/actions/blog";
import BlogQueueClient from "./BlogQueueClient";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  // Fetch queue from database
  const tasks = await prisma.aiTask.findMany({
    orderBy: { scheduleTime: "asc" },
  });

  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">AI Auto Blog</h1>
        <p className="text-sm text-gray-500 mt-1">
          Lập lịch tự động viết bài chuẩn SEO dựa trên từ khóa bằng GPT-4o và vẽ ảnh bìa bằng DALL-E 3.
        </p>
      </div>

      <Link
        href="/admin/blog/posts"
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-pink-400 hover:bg-white/10 hover:text-pink-300 transition-all font-semibold"
      >
        Quản lý bài viết đã tạo →
      </Link>

      <BlogQueueClient
        initialTasks={JSON.parse(JSON.stringify(tasks))}
        categories={JSON.parse(JSON.stringify(categories))}
      />
    </div>
  );
}

