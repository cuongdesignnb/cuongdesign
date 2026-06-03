"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { addKeywordsToQueue, deleteAiTask } from "@/app/actions/blog";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import {
  Sparkles,
  Trash2,
  Play,
  Loader2,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  FileText,
  Plus,
} from "lucide-react";

interface Task {
  id: string;
  keyword: string;
  status: "PENDING" | "GENERATING_TEXT" | "GENERATING_IMAGE" | "COMPLETED" | "FAILED";
  scheduleTime: string;
  generatedPostId: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

interface BlogQueueClientProps {
  initialTasks: Task[];
  categories: { id: string; name: string }[];
}

export default function BlogQueueClient({ initialTasks, categories }: BlogQueueClientProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [keywords, setKeywords] = useState("");
  const [scheduleStart, setScheduleStart] = useState(() => {
    const d = new Date();
    // Round to nearest hour
    d.setMinutes(0, 0, 0);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  });
  const [gapHours, setGapHours] = useState(24);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runningTaskId, setRunningTaskId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keywords.trim()) return;
    if (!selectedCategoryId) {
      alert("Vui lòng chọn chuyên mục cho bài viết.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await addKeywordsToQueue(keywords, scheduleStart, gapHours, selectedCategoryId);
      if (res.success) {
        setKeywords("");
        router.refresh();
      } else {
        alert("Lỗi: " + res.error);
      }
    } catch (err: any) {
      alert("Đã xảy ra lỗi: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa từ khóa này khỏi hàng đợi?")) return;

    try {
      const res = await deleteAiTask(id);
      if (res.success) {
        router.refresh();
      } else {
        alert("Lỗi: " + res.error);
      }
    } catch (err: any) {
      alert("Đã xảy ra lỗi: " + err.message);
    }
  };

  const handleRunTask = async (id: string) => {
    setRunningTaskId(id);
    try {
      const res = await fetch(`/api/admin/blog/generate?taskId=${id}`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Bài viết đã được sinh thành công!");
        router.refresh();
      } else {
        alert("Lỗi sinh bài viết: " + (data.error || "Không rõ nguyên nhân"));
        router.refresh();
      }
    } catch (err: any) {
      alert("Lỗi kết nối: " + err.message);
    } finally {
      setRunningTaskId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Add keywords card */}
      <div className="lg:col-span-1">
        <GlassCard className="p-6 border-white/5 bg-[#0a0822]/60 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-pink-500" />
            <span>Thêm từ khóa mới</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Từ khóa (mỗi dòng một từ khóa)
              </label>
              <textarea
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="Ví dụ:&#10;thiết kế website wordpress&#10;học lập trình reactjs cơ bản&#10;dịch vụ ui ux chuyên nghiệp"
                rows={6}
                required
                className="w-full text-sm bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-pink-500/50 resize-y"
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Thời gian bắt đầu viết bài đầu tiên
                </label>
                <input
                  type="datetime-local"
                  value={scheduleStart}
                  onChange={(e) => setScheduleStart(e.target.value)}
                  required
                  className="w-full text-sm bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Khoảng cách giữa các bài (Giờ)
                </label>
                <input
                  type="number"
                  min={1}
                  value={gapHours}
                  onChange={(e) => setGapHours(parseInt(e.target.value) || 24)}
                  required
                  className="w-full text-sm bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Chuyên mục *
              </label>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                required
                className="w-full text-sm bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500/50 cursor-pointer"
              >
                <option value="" className="bg-[#0a0822]">-- Chọn chuyên mục --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-[#0a0822]">
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-pink-600 hover:bg-pink-500 text-white font-semibold py-3 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Thêm vào hàng đợi</span>
                </>
              )}
            </Button>
          </form>
        </GlassCard>
      </div>

      {/* Task Queue card */}
      <div className="lg:col-span-2">
        <GlassCard className="p-6 border-white/5 bg-[#0a0822]/60 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              <span>Hàng đợi lập lịch AI ({initialTasks.length})</span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-gray-500">
                  <th className="py-3 px-2">Từ khóa</th>
                  <th className="py-3 px-2">Thời gian viết</th>
                  <th className="py-3 px-2">Trạng thái</th>
                  <th className="py-3 px-2 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {initialTasks.length > 0 ? (
                  initialTasks.map((task) => {
                    const isTaskRunning = runningTaskId === task.id;
                    return (
                      <tr key={task.id} className="hover:bg-white/5">
                        <td className="py-4 px-2 font-medium max-w-[200px] truncate" title={task.keyword}>
                          {task.keyword}
                        </td>
                        <td className="py-4 px-2 text-gray-400">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-gray-500" />
                            {new Date(task.scheduleTime).toLocaleString("vi-VN", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </span>
                        </td>
                        <td className="py-4 px-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                              task.status === "COMPLETED"
                                ? "bg-green-500/10 text-green-400 border-green-500/20"
                                : task.status === "FAILED"
                                ? "bg-red-500/10 text-red-400 border-red-500/20"
                                : task.status === "GENERATING_TEXT"
                                ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                : task.status === "GENERATING_IMAGE"
                                ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                            }`}
                          >
                            {(task.status === "GENERATING_TEXT" ||
                              task.status === "GENERATING_IMAGE" ||
                              isTaskRunning) && (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            )}
                            {task.status === "COMPLETED" && (
                              <CheckCircle className="w-3 h-3" />
                            )}
                            {task.status === "FAILED" && (
                              <AlertCircle className="w-3 h-3" />
                            )}
                            <span>
                              {task.status === "PENDING" && "Chờ xử lý"}
                              {task.status === "GENERATING_TEXT" && "Đang viết bài..."}
                              {task.status === "GENERATING_IMAGE" && "Đang vẽ ảnh..."}
                              {task.status === "COMPLETED" && "Hoàn thành"}
                              {task.status === "FAILED" && "Thất bại"}
                            </span>
                          </span>
                          {task.status === "FAILED" && task.errorMessage && (
                            <p className="text-[10px] text-red-500/80 mt-1 max-w-[200px] truncate" title={task.errorMessage}>
                              Lỗi: {task.errorMessage}
                            </p>
                          )}
                        </td>
                        <td className="py-4 px-2 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {task.status === "COMPLETED" && task.generatedPostId && (
                              <a
                                href={`/admin/blog`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-gray-400 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-all"
                                title="Xem bài viết"
                              >
                                <FileText className="w-4 h-4" />
                              </a>
                            )}
                            {task.status !== "COMPLETED" && task.status !== "GENERATING_TEXT" && task.status !== "GENERATING_IMAGE" && (
                              <button
                                onClick={() => handleRunTask(task.id)}
                                disabled={isTaskRunning}
                                className="text-pink-400 hover:text-pink-300 p-1 hover:bg-white/5 rounded-lg transition-all disabled:opacity-50 cursor-pointer"
                                title="Sinh bài viết ngay lập tức"
                              >
                                {isTaskRunning ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Play className="w-4 h-4" />
                                )}
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(task.id)}
                              disabled={isTaskRunning}
                              className="text-red-400 hover:text-red-300 p-1 hover:bg-white/5 rounded-lg transition-all disabled:opacity-50 cursor-pointer"
                              title="Xóa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500">
                      Chưa có từ khóa nào trong hàng đợi.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
