import React from "react";
import { prisma } from "@/lib/db";
import { addKeywordsToQueue, deleteAiTask } from "@/app/actions/blog";
import BlogQueueClient from "./BlogQueueClient";

export default async function AdminBlogPage() {
  // Fetch queue from database
  const tasks = await prisma.aiTask.findMany({
    orderBy: { scheduleTime: "asc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">AI Auto Blog</h1>
        <p className="text-sm text-gray-500 mt-1">
          Lập lịch tự động viết bài chuẩn SEO dựa trên từ khóa bằng GPT-4o và vẽ ảnh bìa bằng DALL-E 3.
        </p>
      </div>

      <BlogQueueClient initialTasks={JSON.parse(JSON.stringify(tasks))} />
    </div>
  );
}
