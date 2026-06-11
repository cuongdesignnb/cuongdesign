"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createPost, updatePost, deletePost, togglePostStatus } from "@/app/actions/admin-posts";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { useToast } from "@/components/ui/Toast";
import { slugify } from "@/lib/utils";
import {
  FileText,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Save,
  X,
  Globe,
  Clock,
  PenLine,
  Search,
  Plus,
  Image,
  Wand2,
  Loader2,
  Check,
  Upload,
} from "lucide-react";

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
  color: string | null;
}

interface PostItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  coverImage: string | null;
  status: string;
  publishedAt: string | null;
  categoryId: string | null;
  category: CategoryOption | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  createdAt: string;
  updatedAt: string;
}

interface MediaItem {
  id: string;
  name: string;
  url: string;
  size: number;
  width: number | null;
  height: number | null;
}

interface AdminPostsManagerProps {
  initialPosts: PostItem[];
  categories: CategoryOption[];
  mediaLibrary: MediaItem[];
}

type FilterTab = "ALL" | "PUBLISHED" | "DRAFT" | "SCHEDULED";

export default function AdminPostsManager({ initialPosts, categories, mediaLibrary }: AdminPostsManagerProps) {
  const router = useRouter();
  const toast = useToast();
  const [filter, setFilter] = useState<FilterTab>("ALL");
  const [editingPost, setEditingPost] = useState<PostItem | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [formData, setFormData] = useState<Partial<PostItem>>({});
  const [saving, setSaving] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<"cover" | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const filteredPosts =
    filter === "ALL"
      ? initialPosts
      : initialPosts.filter((p) => p.status === filter);

  const stats = {
    total: initialPosts.length,
    published: initialPosts.filter((p) => p.status === "PUBLISHED").length,
    draft: initialPosts.filter((p) => p.status === "DRAFT").length,
    scheduled: initialPosts.filter((p) => p.status === "SCHEDULED").length,
  };

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "ALL", label: "Tất cả", count: stats.total },
    { key: "PUBLISHED", label: "Đã xuất bản", count: stats.published },
    { key: "DRAFT", label: "Bản nháp", count: stats.draft },
    { key: "SCHEDULED", label: "Lên lịch", count: stats.scheduled },
  ];

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  const openEdit = (post: PostItem) => {
    setIsCreateMode(false);
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content: post.content || "",
      coverImage: post.coverImage || "",
      status: post.status,
      seoTitle: post.seoTitle || "",
      seoDescription: post.seoDescription || "",
      seoKeywords: post.seoKeywords || "",
    });
    setSelectedCategoryId(post.categoryId || "");
  };

  const openCreate = () => {
    setIsCreateMode(true);
    setEditingPost({ id: "__new__" } as PostItem);
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      coverImage: "",
      status: "DRAFT",
      seoTitle: "",
      seoDescription: "",
      seoKeywords: "",
    });
    setSelectedCategoryId("");
  };

  const closeEdit = () => {
    setEditingPost(null);
    setIsCreateMode(false);
    setFormData({});
    setSelectedCategoryId("");
  };

  const handleSave = async () => {
    if (!editingPost) return;
    if (!formData.title?.trim() || !formData.slug?.trim()) {
      toast.warning("Cảnh báo", "Vui lòng nhập tiêu đề và slug.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt || undefined,
        content: formData.content || undefined,
        coverImage: formData.coverImage || undefined,
        status: formData.status as "DRAFT" | "PUBLISHED" | "SCHEDULED" | undefined,
        categoryId: selectedCategoryId || undefined,
        seoTitle: formData.seoTitle || undefined,
        seoDescription: formData.seoDescription || undefined,
        seoKeywords: formData.seoKeywords || undefined,
      };
      const res = isCreateMode
        ? await createPost(payload)
        : await updatePost(editingPost.id, { ...payload, categoryId: selectedCategoryId || null });
      if (res.success) {
        toast.success("Thành công", isCreateMode ? "Đã tạo bài viết mới." : "Đã lưu thay đổi.");
        closeEdit();
        router.refresh();
      } else {
        toast.error("Lỗi", res.error);
      }
    } catch (err: any) {
      toast.error("Lỗi", err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const res = await togglePostStatus(id);
      if (res.success) {
        toast.success("Thành công", "Đã cập nhật trạng thái bài viết.");
        router.refresh();
      } else {
        toast.error("Lỗi", res.error);
      }
    } catch (err: any) {
      toast.error("Lỗi", err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài viết này?")) return;
    try {
      const res = await deletePost(id);
      if (res.success) {
        toast.success("Thành công", "Đã xóa bài viết.");
        router.refresh();
      } else {
        toast.error("Lỗi", res.error);
      }
    } catch (err: any) {
      toast.error("Lỗi", err.message);
    }
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      const res = await fetch('/api/admin/media/upload', { method: 'POST', body: formDataUpload });
      const data = await res.json();
      if (res.ok) {
        setFormData(prev => ({ ...prev, coverImage: data.url }));
        toast.success('Thành công', 'Đã upload hình ảnh.');
      } else {
        toast.error('Lỗi', data.error);
      }
    } catch (err: any) {
      toast.error('Lỗi', err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAiGenerate = async () => {
    if (!formData.title?.trim()) {
      toast.warning('Cảnh báo', 'Vui lòng nhập tiêu đề trước khi sinh nội dung AI.');
      return;
    }
    setIsGenerating(true);
    try {
      const res = await fetch('/api/admin/blog/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          categoryId: selectedCategoryId || undefined,
          generateImage: !formData.coverImage,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFormData(prev => ({
          ...prev,
          content: data.content,
          excerpt: data.excerpt || prev.excerpt,
          coverImage: data.coverImage || prev.coverImage,
          seoTitle: data.seoTitle || prev.seoTitle,
          seoDescription: data.seoDescription || prev.seoDescription,
          seoKeywords: data.seoKeywords?.join(', ') || prev.seoKeywords,
        }));
        toast.success('AI đã sinh nội dung', 'Nội dung, SEO và ảnh bìa đã được tạo tự động.');
      } else {
        toast.error('Lỗi AI', data.error);
      }
    } catch (err: any) {
      toast.error('Lỗi', err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { bg: string; text: string; icon: React.ReactNode; label: string }> = {
      PUBLISHED: {
        bg: "bg-green-500/10 border-green-500/20",
        text: "text-green-400",
        icon: <Globe className="w-3.5 h-3.5" />,
        label: "Published",
      },
      DRAFT: {
        bg: "bg-gray-500/10 border-gray-500/20",
        text: "text-gray-400",
        icon: <PenLine className="w-3.5 h-3.5" />,
        label: "Draft",
      },
      SCHEDULED: {
        bg: "bg-yellow-500/10 border-yellow-500/20",
        text: "text-yellow-400",
        icon: <Clock className="w-3.5 h-3.5" />,
        label: "Scheduled",
      },
    };
    const s = map[status] || map.DRAFT;
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${s.bg} ${s.text}`}
      >
        {s.icon}
        <span>{s.label}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Tổng bài viết", value: stats.total, icon: <FileText className="w-5 h-5 text-pink-500" /> },
          { label: "Đã xuất bản", value: stats.published, icon: <Globe className="w-5 h-5 text-green-400" /> },
          { label: "Bản nháp", value: stats.draft, icon: <PenLine className="w-5 h-5 text-gray-400" /> },
          { label: "Lên lịch", value: stats.scheduled, icon: <Clock className="w-5 h-5 text-yellow-400" /> },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-white/5 bg-[#0a0822]/50 p-4 flex items-center gap-3"
          >
            {stat.icon}
            <div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs + Create button */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filter === tab.key
                  ? "bg-pink-500 text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 rounded-lg text-xs font-semibold bg-pink-500 hover:bg-pink-600 text-white flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Thêm bài viết mới
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/5 bg-[#0a0822]/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-gray-500">
                <th className="py-3 px-4">Tiêu đề</th>
                <th className="py-3 px-4">Chuyên mục</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4">Ngày xuất bản</th>
                <th className="py-3 px-4">SEO Title</th>
                <th className="py-3 px-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-white/5">
                    <td className="py-4 px-4">
                      <div className="font-semibold text-white truncate max-w-[280px]">
                        {post.title}
                      </div>
                      <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                        /{post.slug}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {post.category ? (
                        <span className="inline-flex items-center gap-1.5 text-xs">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: post.category.color || '#6b7280' }}
                          />
                          <span className="text-gray-300">{post.category.name}</span>
                        </span>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>
                    <td className="py-4 px-4">{statusBadge(post.status)}</td>
                    <td className="py-4 px-4 text-gray-400">
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString("vi-VN")
                        : "—"}
                    </td>
                    <td className="py-4 px-4 text-gray-400 truncate max-w-[180px]">
                      {post.seoTitle || "—"}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEdit(post)}
                          className="text-blue-400 hover:text-blue-300 p-1.5 hover:bg-white/5 rounded-lg transition-all cursor-pointer"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggle(post.id)}
                          className={`p-1.5 hover:bg-white/5 rounded-lg transition-all cursor-pointer ${
                            post.status === "PUBLISHED"
                              ? "text-yellow-400 hover:text-yellow-300"
                              : "text-green-400 hover:text-green-300"
                          }`}
                          title={post.status === "PUBLISHED" ? "Chuyển sang nháp" : "Xuất bản"}
                        >
                          {post.status === "PUBLISHED" ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="text-red-400 hover:text-red-300 p-1.5 hover:bg-white/5 rounded-lg transition-all cursor-pointer"
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
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    Không tìm thấy bài viết nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0a0822] p-6 space-y-6 shadow-2xl mx-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-pink-500" />
                <span>{isCreateMode ? "Thêm bài viết mới" : "Chỉnh sửa bài viết"}</span>
              </h3>
              <button
                onClick={closeEdit}
                className="text-gray-400 hover:text-white p-1.5 hover:bg-white/5 rounded-lg transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Title + Slug */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">
                    Tiêu đề *
                  </label>
                  <input
                    type="text"
                    value={formData.title || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((prev) => ({ ...prev, title: val, slug: slugify(val) }));
                    }}
                    className="w-full px-4 py-2.5 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 transition-colors"
                    placeholder="Tiêu đề bài viết"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">
                    Slug *
                  </label>
                  <input
                    type="text"
                    value={formData.slug || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((prev) => ({ ...prev, slug: slugify(val) }));
                    }}
                    className="w-full px-4 py-2.5 text-sm rounded-lg bg-white/5 border border-white/10 text-pink-400 font-mono placeholder-gray-500 focus:outline-none focus:border-pink-500/50 transition-colors"
                    placeholder="tieu-de-bai-viet"
                  />
                </div>
              </div>

              {/* Excerpt */}
              <div className="space-y-2">
                <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">
                  Mô tả ngắn (Excerpt)
                </label>
                <input
                  type="text"
                  value={formData.excerpt || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
                  className="w-full px-4 py-2.5 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 transition-colors"
                  placeholder="Mô tả ngắn cho bài viết..."
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">
                    Nội dung
                  </label>
                  <button
                    type="button"
                    onClick={handleAiGenerate}
                    disabled={isGenerating}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isGenerating ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang sinh nội dung...</>
                    ) : (
                      <><Wand2 className="w-3.5 h-3.5" /> AI Sinh nội dung + Ảnh</>
                    )}
                  </button>
                </div>
                <RichTextEditor
                  content={formData.content || ""}
                  onChange={(html) => setFormData(prev => ({ ...prev, content: html }))}
                  placeholder="Bắt đầu viết nội dung bài viết..."
                />
              </div>

              {/* Cover Image */}
              <div className="space-y-2">
                <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">
                  Ảnh bìa
                </label>
                {formData.coverImage ? (
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-white/10 bg-white/5">
                    <img src={formData.coverImage} alt="Cover" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, coverImage: '' }))}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-lg text-white hover:bg-red-500/80 transition cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="aspect-video w-full rounded-xl border-2 border-dashed border-white/10 bg-white/5 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">Chưa có ảnh bìa</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setMediaTarget('cover')}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Image className="w-3.5 h-3.5" /> Thư viện
                  </button>
                  <label className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 flex items-center gap-1.5 transition cursor-pointer">
                    {uploadingImage ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang upload...</>
                    ) : (
                      <><Upload className="w-3.5 h-3.5" /> Upload</>
                    )}
                    <input type="file" accept="image/*" onChange={handleUploadImage} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Category + Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">
                    Chuyên mục
                  </label>
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-pink-500/50 transition-colors cursor-pointer"
                  >
                    <option value="" className="bg-[#0a0822]">-- Chưa phân loại --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id} className="bg-[#0a0822]">
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">
                    Trạng thái
                  </label>
                  <select
                    value={formData.status || "DRAFT"}
                    onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                    className="w-full px-4 py-2.5 text-sm rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-pink-500/50 transition-colors cursor-pointer"
                  >
                    <option value="DRAFT" className="bg-[#0a0822]">Draft</option>
                    <option value="PUBLISHED" className="bg-[#0a0822]">Published</option>
                    <option value="SCHEDULED" className="bg-[#0a0822]">Scheduled</option>
                  </select>
                </div>
              </div>

              {/* SEO Fields */}
              <div className="border-t border-white/5 pt-4 space-y-4">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5" /> SEO Settings
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">
                      SEO Title
                    </label>
                    <input
                      type="text"
                      value={formData.seoTitle || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, seoTitle: e.target.value }))}
                      className="w-full px-4 py-2.5 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 transition-colors"
                      placeholder="Tiêu đề SEO..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">
                      SEO Keywords
                    </label>
                    <input
                      type="text"
                      value={formData.seoKeywords || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, seoKeywords: e.target.value }))}
                      className="w-full px-4 py-2.5 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 transition-colors"
                      placeholder="từ khóa 1, từ khóa 2, ..."
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">
                    SEO Description
                  </label>
                  <textarea
                    rows={2}
                    value={formData.seoDescription || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, seoDescription: e.target.value }))}
                    className="w-full px-4 py-3 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 transition-colors resize-y"
                    placeholder="Mô tả SEO cho bài viết..."
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
              <button
                onClick={closeEdit}
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
                    <span>{isCreateMode ? "Tạo bài viết" : "Lưu thay đổi"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Library Picker Modal */}
      {mediaTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 p-6 flex flex-col space-y-4 bg-[#0c0a21]/95 max-h-[80vh]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Thư viện hình ảnh</h3>
              <button onClick={() => setMediaTarget(null)} className="text-gray-400 hover:text-white p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 overflow-y-auto grow p-1">
              {mediaLibrary.length > 0 ? (
                mediaLibrary.map((media) => (
                  <div
                    key={media.id}
                    onClick={() => { setFormData(prev => ({ ...prev, coverImage: media.url })); setMediaTarget(null); }}
                    className="relative aspect-square rounded-lg overflow-hidden border border-white/10 cursor-pointer group hover:border-pink-500/50"
                  >
                    <img src={media.url} alt={media.name} className="object-cover w-full h-full" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Check className="w-6 h-6 text-pink-400" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-12 text-center text-gray-500 text-sm">
                  Thư viện ảnh trống. Bạn có thể tải ảnh lên ở mục Thư viện Media trước.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
