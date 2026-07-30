"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addKeywordsToQueue,
  deleteAiTask,
  retryAiTask,
  retryAllFailedAiTasks,
} from "@/app/actions/blog";
import { useToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock3,
  FileText,
  ImageIcon,
  Loader2,
  Play,
  RefreshCw,
  Server,
  Sparkles,
  Trash2,
} from "lucide-react";

type TaskStatus =
  | "PENDING"
  | "GENERATING_TEXT"
  | "GENERATING_IMAGE"
  | "COMPLETED"
  | "FAILED";

interface Task {
  id: string;
  keyword: string;
  status: TaskStatus;
  scheduleTime: string;
  generatedPostId: string | null;
  generatedPost: { slug: string; status: string } | null;
  category: { name: string } | null;
  autoPublish: boolean;
  tone: string;
  length: string;
  withImages: boolean;
  imageCount: number;
  attempts: number;
  maxAttempts: number;
  nextAttemptAt: string | null;
  errorMessage: string | null;
}

interface QueueStatus {
  autoEnabled: boolean;
  batchLimit: number;
  schedulerOnline: boolean;
  schedulerLastSeenAt: string | null;
  schedulerLastRunAt: string | null;
  schedulerLastSuccessAt: string | null;
  schedulerLastResult: string | null;
  pendingCount: number;
  dueCount: number;
  processingCount: number;
  failedCount: number;
  nextScheduledAt: string | null;
}

interface BlogQueueClientProps {
  initialTasks: Task[];
  initialStatus: QueueStatus;
  categories: { id: string; name: string }[];
}

function defaultStartAt() {
  const date = new Date(Date.now() + 5 * 60_000);
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

function formatDate(value: string | null) {
  if (!value) return "Chưa có";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(value));
}

function taskState(task: Task) {
  if (task.status === "COMPLETED") return { label: "Hoàn thành", color: "green" };
  if (task.status === "FAILED") return { label: "Lỗi", color: "red" };
  if (task.status === "GENERATING_TEXT") return { label: "Đang viết bài", color: "blue" };
  if (task.status === "GENERATING_IMAGE") return { label: "Đang sinh ảnh", color: "purple" };
  if (task.nextAttemptAt && new Date(task.nextAttemptAt) > new Date()) {
    return { label: "Chờ thử lại", color: "yellow" };
  }
  if (new Date(task.scheduleTime) <= new Date()) {
    return { label: "Đến giờ", color: "pink" };
  }
  return { label: "Đang chờ", color: "gray" };
}

const statusClasses: Record<string, string> = {
  green: "border-green-500/20 bg-green-500/10 text-green-400",
  red: "border-red-500/20 bg-red-500/10 text-red-400",
  blue: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  purple: "border-purple-500/20 bg-purple-500/10 text-purple-400",
  yellow: "border-yellow-500/20 bg-yellow-500/10 text-yellow-400",
  pink: "border-pink-500/20 bg-pink-500/10 text-pink-400",
  gray: "border-white/10 bg-white/5 text-gray-400",
};

