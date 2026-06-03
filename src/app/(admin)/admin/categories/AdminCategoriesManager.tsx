"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  upsertCategory,
  deleteCategory,
  seedDefaultCategories,
} from "@/app/actions/admin-categories";
import {
  FolderOpen,
  FileText,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  Loader2,
  Sparkles,
  Search,
} from "lucide-react";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  color: string | null;
  order: number;
  createdAt: string;
  _count: { posts: number };
}

interface AdminCategoriesManagerProps {
  initialCategories: CategoryItem[];
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function AdminCategoriesManager({
  initialCategories,
}: AdminCategoriesManagerProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    coverImage: "",
    color: "#ec4899",
    order: 0,
  });

  const totalPosts = initialCategories.reduce((sum, c) => sum + c._count.posts, 0);

  const openAdd = () => {
    setEditingId(null);
    setFormData({ name: "", slug: "", description: "", coverImage: "", color: "#ec4899", order: initialCategories.length });
    setShowModal(true);
  };

  const openEdit = (cat: CategoryItem) => {
    setEditingId(cat.id);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      coverImage: cat.coverImage || "",
      color: cat.color || "#ec4899",
      order: cat.order,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: editingId ? prev.slug : slugify(name),
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.slug.trim()) {
      alert("Tên và slug không được để trống.");
      return;
    }
    setSaving(true);
    try {
      const res = await upsertCategory({
        id: editingId || undefined,
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim() || undefined,
        coverImage: formData.coverImage.trim() || undefined,
        color: formData.color.trim() || undefined,
        order: formData.order,
      });
      if (res.success) {
        closeModal();
        router.refresh();
      } else {
        alert("Lỗi: " + res.error);
      }
    } catch (err: any) {
      alert("Đã xảy ra lỗi: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa chuyên mục này?")) return;
    try {
      const res = await deleteCategory(id);
      if (res.success) {
        router.refresh();
      } else {
        alert("Lỗi: " + res.error);
      }
    } catch (err: any) {
      alert("Đã xảy ra lỗi: " + err.message);
    }
  };

  const handleSeed = async () => {
    if (!confirm("Tạo 6 chuyên mục mặc định? (Không ảnh hưởng chuyên mục đã có)")) return;
    setSeeding(true);
    try {
      const res = await seedDefaultCategories();
      if (res.success) {
        router.refresh();
      } else {
        alert("Lỗi: " + res.error);
      }
    } catch (err: any) {
      alert("Đã xảy ra lỗi: " + err.message);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-white/5 bg-[#0a0822]/50 p-4 flex items-center gap-3">
          <FolderOpen className="w-5 h-5 text-pink-500" />
          <div>
            <p className="text-2xl font-bold text-white">{initialCategories.length}</p>
            <p className="text-xs text-gray-500">Tổng chuyên mục</p>
          </div>
        </div>
        <div className="rounded-xl border border-white/5 bg-[#0a0822]/50 p-4 flex items-center gap-3">
          <FileText className="w-5 h-5 text-purple-500" />
          <div>
            <p className="text-2xl font-bold text-white">{totalPosts}</p>
            <p className="text-xs text-gray-500">Tổng bài viết</p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={openAdd}
          className="px-4 py-2 text-sm rounded-lg bg-pink-500 hover:bg-pink-600 text-white font-semibold flex items-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm chuyên mục</span>
        </button>
        <button
          onClick={handleSeed}
          disabled={seeding}
          className="px-4 py-2 text-sm rounded-lg border border-white/10 text-gray-400 hover:bg-white/5 hover:text-white font-semibold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          {seeding ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          <span>Seed chuyên mục mặc định</span>
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/5 bg-[#0a0822]/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-gray-500">
                <th className="py-3 px-4">Màu</th>
                <th className="py-3 px-4">Tên</th>
                <th className="py-3 px-4">Slug</th>
                <th className="py-3 px-4">Bài viết</th>
                <th className="py-3 px-4">Thứ tự</th>
                <th className="py-3 px-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {initialCategories.length > 0 ? (
                initialCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-white/5">
                    <td className="py-4 px-4">
                      <span
                        className="inline-block w-4 h-4 rounded-full border border-white/10"
                        style={{ backgroundColor: cat.color || "#6b7280" }}
                      />
                    </td>
                    <td className="py-4 px-4 font-semibold text-white">{cat.name}</td>
                    <td className="py-4 px-4 font-mono text-pink-400 text-[11px]">{cat.slug}</td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-white/5 border-white/10 text-gray-400">
                        {cat._count.posts}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-400">{cat.order}</td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEdit(cat)}
                          className="text-blue-400 hover:text-blue-300 p-1.5 hover:bg-white/5 rounded-lg transition-all cursor-pointer"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          disabled={cat._count.posts > 0}
                          className="text-red-400 hover:text-red-300 p-1.5 hover:bg-white/5 rounded-lg transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                          title={
                            cat._count.posts > 0
                              ? `Không thể xóa: đang có ${cat._count.posts} bài viết`
                              : "Xóa"
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    Chưa có chuyên mục nào. Hãy thêm mới hoặc seed mặc định.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0a0822] p-6 space-y-6 shadow-2xl mx-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-pink-500" />
                <span>{editingId ? "Chỉnh sửa chuyên mục" : "Thêm chuyên mục mới"}</span>
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white p-1.5 hover:bg-white/5 rounded-lg transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">
                  Tên chuyên mục *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 transition-colors"
                  placeholder="Tên chuyên mục"
                />
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">
                  Slug *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-4 py-2.5 text-sm rounded-lg bg-white/5 border border-white/10 text-pink-400 font-mono placeholder-gray-500 focus:outline-none focus:border-pink-500/50 transition-colors"
                  placeholder="ten-chuyen-muc"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">
                  Mô tả
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 transition-colors resize-y"
                  placeholder="Mô tả ngắn cho chuyên mục..."
                />
              </div>

              {/* Cover Image */}
              <div className="space-y-2">
                <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">
                  Ảnh bìa (URL)
                </label>
                <input
                  type="text"
                  value={formData.coverImage}
                  onChange={(e) => setFormData((prev) => ({ ...prev, coverImage: e.target.value }))}
                  className="w-full px-4 py-2.5 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 transition-colors"
                  placeholder="https://..."
                />
              </div>

              {/* Color + Order */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">
                    Màu sắc (Hex)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                      className="grow px-4 py-2.5 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 transition-colors font-mono"
                      placeholder="#ec4899"
                    />
                    <span
                      className="w-10 h-10 rounded-lg border border-white/10 shrink-0"
                      style={{ backgroundColor: formData.color || "#6b7280" }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">
                    Thứ tự
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.order}
                    onChange={(e) => setFormData((prev) => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-2.5 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
              <button
                onClick={closeModal}
                className="px-5 py-2 text-sm rounded-lg border border-white/10 text-gray-400 hover:bg-white/5 hover:text-white transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 text-sm rounded-lg bg-pink-500 hover:bg-pink-600 text-white font-semibold flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {saving ? (
                  "Đang lưu..."
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{editingId ? "Cập nhật" : "Tạo mới"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
