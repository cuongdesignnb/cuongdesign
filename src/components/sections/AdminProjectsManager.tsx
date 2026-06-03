"use client";

import { useState } from "react";
import { upsertProject, deleteProject } from "@/app/actions/projects";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { Plus, Edit2, Trash2, X, Image as ImageIcon, Check } from "lucide-react";

interface AdminProjectsManagerProps {
  initialProjects: any[];
  mediaLibrary: any[];
}

export default function AdminProjectsManager({
  initialProjects,
  mediaLibrary,
}: AdminProjectsManagerProps) {
  const [projects, setProjects] = useState(initialProjects);
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [form, setForm] = useState({
    id: "",
    title: "",
    slug: "",
    description: "",
    content: "",
    coverImage: "",
    images: [] as string[],
    category: "Web Application",
    demoUrl: "",
    githubUrl: "",
    techStack: "",
    isFeatured: false,
    order: 0,
  });

  // Media selection modal state
  const [mediaTarget, setMediaTarget] = useState<"cover" | "gallery" | null>(null);

  const openCreateModal = () => {
    setForm({
      id: "",
      title: "",
      slug: "",
      description: "",
      content: "",
      coverImage: "",
      images: [],
      category: "Web Application",
      demoUrl: "",
      githubUrl: "",
      techStack: "",
      isFeatured: false,
      order: projects.length,
    });
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const openEditModal = (project: any) => {
    setEditingProject(project);
    setForm({
      id: project.id,
      title: project.title,
      slug: project.slug,
      description: project.description,
      content: project.content,
      coverImage: project.coverImage,
      images: project.images || [],
      category: project.category || "Web Application",
      demoUrl: project.demoUrl || "",
      githubUrl: project.githubUrl || "",
      techStack: project.techStack ? project.techStack.join(", ") : "",
      isFeatured: project.isFeatured || false,
      order: project.order || 0,
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    
    setForm((prev) => {
      const updated = { ...prev, [name]: val };
      // Auto slugify if title changes and we are creating
      if (name === "title" && !prev.id) {
        updated.slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");
      }
      return updated;
    });
  };

  const selectMedia = (url: string) => {
    if (mediaTarget === "cover") {
      setForm((prev) => ({ ...prev, coverImage: url }));
    } else if (mediaTarget === "gallery") {
      setForm((prev) => ({
        ...prev,
        images: prev.images.includes(url)
          ? prev.images.filter((img) => img !== url)
          : [...prev.images, url],
      }));
    }
    setMediaTarget(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa dự án này?")) return;
    const res = await deleteProject(id);
    if (res.success) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } else {
      alert("Lỗi: " + res.error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...form,
      techStack: form.techStack
        ? form.techStack.split(",").map((t) => t.trim()).filter((t) => t.length > 0)
        : [],
    };

    const res = await upsertProject(payload);

    if (res.success) {
      // Refresh list
      if (form.id) {
        setProjects((prev) => prev.map((p) => (p.id === form.id ? res.project : p)));
      } else {
        setProjects((prev) => [...prev, res.project]);
      }
      setIsModalOpen(false);
    } else {
      alert("Lỗi khi lưu: " + res.error);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Quản lý Dự án</h2>
          <p className="text-xs text-gray-500 mt-0.5">Thêm, sửa đổi hoặc xóa các dự án trưng bày trên portfolio.</p>
        </div>
        <Button variant="primary" size="sm" onClick={openCreateModal} className="flex items-center gap-1">
          <Plus className="w-4 h-4" />
          <span>Thêm Dự án</span>
        </Button>
      </div>

      {/* Grid of Projects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <GlassCard key={project.id} className="p-6 border-white/5 bg-[#0a0822]/60 flex flex-col justify-between h-56">
            <div className="space-y-2">
              <span className="text-[10px] bg-pink-500/15 border border-pink-500/20 text-pink-400 font-mono px-2 py-0.5 rounded-full inline-block">
                {project.category}
              </span>
              <h3 className="font-bold text-white text-lg line-clamp-1">{project.title}</h3>
              <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">{project.description}</p>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-white/5 mt-4">
              <span className="text-[10px] font-mono text-gray-500">Thứ tự: {project.order}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(project)}
                  className="p-2 hover:bg-white/5 text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="p-2 hover:bg-red-500/10 text-gray-500 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-4xl glass-card border border-white/10 p-6 md:p-8 flex flex-col space-y-6 bg-[#0c0a21] my-8 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white p-2 hover:bg-white/5 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title */}
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-white">
                {form.id ? "Chỉnh sửa dự án" : "Thêm dự án mới"}
              </h3>
              <p className="text-xs text-gray-500 mt-1">Hoàn thành mẫu bên dưới để lưu thông tin dự án.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 block font-medium">Tiêu đề dự án *</label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={form.title}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: SaigonCare Web App"
                    className="glass-input w-full px-4 py-2.5 text-sm focus:outline-none"
                  />
                </div>

                {/* Slug */}
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 block font-medium">Đường dẫn thân thiện (Slug) *</label>
                  <input
                    type="text"
                    name="slug"
                    required
                    value={form.slug}
                    onChange={handleInputChange}
                    placeholder="saigoncare-web-app"
                    className="glass-input w-full px-4 py-2.5 text-sm focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs text-gray-400 block font-medium">Mô tả ngắn *</label>
                <textarea
                  name="description"
                  required
                  value={form.description}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="Viết tóm tắt ngắn về dự án hiển thị trên card..."
                  className="glass-input w-full px-4 py-2 text-sm focus:outline-none resize-none"
                />
              </div>

              {/* TipTap Rich Content Editor */}
              <div className="space-y-1">
                <label className="text-xs text-gray-400 block font-medium">Mô tả chi tiết dự án (HTML/Rich Text) *</label>
                <RichTextEditor
                  value={form.content}
                  onChange={(html) => setForm((prev) => ({ ...prev, content: html }))}
                />
              </div>

              {/* Image Selectors (Glow cover & gallery) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cover Image Selector */}
                <div className="space-y-2">
                  <label className="text-xs text-gray-400 block font-medium font-bold">Ảnh đại diện (Cover Image) *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="coverImage"
                      required
                      value={form.coverImage}
                      onChange={handleInputChange}
                      placeholder="/uploads/example.webp"
                      className="glass-input px-4 py-2 text-sm grow focus:outline-none"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setMediaTarget("cover")}
                      className="flex items-center gap-1"
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span>Chọn ảnh</span>
                    </Button>
                  </div>
                  {form.coverImage && (
                    <div className="w-20 h-12 relative rounded border border-white/10 overflow-hidden bg-black/20">
                      <img src={form.coverImage} alt="Cover preview" className="object-cover w-full h-full" />
                    </div>
                  )}
                </div>

                {/* Tech Stack Chips input */}
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 block font-medium">Công nghệ sử dụng (Cách nhau bằng dấu phẩy) *</label>
                  <input
                    type="text"
                    name="techStack"
                    required
                    value={form.techStack}
                    onChange={handleInputChange}
                    placeholder="Next.js, TypeScript, Tailwind CSS, Prisma"
                    className="glass-input w-full px-4 py-2.5 text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* Option Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 block font-medium">Danh mục *</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleInputChange}
                    className="glass-input w-full px-3 py-2.5 text-sm bg-transparent border border-white/10 rounded-xl text-gray-300 focus:outline-none"
                  >
                    <option value="Web Application" className="bg-[#0c0a21] text-white">Web Application</option>
                    <option value="E-commerce" className="bg-[#0c0a21] text-white">E-commerce</option>
                    <option value="Corporate Website" className="bg-[#0c0a21] text-white">Corporate Website</option>
                    <option value="Landing Page" className="bg-[#0c0a21] text-white">Landing Page</option>
                    <option value="Dashboard / Admin System" className="bg-[#0c0a21] text-white">Dashboard / Admin System</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400 block font-medium">Demo URL</label>
                  <input
                    type="text"
                    name="demoUrl"
                    value={form.demoUrl}
                    onChange={handleInputChange}
                    placeholder="https://demo.example.com"
                    className="glass-input w-full px-4 py-2.5 text-sm focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400 block font-medium">GitHub URL</label>
                  <input
                    type="text"
                    name="githubUrl"
                    value={form.githubUrl}
                    onChange={handleInputChange}
                    placeholder="https://github.com/user/repo"
                    className="glass-input w-full px-4 py-2.5 text-sm focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Ordering and Featured checks */}
              <div className="flex items-center gap-6 pt-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    name="isFeatured"
                    checked={form.isFeatured}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded accent-pink-500 bg-white/5 border-white/15 focus:ring-0 focus:ring-offset-0"
                  />
                  <label htmlFor="isFeatured" className="text-xs text-gray-300 font-medium select-none cursor-pointer">
                    Nổi bật (Featured Project)
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <label className="text-xs text-gray-400 font-medium">Thứ tự hiển thị:</label>
                  <input
                    type="number"
                    name="order"
                    value={form.order}
                    onChange={handleInputChange}
                    className="glass-input w-16 px-2 py-1 text-center text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={loading} size="sm" className="px-8">
                  {loading ? "Đang lưu..." : "Lưu dự án"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Internal Media Library Picker Modal */}
      {mediaTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl overflow-hidden glass-card border border-white/10 p-6 flex flex-col space-y-4 bg-[#0c0a21]/95 max-h-[80vh]">
            <button
              onClick={() => setMediaTarget(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 hover:bg-white/5 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-white">Thư viện hình ảnh</h3>
              <p className="text-xs text-gray-500 mt-0.5">Chọn một ảnh từ thư viện để sử dụng cho dự án.</p>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 overflow-y-auto grow p-1">
              {mediaLibrary.length > 0 ? (
                mediaLibrary.map((media) => (
                  <div
                    key={media.id}
                    onClick={() => selectMedia(media.url)}
                    className="relative aspect-video rounded-xl overflow-hidden border border-white/5 bg-black/20 hover:border-pink-500/50 hover:scale-105 transition-all duration-200 cursor-pointer group"
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