export default function BlogQueueClient({
  initialTasks,
  initialStatus,
  categories,
}: BlogQueueClientProps) {
  const router = useRouter();
  const toast = useToast();
  const [topics, setTopics] = useState("");
  const [startAt, setStartAt] = useState(defaultStartAt);
  const [intervalMinutes, setIntervalMinutes] = useState(60);
  const [categoryId, setCategoryId] = useState("");
  const [autoPublish, setAutoPublish] = useState(true);
  const [tone, setTone] = useState<"professional" | "casual" | "luxury">("professional");
  const [length, setLength] = useState<"short" | "medium" | "long">("medium");
  const [sharedKeywords, setSharedKeywords] = useState("");
  const [withImages, setWithImages] = useState(true);
  const [imageCount, setImageCount] = useState(2);
  const [submitting, setSubmitting] = useState(false);
  const [runningTaskId, setRunningTaskId] = useState<string | null>(null);
  const [retryingAll, setRetryingAll] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => router.refresh(), 15_000);
    return () => window.clearInterval(timer);
  }, [router]);

  const topicList = useMemo(
    () => topics.split("\n").map((item) => item.trim()).filter(Boolean),
    [topics],
  );
  const schedulePreview = useMemo(() => {
    const first = new Date(`${startAt}:00+07:00`);
    if (!Number.isFinite(first.getTime())) return [];
    return topicList.map((topic, index) => ({
      topic,
      time: new Date(first.getTime() + index * intervalMinutes * 60_000),
    }));
  }, [intervalMinutes, startAt, topicList]);
  const previewRows =
    schedulePreview.length <= 4
      ? schedulePreview
      : [...schedulePreview.slice(0, 3), schedulePreview.at(-1)!];

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!categoryId) {
      toast.warning("Thiếu chuyên mục", "Vui lòng chọn chuyên mục bài viết.");
      return;
    }
    setSubmitting(true);
    const result = await addKeywordsToQueue({
      topics,
      startAt,
      intervalMinutes,
      autoPublish,
      categoryId,
      tone,
      length,
      sharedKeywords,
      withImages,
      imageCount,
    });
    setSubmitting(false);
    if (!result.success) {
      toast.error("Không thể tạo lịch", result.error);
      return;
    }
    setTopics("");
    toast.success("Đã tạo lịch", `${result.count} bài viết đã được thêm vào hàng đợi.`);
    router.refresh();
  }

  async function runTask(id?: string) {
    setRunningTaskId(id || "__batch__");
    try {
      const response = await fetch(
        `/api/admin/blog/generate${id ? `?taskId=${encodeURIComponent(id)}` : ""}`,
        { method: "POST" },
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        toast.error("Xử lý chưa thành công", result.error || result.message);
      } else {
        toast.success("Đã xử lý", `${result.stats.success} bài viết hoàn thành.`);
      }
      router.refresh();
    } catch (error) {
      toast.error(
        "Không thể kết nối",
        error instanceof Error ? error.message : "Vui lòng thử lại.",
      );
    } finally {
      setRunningTaskId(null);
    }
  }

  async function removeTask(id: string) {
    if (!window.confirm("Xóa tác vụ này khỏi hàng đợi?")) return;
    const result = await deleteAiTask(id);
    if (result.success) {
      toast.success("Đã xóa", "Tác vụ đã được xóa khỏi hàng đợi.");
      router.refresh();
    } else {
      toast.error("Không thể xóa", result.error);
    }
  }

  async function retryOne(id: string) {
    setRunningTaskId(id);
    const result = await retryAiTask(id);
    setRunningTaskId(null);
    if (result.success) {
      toast.success("Đã lên lịch thử lại", "Tác vụ sẽ được worker xử lý.");
      router.refresh();
    } else {
      toast.error("Không thể thử lại", result.error);
    }
  }

  async function retryAll() {
    setRetryingAll(true);
    const result = await retryAllFailedAiTasks();
    setRetryingAll(false);
    if (result.success) {
      toast.success("Đã lên lịch thử lại", `${result.count} tác vụ được đặt lại.`);
      router.refresh();
    } else {
      toast.error("Không thể thử lại", result.error);
    }
  }

  const schedulerColor = !initialStatus.schedulerOnline
    ? "border-red-500/30 bg-red-500/5"
    : initialStatus.autoEnabled
      ? "border-green-500/30 bg-green-500/5"
      : "border-yellow-500/30 bg-yellow-500/5";

  return (
    <div className="space-y-6">
      <section className={`border p-5 ${schedulerColor}`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Server className="h-5 w-5 text-gray-300" />
            <div>
              <h2 className="text-sm font-semibold text-white">AI Scheduler phía server</h2>
              <p className="mt-1 text-xs text-gray-400">
                {initialStatus.schedulerOnline
                  ? initialStatus.autoEnabled
                    ? "Online, tự động xử lý đang bật"
                    : "Online, tự động xử lý đang tắt"
                  : "Không nhận được heartbeat trong 3 phút gần nhất"}
              </p>
              {!initialStatus.schedulerOnline && (
                <p className="mt-1 text-xs text-red-300">
                  Scheduler server chưa hoạt động. Vui lòng liên hệ quản trị máy chủ.
                </p>
              )}
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={Boolean(runningTaskId) || initialStatus.dueCount === 0}
            onClick={() => runTask()}
            className="gap-2"
          >
            {runningTaskId === "__batch__" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Xử lý bài đến giờ
          </Button>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-4 lg:grid-cols-8">
          {[
            ["Heartbeat", formatDate(initialStatus.schedulerLastSeenAt)],
            ["Lần chạy", formatDate(initialStatus.schedulerLastRunAt)],
            ["Đang chờ", initialStatus.pendingCount],
            ["Đến giờ", initialStatus.dueCount],
            ["Đang xử lý", initialStatus.processingCount],
            ["Lỗi", initialStatus.failedCount],
            ["Bài tiếp theo", formatDate(initialStatus.nextScheduledAt)],
            ["Batch limit", initialStatus.batchLimit],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-[10px] uppercase text-gray-500">{label}</dt>
              <dd className="mt-1 text-xs font-semibold text-gray-200">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <section className="border border-white/10 bg-[#0a0822]/60 p-5">
          <div className="mb-5 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-pink-400" />
            <h2 className="font-semibold text-white">Tạo lịch bài viết</h2>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <label className="block space-y-1.5 text-xs text-gray-400">
              Danh sách chủ đề
              <textarea
                value={topics}
                onChange={(event) => setTopics(event.target.value)}
                rows={6}
                required
                placeholder={"Thiết kế website chuẩn SEO\nXu hướng UI/UX năm 2026"}
                className="w-full resize-y border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-pink-500/50"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1.5 text-xs text-gray-400">
                Bắt đầu lúc
                <input
                  type="datetime-local"
                  value={startAt}
                  onChange={(event) => setStartAt(event.target.value)}
                  required
                  className="w-full border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-pink-500/50"
                />
              </label>
              <label className="space-y-1.5 text-xs text-gray-400">
                Khoảng cách (phút)
                <input
                  type="number"
                  min={1}
                  max={10_080}
                  value={intervalMinutes}
                  onChange={(event) => setIntervalMinutes(Number(event.target.value))}
                  required
                  className="w-full border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-pink-500/50"
                />
              </label>
            </div>

            <label className="block space-y-1.5 text-xs text-gray-400">
              Chuyên mục
              <select
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                required
                className="w-full border border-white/10 bg-[#0a0822] px-3 py-2.5 text-sm text-white outline-none focus:border-pink-500/50"
              >
                <option value="">Chọn chuyên mục</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1.5 text-xs text-gray-400">
                Giọng văn
                <select
                  value={tone}
                  onChange={(event) => setTone(event.target.value as typeof tone)}
                  className="w-full border border-white/10 bg-[#0a0822] px-3 py-2.5 text-sm text-white"
                >
                  <option value="professional">Chuyên nghiệp</option>
                  <option value="casual">Gần gũi</option>
                  <option value="luxury">Cao cấp</option>
                </select>
              </label>
              <label className="space-y-1.5 text-xs text-gray-400">
                Độ dài
                <select
                  value={length}
                  onChange={(event) => setLength(event.target.value as typeof length)}
                  className="w-full border border-white/10 bg-[#0a0822] px-3 py-2.5 text-sm text-white"
                >
                  <option value="short">Ngắn</option>
                  <option value="medium">Trung bình</option>
                  <option value="long">Chuyên sâu</option>
                </select>
              </label>
            </div>

            <label className="block space-y-1.5 text-xs text-gray-400">
              Từ khóa chung
              <input
                value={sharedKeywords}
                onChange={(event) => setSharedKeywords(event.target.value)}
                placeholder="next.js, thiết kế website, ui/ux"
                className="w-full border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-pink-500/50"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2 border border-white/10 bg-white/[0.025] px-3 py-2.5 text-xs text-gray-300">
                <input
                  type="checkbox"
                  checked={autoPublish}
                  onChange={(event) => setAutoPublish(event.target.checked)}
                  className="accent-pink-500"
                />
                Tự động đăng bài
              </label>
              <label className="flex items-center gap-2 border border-white/10 bg-white/[0.025] px-3 py-2.5 text-xs text-gray-300">
                <input
                  type="checkbox"
                  checked={withImages}
                  onChange={(event) => setWithImages(event.target.checked)}
                  className="accent-pink-500"
                />
                Sinh ảnh minh họa
              </label>
            </div>

            {withImages && (
              <label className="block space-y-1.5 text-xs text-gray-400">
                Số ảnh trong bài
                <div className="flex items-center gap-3">
                  <ImageIcon className="h-4 w-4 text-purple-400" />
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={imageCount}
                    onChange={(event) => setImageCount(Number(event.target.value))}
                    className="w-full border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white"
                  />
                </div>
                <span className="block text-[10px] text-gray-600">
                  Ảnh bìa được sinh riêng và luôn có alt text.
                </span>
              </label>
            )}

            {previewRows.length > 0 && (
              <div className="border border-white/10 bg-black/20 p-3">
                <div className="mb-2 text-[10px] uppercase text-gray-500">Preview lịch</div>
                <div className="space-y-1.5">
                  {previewRows.map((item, index) => (
                    <div key={`${item.topic}-${index}`} className="flex gap-2 text-[11px] text-gray-400">
                      <span className="w-12 shrink-0 text-pink-400">
                        Bài {schedulePreview.indexOf(item) + 1}
                      </span>
                      <span className="truncate">{formatDate(item.time.toISOString())}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button type="submit" disabled={submitting} className="w-full gap-2">
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Thêm vào hàng đợi
            </Button>
          </form>
        </section>

        <section className="min-w-0 border border-white/10 bg-[#0a0822]/60">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
            <div>
              <h2 className="font-semibold text-white">Hàng đợi AI</h2>
              <p className="mt-1 text-xs text-gray-500">{initialTasks.length} tác vụ gần nhất</p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={retryAll}
              disabled={retryingAll || initialStatus.failedCount === 0}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${retryingAll ? "animate-spin" : ""}`} />
              Thử lại tất cả lỗi
            </Button>
          </header>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-xs">
              <thead className="border-b border-white/10 text-[10px] uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Chủ đề</th>
                  <th className="px-4 py-3">Lịch</th>
                  <th className="px-4 py-3">Chế độ</th>
                  <th className="px-4 py-3">Thử</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Bài viết</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {initialTasks.map((task) => {
                  const state = taskState(task);
                  const busy =
                    runningTaskId === task.id ||
                    task.status === "GENERATING_TEXT" ||
                    task.status === "GENERATING_IMAGE";
                  return (
                    <tr key={task.id} className="text-gray-300 hover:bg-white/[0.025]">
                      <td className="max-w-[260px] px-4 py-4">
                        <div className="truncate font-medium text-white" title={task.keyword}>
                          {task.keyword}
                        </div>
                        <div className="mt-1 truncate text-[10px] text-gray-500">
                          {task.category?.name || "Chưa phân loại"}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-400">
                        <div className="flex items-center gap-1.5">
                          <Clock3 className="h-3.5 w-3.5" />
                          {formatDate(task.scheduleTime)}
                        </div>
                        {task.nextAttemptAt && (
                          <div className="mt-1 text-[10px] text-yellow-500">
                            Thử lại: {formatDate(task.nextAttemptAt)}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div>{task.autoPublish ? "Tự đăng" : "Bản nháp"}</div>
                        <div className="mt-1 text-[10px] text-gray-500">
                          {task.withImages ? `${task.imageCount} ảnh + ảnh bìa` : "Không sinh ảnh"}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-400">
                        {task.attempts}/{task.maxAttempts}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 border px-2 py-1 text-[10px] font-semibold ${statusClasses[state.color]}`}>
                          {busy && <Loader2 className="h-3 w-3 animate-spin" />}
                          {task.status === "COMPLETED" && <CheckCircle2 className="h-3 w-3" />}
                          {task.status === "FAILED" && <AlertCircle className="h-3 w-3" />}
                          {state.label}
                        </span>
                        {task.errorMessage && (
                          <div
                            className={`mt-1 max-w-[180px] truncate text-[10px] ${
                              task.status === "COMPLETED"
                                ? "text-amber-300/80"
                                : "text-red-400/80"
                            }`}
                            title={task.errorMessage}
                          >
                            {task.errorMessage}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {task.generatedPost ? (
                          <a
                            href={`/bai-viet/${task.generatedPost.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-pink-400 hover:text-pink-300"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            {task.generatedPost.status === "PUBLISHED" ? "Đã đăng" : "Bản nháp"}
                          </a>
                        ) : (
                          <span className="text-gray-600">Chưa có</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-1">
                          {task.status === "FAILED" ? (
                            <button type="button" onClick={() => retryOne(task.id)} disabled={busy} title="Thử lại" className="p-2 text-yellow-400 hover:bg-yellow-500/10 disabled:opacity-40">
                              <RefreshCw className="h-4 w-4" />
                            </button>
                          ) : task.status === "PENDING" ? (
                            <button type="button" onClick={() => runTask(task.id)} disabled={busy} title="Xử lý ngay" className="p-2 text-pink-400 hover:bg-pink-500/10 disabled:opacity-40">
                              <Play className="h-4 w-4" />
                            </button>
                          ) : null}
                          {["PENDING", "FAILED"].includes(task.status) && (
                            <button type="button" onClick={() => removeTask(task.id)} disabled={busy} title="Xóa tác vụ" className="p-2 text-red-400 hover:bg-red-500/10 disabled:opacity-40">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {initialTasks.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                      Hàng đợi chưa có tác vụ.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
