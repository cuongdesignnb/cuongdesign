"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import {
  toggleTestimonialPublish,
  updateTestimonial,
  deleteTestimonial,
  createTestimonial,
} from "@/app/actions/admin-testimonials";
import {
  Star,
  Edit2,
  Trash2,
  X,
  Save,
  Eye,
  EyeOff,
  MessageSquarePlus,
  Quote,
  Plus,
} from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  avatar: string | null;
  rating: number;
  quote: string;
  isPublished: boolean;
  order: number;
  createdAt: string;
}

interface AdminTestimonialsManagerProps {
  initialData: Testimonial[];
}

export default function AdminTestimonialsManager({
  initialData,
}: AdminTestimonialsManagerProps) {
  const router = useRouter();
  const toast = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Testimonial>>({});
  const [saving, setSaving] = useState(false);

  const totalCount = initialData.length;
  const publishedCount = initialData.filter((t) => t.isPublished).length;
  const hiddenCount = totalCount - publishedCount;

  const isCreateMode = editingId === "NEW";

  const handleTogglePublish = async (id: string) => {
    try {
      const res = await toggleTestimonialPublish(id);
      if (res.success) {
        toast.success("Thành công", "Đã cập nhật trạng thái hiển thị");
        router.refresh();
      } else {
        toast.error("Lỗi", res.error);
      }
    } catch (err: any) {
      toast.error("Lỗi", err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) return;
    try {
      const res = await deleteTestimonial(id);
      if (res.success) {
        toast.success("Thành công", "Đã xóa đánh giá");
        router.refresh();
      } else {
        toast.error("Lỗi", res.error);
      }
    } catch (err: any) {
      toast.error("Lỗi", err.message);
    }
  };

  const openCreateModal = () => {
    setEditingId("NEW");
    setEditForm({
      name: "",
      role: "",
      company: "",
      avatar: "",
      rating: 5,
      quote: "",
      order: 0,
    });
  };

  const openEditModal = (t: Testimonial) => {
    setEditingId(t.id);
    setEditForm({
      name: t.name,
      role: t.role || "",
      company: t.company || "",
      avatar: t.avatar || "",
      rating: t.rating,
      quote: t.quote,
      order: t.order,
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setSaving(true);
    try {
      if (isCreateMode) {
        // Create mode
        const res = await createTestimonial({
          name: editForm.name || "",
          role: editForm.role || "",
          company: editForm.company || undefined,
          avatar: editForm.avatar || undefined,
          rating: editForm.rating || 5,
          quote: editForm.quote || "",
          order: editForm.order,
        });
        if (res.success) {
          toast.success("Thành công", "Đã thêm đánh giá mới");
          setEditingId(null);
          router.refresh();
        } else {
          toast.error("Lỗi", res.error);
        }
      } else {
        // Edit mode
        const res = await updateTestimonial(editingId, {
          name: editForm.name,
          role: editForm.role || undefined,
          company: editForm.company || undefined,
          avatar: editForm.avatar || undefined,
          rating: editForm.rating,
          quote: editForm.quote,
          order: editForm.order,
        });
        if (res.success) {
          toast.success("Thành công", "Đã cập nhật đánh giá");
          setEditingId(null);
          router.refresh();
        } else {
          toast.error("Lỗi", res.error);
        }
      }
    } catch (err: any) {
      toast.error("Lỗi", err.message);
    } finally {
      setSaving(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`w-3.5 h-3.5 ${
              i <= rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-600"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-white/5 bg-[#0a0822]/50 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
            Tổng đánh giá
          </p>
          <p className="text-2xl font-bold text-white mt-1">{totalCount}</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-[#0a0822]/50 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
            Đang hiển thị
          </p>
          <p className="text-2xl font-bold text-green-400 mt-1">
            {publishedCount}
          </p>
        </div>
        <div className="rounded-xl border border-white/5 bg-[#0a0822]/50 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
            Đang ẩn
          </p>
          <p className="text-2xl font-bold text-gray-400 mt-1">{hiddenCount}</p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/5 bg-[#0a0822]/50 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageSquarePlus className="w-5 h-5 text-pink-500" />
            <h3 className="text-lg font-bold text-white">
              Danh sách đánh giá khách hàng
            </h3>
          </div>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 text-sm rounded-lg bg-pink-500 hover:bg-pink-600 text-white font-semibold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm đánh giá mới</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-gray-500">
                <th className="py-3 px-2">Avatar</th>
                <th className="py-3 px-2">Tên</th>
                <th className="py-3 px-2">Công ty</th>
                <th className="py-3 px-2">Đánh giá</th>
                <th className="py-3 px-2">Nhận xét</th>
                <th className="py-3 px-2">Hiển thị</th>
                <th className="py-3 px-2 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {initialData.length > 0 ? (
                initialData.map((t) => (
                  <tr key={t.id} className="hover:bg-white/5">
                    <td className="py-4 px-2">
                      {t.avatar ? (
                        <img
                          src={t.avatar}
                          alt={t.name}
                          className="w-8 h-8 rounded-full object-cover border border-white/10"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 font-bold text-xs">
                          {t.name[0]?.toUpperCase() || "?"}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-2">
                      <div className="font-semibold text-white">{t.name}</div>
                      {t.role && (
                        <div className="text-[10px] text-gray-500">
                          {t.role}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-2 text-gray-400">
                      {t.company || "—"}
                    </td>
                    <td className="py-4 px-2">{renderStars(t.rating)}</td>
                    <td className="py-4 px-2 text-gray-400 max-w-[200px]">
                      <span title={t.quote}>
                        {t.quote.length > 50
                          ? t.quote.slice(0, 50) + "..."
                          : t.quote}
                      </span>
                    </td>
                    <td className="py-4 px-2">
                      <button
                        onClick={() => handleTogglePublish(t.id)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                          t.isPublished ? "bg-green-500" : "bg-gray-600"
                        }`}
                        title={
                          t.isPublished ? "Đang hiển thị" : "Đang ẩn"
                        }
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
                            t.isPublished
                              ? "translate-x-4"
                              : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </td>
                    <td className="py-4 px-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(t)}
                          className="text-blue-400 hover:text-blue-300 p-1 hover:bg-white/5 rounded-lg transition-all cursor-pointer"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="text-red-400 hover:text-red-300 p-1 hover:bg-white/5 rounded-lg transition-all cursor-pointer"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    Chưa có đánh giá nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg mx-4 rounded-xl border border-white/10 bg-[#0a0822] p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Quote className="w-5 h-5 text-pink-500" />
                {isCreateMode ? "Thêm đánh giá mới" : "Chỉnh sửa đánh giá"}
              </h3>
              <button
                onClick={() => setEditingId(null)}
                className="text-gray-400 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">
                    Tên *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name || ""}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-sm bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pink-500/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">
                    Vai trò
                  </label>
                  <input
                    type="text"
                    value={editForm.role || ""}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, role: e.target.value }))
                    }
                    placeholder="CEO, Designer..."
                    className="w-full px-3 py-2 text-sm bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pink-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">
                    Công ty
                  </label>
                  <input
                    type="text"
                    value={editForm.company || ""}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        company: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 text-sm bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pink-500/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">
                    Avatar URL
                  </label>
                  <input
                    type="text"
                    value={editForm.avatar || ""}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        avatar: e.target.value,
                      }))
                    }
                    placeholder="https://..."
                    className="w-full px-3 py-2 text-sm bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pink-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">
                    Đánh giá (1-5)
                  </label>
                  <select
                    value={editForm.rating || 5}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        rating: parseInt(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 text-sm bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pink-500/50"
                  >
                    {[1, 2, 3, 4, 5].map((v) => (
                      <option key={v} value={v}>
                        {v} sao
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">
                    Thứ tự
                  </label>
                  <input
                    type="number"
                    value={editForm.order ?? 0}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        order: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-3 py-2 text-sm bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pink-500/50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">
                  Nhận xét *
                </label>
                <textarea
                  required
                  rows={3}
                  value={editForm.quote || ""}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, quote: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-sm bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pink-500/50 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-white/5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="px-4 py-2 text-sm text-gray-400 border border-white/10 hover:bg-white/5 rounded-lg transition-all cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-sm font-semibold bg-pink-500 hover:bg-pink-600 text-white rounded-lg flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    "Đang lưu..."
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{isCreateMode ? "Tạo mới" : "Lưu thay đổi"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
