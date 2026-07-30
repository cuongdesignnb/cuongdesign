import Link from "next/link";
import { prisma } from "@/lib/db";
import { getQueueStatus } from "@/lib/ai/settings";
import BlogQueueClient from "./BlogQueueClient";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const [tasks, categories, queueStatus] = await Promise.all([
    prisma.aiTask.findMany({
      orderBy: [{ scheduleTime: "desc" }, { createdAt: "desc" }],
      take: 100,
      include: {
        category: { select: { name: true } },
        generatedPost: { select: { slug: true, status: true } },
      },
    }),
    prisma.category.findMany({
      orderBy: { order: "asc" },
      select: { id: true, name: true },
    }),
    getQueueStatus(),
  ]);

  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">AI Auto Blog</h1>
          <p className="mt-1 text-sm text-gray-500">
            Lập lịch viết bài, sinh ảnh và xuất bản bằng worker phía server.
          </p>
        </div>
        <Link
          href="/admin/blog/posts"
          className="inline-flex items-center gap-2 border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-pink-400 transition-colors hover:bg-white/10 hover:text-pink-300"
        >
          Quản lý bài viết
        </Link>
      </header>

      <BlogQueueClient
        initialTasks={JSON.parse(JSON.stringify(tasks))}
        initialStatus={JSON.parse(JSON.stringify(queueStatus))}
        categories={JSON.parse(JSON.stringify(categories))}
      />
    </div>
  );
}
