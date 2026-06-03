"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { upsertPage, deletePage } from "@/app/actions/pages";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { Plus, Edit2, Trash2, ArrowLeft, Save, Globe, Eye, FileText } from "lucide-react";

interface PageItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AdminPagesManagerProps {
  initialPages: PageItem[];
}

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function AdminPagesManager({ initialPages }: AdminPagesManagerProps) {
  const router = useRouter();
  const [pages, setPages] = useState<PageItem[]>(initialPages);
  const [editingPage, setEditingPage] = useState<Partial<PageItem> | null>(null);
  const [saving, setSaving] = useState(false);

  const handleEdit = (page: PageItem) => {
    setEditingPage(page);
  };

  const handleCreateNew = () => {
    setEditingPage({
      title: "",
      slug: "",
      content: "",
      isPublished: true,
      seoTitle: "",
      seoDescription: "",
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa trang chính sách này?")) return;

    try {
      const res = await deletePage(id);
      if (res.success) {
        router.refresh();
      } else {
        alert("Lỗi: " + res.error);
      }
    } catch (err: any) {
      alert("Đã xảy ra lỗi: " + err.message);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage || !editingPage.title || !editingPage.slug) {
      alert("Vui lòng điền đầy đủ tiêu đề và slug.");
      return;
    }

    setSaving(true);
    try {
      const res = await upsertPage({
        id: editingPage.id,
        title: editingPage.title,
        slug: editingPage.slug,
        content: editingPage.content || "",
        isPublished: editingPage.isPublished ?? true,
        seoTitle: editingPage.seoTitle || undefined,
        seoDescription: editingPage.seoDescription || undefined,
      });

      if (res.success) {
        setEditingPage(null);
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

  // Form view
  if (editingPage) {
    return (
      <GlassCard className="p-6 border-white/5 bg-[#0a0822]/60 space-y-6 text-left">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-pink-500" />
            <span>{editingPage.id ? "Chỉnh sửa trang" : "Tạo trang chính sách mới"}</span>
          </h3>
          <button
            onClick={() => setEditingPage(null)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white px-3 py-1.5 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại</span>
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">
                Tiêu đề trang *
              </label>
              <input
                type="text"
                required
                value={editingPage.title || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setEditingPage((prev) => {
                    if (!prev) return null;
                    const next = { ...prev, title: val };
                    if (!prev.id) {
                      next.slug = slugify(val);
                    }
                    return next;
                  });
                }}
                placeholder="Ví dụ: Chính sách bảo mật"
                className="glass-input w-full px-4 py-2.5 text-sm focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">
                Đường dẫn liên kết (Slug) *
              </label>
              <input
                type="text"
                required
                value={editingPage.slug || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setEditingPage((prev) => prev ? { ...prev, slug: slugify(val) } : null);
                }}
                placeholder="chinh-sach-bao-mat"
                className="glass-input w-full px-4 py-2.5 text-sm focus:outline-none font-mono text-pink-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">
                Tiêu đề SEO (seoTitle)
              </label>
              <input
                type="text"
                value={editingPage.seoTitle || ""}
                onChange={(e) => setEditingPage((prev) => prev ? { ...prev, seoTitle: e.target.value } : null)}
                placeholder="Bỏ trống để dùng tiêu đề gốc"
                className="glass-input w-full px-4 py-2.5 text-sm focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">
                Mô tả SEO (seoDescription)
              </label>
              <input
                type="text"
                value={editingPage.seoDescription || ""}
                onChange={(e) => setEditingPage((prev) => prev ? { ...prev, seoDescription: e.target.value } : null)}
                placeholder="Mô tả tóm tắt nội dung chính sách hiển thị trên Google..."
                className="glass-input w-full px-4 py-2.5 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">
              Trạng thái xuất bản
            </label>
            <label className="inline-flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={editingPage.isPublished ?? true}
                onChange={(e) => setEditingPage((prev) => prev ? { ...prev, isPublished: e.target.checked } : null)}
                className="w-4 h-4 text-pink-600 bg-black/40 border border-white/10 rounded focus:ring-pink-500 focus:ring-2 focus:ring-offset-black"
              />
              <span className="text-sm text-gray-300">Công khai trang này cho khách hàng truy cập</span>
            </label>
          </div>

          <div className="space-y-2 text-left">
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-2">
              Nội dung chính sách (HTML/TipTap Editor)
            </label>
            <RichTextEditor
              value={editingPage.content || ""}
              onChange={(html) => setEditingPage((prev) => prev ? { ...prev, content: html } : null)}
            />
          </div>

          <div className="pt-4 border-t border-white/5 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingPage(null)}
              className="px-6"
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-pink-600 hover:bg-pink-500 text-white font-bold px-8 flex items-center gap-2"
            >
              {saving ? "Đang lưu..." : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Lưu trang</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </GlassCard>
    );
  }

  // Table view
  return (
    <GlassCard className="p-6 border-white/5 bg-[#0a0822]/60 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Danh sách trang chính sách</h3>
        <Button
          onClick={handleCreateNew}
          className="bg-pink-600 hover:bg-pink-500 text-white font-semibold flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo trang mới</span>
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-gray-500">
              <th className="py-3 px-2">Tiêu đề</th>
              <th className="py-3 px-2">Slug</th>
              <th className="py-3 px-2">Trạng thái</th>
              <th className="py-3 px-2">Ngày tạo</th>
              <th className="py-3 px-2 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-gray-300">
            {initialPages.length > 0 ? (
              initialPages.map((page) => (
                <tr key={page.id} className="hover:bg-white/5">
                  <td className="py-4 px-2 font-semibold text-white">{page.title}</td>
                  <td className="py-4 px-2 font-mono text-pink-400">/{page.slug}</td>
                  <td className="py-4 px-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                        page.isPublished
                          ? "bg-green-500/10 text-green-400 border-green-500/20"
                          : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                      }`}
                    >
                      {page.isPublished ? <Globe className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{page.isPublished ? "Công khai" : "Ẩn bản nháp"}</span>
                    </span>
                  </td>
                  <td className="py-4 px-2 text-gray-400">
                    {new Date(page.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="py-4 px-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={`/${page.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-gray-400 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-all"
                        title="Xem trang thực tế"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleEdit(page)}
                        className="text-blue-400 hover:text-blue-300 p-1 hover:bg-white/5 rounded-lg transition-all cursor-pointer"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(page.id)}
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
                <td colSpan={5} className="py-8 text-center text-gray-500">
                  Chưa có trang chính sách nào được tạo.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
