"use client";

import { useState } from "react";
import { upsertProduct, deleteProduct } from "@/app/actions/products";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import { Plus, Edit2, Trash2, X, Image as ImageIcon, Check } from "lucide-react";
import { formatVND, slugify } from "@/lib/utils";

interface AdminProductsManagerProps {
  initialProducts: any[];
  mediaLibrary: any[];
}

export default function AdminProductsManager({
  initialProducts,
  mediaLibrary,
}: AdminProductsManagerProps) {
  const [products, setProducts] = useState(initialProducts);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [form, setForm] = useState({
    id: "",
    title: "",
    slug: "",
    description: "",
    price: 0,
    salePrice: "" as string | number,
    type: "SOURCE_CODE" as "SOURCE_CODE" | "TEMPLATE" | "UI_KIT" | "SERVICE",
    features: "",
    techStack: "",
    coverImage: "",
    images: [] as string[],
    demoUrl: "",
    downloadUrl: "",
    maxDownloads: 5,
    isFeatured: false,
    order: 0,
  });

  // Media selection modal state
  const [mediaTarget, setMediaTarget] = useState<"cover" | null>(null);

  const openCreateModal = () => {
    setForm({
      id: "",
      title: "",
      slug: "",
      description: "",
      price: 0,
      salePrice: "",
      type: "SOURCE_CODE",
      features: "",
      techStack: "",
      coverImage: "",
      images: [],
      demoUrl: "",
      downloadUrl: "",
      maxDownloads: 5,
      isFeatured: false,
      order: products.length,
    });
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: any) => {
    setEditingProduct(product);
    setForm({
      id: product.id,
      title: product.title,
      slug: product.slug,
      description: product.description,
      price: product.price,
      salePrice: product.salePrice !== null ? product.salePrice : "",
      type: product.type || "SOURCE_CODE",
      features: product.features ? product.features.join(", ") : "",
      techStack: product.techStack ? product.techStack.join(", ") : "",
      coverImage: product.coverImage || "",
      images: product.images || [],
      demoUrl: product.demoUrl || "",
      downloadUrl: product.downloadUrl || "",
      maxDownloads: product.maxDownloads !== undefined ? product.maxDownloads : 5,
      isFeatured: product.isFeatured || false,
      order: product.order || 0,
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    
    setForm((prev) => {
      const updated = { ...prev, [name]: val };
      // Auto slugify if title changes (handles both creation and update)
      if (name === "title") {
        updated.slug = slugify(value);
      } else if (name === "slug") {
        // Enforce valid slug formatting if they manually edit it
        updated.slug = slugify(value);
      }
      return updated;
    });
  };

  const selectMedia = (url: string) => {
    if (mediaTarget === "cover") {
      setForm((prev) => ({ ...prev, coverImage: url }));
    }
    setMediaTarget(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
    const res = await deleteProduct(id);
    if (res.success) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } else {
      alert("Lỗi: " + res.error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...form,
      price: Number(form.price),
      salePrice: form.salePrice !== "" ? Number(form.salePrice) : undefined,
      maxDownloads: Number(form.maxDownloads),
      features: form.features
        ? form.features.split(",").map((f) => f.trim()).filter((f) => f.length > 0)
        : [],
      techStack: form.techStack
        ? form.techStack.split(",").map((t) => t.trim()).filter((t) => t.length > 0)
        : [],
    };

    const res = await upsertProduct(payload);

    if (res.success) {
      // Refresh list
      if (form.id) {
        setProducts((prev) => prev.map((p) => (p.id === form.id ? res.product : p)));
      } else {
        setProducts((prev) => [...prev, res.product]);
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
          <h2 className="text-2xl font-bold text-white">Quản lý Sản phẩm số</h2>
          <p className="text-xs text-gray-500 mt-0.5">Thêm, sửa đổi hoặc xóa các template, source code hoặc bộ UI kit.</p>
        </div>
        <Button variant="primary" size="sm" onClick={openCreateModal} className="flex items-center gap-1">
          <Plus className="w-4 h-4" />
          <span>Thêm Sản phẩm</span>
        </Button>
      </div>

      {/* Grid of Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <GlassCard key={product.id} className="p-6 border-white/5 bg-[#0a0822]/60 flex flex-col justify-between h-60">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] bg-purple-500/15 border border-purple-500/20 text-purple-400 font-mono px-2 py-0.5 rounded-full">
                  {product.type}
                </span>
                <span className="text-sm font-bold text-white">
                  {product.price === 0 ? "Miễn phí (Free)" : formatVND(product.price)}
                </span>
              </div>
              <h3 className="font-bold text-white text-lg line-clamp-1">{product.title}</h3>
              <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">{product.description}</p>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-white/5 mt-4">
              <span className="text-[10px] font-mono text-gray-500">Giới hạn tải: {product.maxDownloads}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(product)}
                  className="p-2 hover:bg-white/5 text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
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
                {form.id ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
              </h3>
              <p className="text-xs text-gray-500 mt-1">Hoàn thành mẫu bên dưới để lưu thông tin sản phẩm.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 block font-medium">Tiêu đề sản phẩm *</label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={form.title}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: ShopBase - E-commerce"
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
                    placeholder="shopbase-ecommerce"
                    className="glass-input w-full px-4 py-2.5 text-sm focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs text-gray-400 block font-medium">Mô tả sản phẩm *</label>
                <textarea
                  name="description"
                  required
                  value={form.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Mô tả các tính năng cốt lõi của sản phẩm..."
                  className="glass-input w-full px-4 py-2 text-sm focus:outline-none resize-none"
                />
              </div>

              {/* Image Selectors (Glow cover) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cover Image Selector */}
                <div className="space-y-2">
                  <label className="text-xs text-gray-400 block font-medium">Ảnh đại diện (Cover Image) *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="coverImage"
                      required
                      value={form.coverImage}
                      onChange={handleInputChange}
                      placeholder="/uploads/product.webp"
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
                  <label className="text-xs text-gray-400 block font-medium">Công nghệ tích hợp (Phân tách bằng dấu phẩy) *</label>
                  <input
                    type="text"
                    name="techStack"
                    required
                    value={form.techStack}
                    onChange={handleInputChange}
                    placeholder="Laravel, MySQL, Tailwind CSS"
                    className="glass-input w-full px-4 py-2.5 text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* Pricing, type and downloads */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 block font-medium font-bold text-pink-400">Giá bán (VNĐ) *</label>
                  <input
                    type="number"
                    name="price"
                    required
                    value={form.price}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="glass-input w-full px-4 py-2.5 text-sm focus:outline-none font-semibold text-white"
                  />
                  <span className="text-[10px] text-gray-500">Giá = 0: Trực tiếp mở form liên hệ</span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400 block font-medium">Giá khuyến mãi (VNĐ)</label>
                  <input
                    type="number"
                    name="salePrice"
                    value={form.salePrice}
                    onChange={handleInputChange}
                    placeholder="Để trống nếu không giảm"
                    className="glass-input w-full px-4 py-2.5 text-sm focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400 block font-medium">Loại sản phẩm *</label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleInputChange}
                    className="glass-input w-full px-3 py-2.5 text-sm bg-transparent border border-white/10 rounded-xl text-gray-300 focus:outline-none"
                  >
                    <option value="SOURCE_CODE" className="bg-[#0c0a21] text-white">SOURCE_CODE</option>
                    <option value="TEMPLATE" className="bg-[#0c0a21] text-white">TEMPLATE</option>
                    <option value="UI_KIT" className="bg-[#0c0a21] text-white">UI_KIT</option>
                    <option value="SERVICE" className="bg-[#0c0a21] text-white">SERVICE</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400 block font-medium">Giới hạn số lần tải *</label>
                  <input
                    type="number"
                    name="maxDownloads"
                    required
                    value={form.maxDownloads}
                    onChange={handleInputChange}
                    placeholder="5"
                    className="glass-input w-full px-4 py-2.5 text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* Product specifications and downloads */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs text-gray-400 block font-medium">Danh sách tính năng nổi bật (Cách nhau bởi dấu phẩy)</label>
                  <input
                    type="text"
                    name="features"
                    value={form.features}
                    onChange={handleInputChange}
                    placeholder="Responsive, Quản trị Admin, Tối ưu SEO 100%"
                    className="glass-input w-full px-4 py-2.5 text-sm focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400 block font-medium">Đường dẫn Demo URL</label>
                  <input
                    type="text"
                    name="demoUrl"
                    value={form.demoUrl}
                    onChange={handleInputChange}
                    placeholder="https://demo.example.com"
                    className="glass-input w-full px-4 py-2.5 text-sm focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 block font-medium font-bold text-purple-400">File Zip tải về (Đường dẫn bảo mật)</label>
                  <input
                    type="text"
                    name="downloadUrl"
                    value={form.downloadUrl}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: /uploads/shopbase-source-code.zip"
                    className="glass-input w-full px-4 py-2.5 text-sm focus:outline-none font-mono"
                  />
                  <span className="text-[10px] text-gray-500">Giấu bên ngoài thư mục public để tránh tải lậu trực tiếp</span>
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
                    Nổi bật (Featured Product)
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
                  {loading ? "Đang lưu..." : "Lưu sản phẩm"}
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
              <p className="text-xs text-gray-500 mt-0.5">Chọn một ảnh từ thư viện để sử dụng cho sản phẩm.</p>
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
