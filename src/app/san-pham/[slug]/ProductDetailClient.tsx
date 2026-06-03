"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createProductReview } from "@/app/actions/reviews";
import { createOrder } from "@/app/actions/orders";
import { formatVND } from "@/lib/utils";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import {
  ShoppingBag,
  Send,
  X,
  CreditCard,
  CheckCircle2,
  Star,
  MessageSquare,
  ShieldCheck,
  Calendar,
  Eye,
  Download,
} from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    name: string | null;
    avatar: string | null;
  };
}

interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  salePrice: number | null;
  type: string;
  features: string[];
  techStack: string[];
  coverImage: string;
  images: string[];
  demoUrl: string | null;
  maxDownloads: number;
}

interface ProductDetailClientProps {
  product: Product;
  reviews: Review[];
  isLoggedIn: boolean;
}

export default function ProductDetailClient({
  product,
  reviews,
  isLoggedIn,
}: ProductDetailClientProps) {
  const router = useRouter();

  // Review states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMsg, setReviewMsg] = useState<{ success: boolean; text: string } | null>(null);

  // Buy modal states
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutFormData, setCheckoutFormData] = useState({ name: "", email: "", phone: "" });
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);

  // Free code modal states
  const [showFreeModal, setShowFreeModal] = useState(false);
  const [freeFormData, setFreeFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [freeSubmitting, setFreeSubmitting] = useState(false);
  const [freeSuccess, setFreeSuccess] = useState(false);

  // Rating metrics
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
    : "0.0";

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || reviewSubmitting) return;

    setReviewSubmitting(true);
    setReviewMsg(null);

    try {
      const res = await createProductReview({
        productId: product.id,
        rating,
        comment,
      });

      if (res.success) {
        setReviewMsg({ success: true, text: res.message || "Đã gửi nhận xét thành công!" });
        setComment("");
        setRating(5);
        router.refresh();
      } else {
        setReviewMsg({ success: false, text: res.error || "Gửi nhận xét thất bại." });
      }
    } catch (err: any) {
      setReviewMsg({ success: false, text: "Lỗi kết nối: " + err.message });
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutSubmitting(true);

    try {
      const res = await createOrder({
        productId: product.id,
        customerName: checkoutFormData.name,
        customerEmail: checkoutFormData.email,
        customerPhone: checkoutFormData.phone || undefined,
      });

      if (res.success && res.orderId) {
        setShowCheckoutModal(false);
        router.push(`/thanh-toan/${res.orderId}`);
      } else {
        alert("Lỗi: " + (res.error || "Không thể tạo đơn hàng"));
      }
    } catch (err) {
      alert("Đã xảy ra lỗi hệ thống khi mua hàng.");
    } finally {
      setCheckoutSubmitting(false);
    }
  };

  const handleFreeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFreeSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: freeFormData.name,
          email: freeFormData.email,
          phone: freeFormData.phone,
          subject: `Yêu cầu mã nguồn miễn phí: ${product.title}`,
          message: freeFormData.message || `Tôi muốn nhận source code miễn phí của sản phẩm "${product.title}".`,
          productId: product.id,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFreeSuccess(true);
      } else {
        alert("Lỗi: " + (data.error || "Không thể gửi yêu cầu"));
      }
    } catch (err) {
      alert("Lỗi kết nối mạng.");
    } finally {
      setFreeSubmitting(false);
    }
  };

  const finalPrice = product.salePrice !== null ? product.salePrice : product.price;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* Left Column (8 cols): Description & Reviews */}
      <div className="lg:col-span-8 space-y-8 text-left">
        
        {/* Description & Features */}
        <GlassCard className="p-6 md:p-8 border-white/5 bg-[#0a0822]/60 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-pink-500" />
              <span>Chi tiết tính năng sản phẩm</span>
            </h3>
            <p className="text-gray-400 text-xs mt-2 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Các tính năng nổi bật</h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-300">
              {product.features.map((feat, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-400 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        </GlassCard>

        {/* Dynamic Reviews Module */}
        <GlassCard className="p-6 md:p-8 border-white/5 bg-[#0a0822]/60 space-y-6">
          <div className="border-b border-white/5 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-500" />
              <span>Đánh giá từ khách hàng ({totalReviews})</span>
            </h3>
            
            {totalReviews > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-white">{avgRating}</span>
                <div className="flex text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4.5 h-4.5 ${
                        i < Math.round(Number(avgRating)) ? "fill-current" : "opacity-30"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500">/ 5.0 sao</span>
              </div>
            )}
          </div>

          {/* List of approved reviews */}
          <div className="space-y-4">
            {reviews.length > 0 ? (
              reviews.map((rev) => (
                <div key={rev.id} className="bg-black/20 border border-white/5 rounded-2xl p-4 flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-pink-500/10 border border-pink-500/20 flex items-center justify-center font-bold text-pink-400 text-sm shrink-0">
                    {rev.user?.name?.[0] || "U"}
                  </div>
                  
                  <div className="grow space-y-1 text-left">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-white">{rev.user?.name || "Khách hàng"}</h5>
                      <span className="text-[10px] text-gray-500">
                        {new Date(rev.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>

                    <div className="flex text-yellow-500 pb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i < rev.rating ? "fill-current" : "opacity-30"}`}
                        />
                      ))}
                    </div>

                    <p className="text-xs text-gray-400 leading-normal">{rev.comment}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-gray-600 bg-black/10 border border-white/5 rounded-2xl">
                Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên trải nghiệm và chia sẻ!
              </div>
            )}
          </div>

          {/* Write a Review Section */}
          <div className="border-t border-white/5 pt-6 space-y-4">
            <h4 className="text-sm font-bold text-white">Viết nhận xét của bạn</h4>
            
            {isLoggedIn ? (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                {/* Rating selection (Stars) */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Đánh giá của bạn:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((starVal) => (
                      <button
                        key={starVal}
                        type="button"
                        onClick={() => setRating(starVal)}
                        className="text-yellow-500 hover:scale-115 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`w-5 h-5 ${starVal <= rating ? "fill-current" : "opacity-30"}`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 font-mono">({rating} sao)</span>
                </div>

                {/* Comment area */}
                <div className="space-y-1">
                  <textarea
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Chia sẻ nhận xét của bạn về chất lượng mã nguồn, độ sạch và hỗ trợ của sản phẩm..."
                    rows={4}
                    className="glass-input w-full px-4 py-3 text-xs text-white placeholder-gray-600 focus:outline-none resize-y"
                  />
                </div>

                {reviewMsg && (
                  <p className={`text-xs font-semibold ${reviewMsg.success ? "text-green-400" : "text-red-400"}`}>
                    {reviewMsg.text}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={reviewSubmitting || !comment.trim()}
                  className="bg-pink-600 hover:bg-pink-500 text-white px-6 font-semibold py-2.5 flex items-center justify-center gap-1.5"
                >
                  {reviewSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Gửi đánh giá</span>
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-xl text-xs text-center text-gray-400">
                Bạn cần{" "}
                <Link href="/login" className="text-pink-400 font-bold hover:underline">
                  Đăng nhập
                </Link>{" "}
                bằng tài khoản mua hàng để có thể viết đánh giá cho sản phẩm.
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Right Column (4 cols): Pricing & Specs card */}
      <div className="lg:col-span-4 space-y-6 text-left">
        <GlassCard className="p-6 border-white/5 bg-[#0a0822]/80 space-y-4">
          <div className="space-y-0.5">
            <span className="text-[10px] text-pink-500 font-bold tracking-widest font-mono uppercase">
              {product.type}
            </span>
            <h4 className="text-base font-bold text-white leading-snug">{product.title}</h4>
          </div>

          <div className="border-t border-b border-white/5 py-4">
            <span className="text-[9px] text-gray-500 uppercase tracking-widest block">Giá bán</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-white">
                {product.price === 0 ? "MIỄN PHÍ" : formatVND(finalPrice)}
              </span>
              {product.salePrice !== null && product.price > 0 && (
                <span className="text-xs text-gray-500 line-through">
                  {formatVND(product.price)}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Giới hạn tải xuống:</span>
              <span className="font-semibold text-white">Tối đa {product.maxDownloads} lần</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Định dạng file:</span>
              <span className="font-semibold text-pink-400 font-mono">.ZIP (Source code)</span>
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold block mb-1">
              Stack công nghệ
            </span>
            <div className="flex flex-wrap gap-1.5">
              {product.techStack.map((tech) => (
                <span
                  key={tech}
                  className="text-[10px] bg-white/5 border border-white/5 rounded-md px-2.5 py-0.5 text-gray-300 font-mono"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Call to actions */}
        <div className="space-y-3">
          {product.price === 0 ? (
            <Button
              onClick={() => {
                setFreeSuccess(false);
                setFreeFormData({ name: "", email: "", phone: "", message: "" });
                setShowFreeModal(true);
              }}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3.5 flex items-center justify-center gap-2 rounded-xl text-sm"
            >
              <Download className="w-4 h-4" />
              <span>Tải xuống Miễn phí (Free)</span>
            </Button>
          ) : (
            <Button
              onClick={() => {
                setCheckoutFormData({ name: "", email: "", phone: "" });
                setShowCheckoutModal(true);
              }}
              className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-3.5 flex items-center justify-center gap-2 rounded-xl text-sm"
            >
              <CreditCard className="w-4 h-4" />
              <span>Mua Ngay & Nhận Code</span>
            </Button>
          )}

          {product.demoUrl && (
            <a href={product.demoUrl} target="_blank" rel="noreferrer" className="block">
              <Button variant="outline" className="w-full font-semibold py-3.5 flex items-center justify-center gap-2 rounded-xl text-sm">
                <Eye className="w-4 h-4" />
                <span>Xem Demo Thực Tế</span>
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Paid Product Checkout modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg overflow-hidden glass-card border border-white/10 p-8 flex flex-col space-y-6 bg-[#0c0a21]/95 rounded-2xl">
            <button
              onClick={() => setShowCheckoutModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2 text-left">
                <CreditCard className="w-6 h-6 text-pink-500" />
                <span>Thông tin thanh toán</span>
              </h3>
              <p className="text-xs text-gray-400 mt-1 text-left">
                Nhập email của bạn để nhận mã kích hoạt tải file `.zip` sau khi hoàn tất giao dịch.
              </p>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-xs text-gray-400 block font-medium">Họ và tên *</label>
                <input
                  type="text"
                  required
                  value={checkoutFormData.name}
                  onChange={(e) => setCheckoutFormData((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Nguyễn Văn A"
                  className="glass-input w-full px-4 py-2.5 text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 block font-medium">Email nhận Code *</label>
                  <input
                    type="email"
                    required
                    value={checkoutFormData.email}
                    onChange={(e) => setCheckoutFormData((p) => ({ ...p, email: e.target.value }))}
                    placeholder="client@gmail.com"
                    className="glass-input w-full px-4 py-2.5 text-sm focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 block font-medium">Số điện thoại / Zalo</label>
                  <input
                    type="tel"
                    value={checkoutFormData.phone}
                    onChange={(e) => setCheckoutFormData((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="0912345678"
                    className="glass-input w-full px-4 py-2.5 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-medium">Tổng thanh toán:</span>
                  <span className="text-lg font-bold text-pink-400">{formatVND(finalPrice)}</span>
                </div>
              </div>

              <Button
                type="submit"
                disabled={checkoutSubmitting}
                className="w-full flex items-center justify-center gap-2 pt-3 bg-pink-600 hover:bg-pink-500 font-bold"
              >
                {checkoutSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Lấy mã QR & Thanh toán</span>
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Free Product request modal */}
      {showFreeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg overflow-hidden glass-card border border-white/10 p-8 flex flex-col space-y-6 bg-[#0c0a21]/95 rounded-2xl">
            <button
              onClick={() => setShowFreeModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl md:text-2xl font-bold text-white text-left">Đăng ký nhận mã nguồn miễn phí</h3>
              <p className="text-xs text-gray-400 mt-1 text-left">
                Điền thông tin bên dưới, hệ thống sẽ liên hệ gửi mã nguồn trực tiếp cho bạn qua email.
              </p>
            </div>

            {freeSuccess ? (
              <div className="flex flex-col items-center justify-center text-center py-6 space-y-4">
                <CheckCircle2 className="w-14 h-14 text-green-400 animate-bounce" />
                <h4 className="text-base font-semibold text-white">Yêu cầu được gửi đi thành công!</h4>
                <p className="text-xs text-gray-400 max-w-xs leading-normal">
                  Cảm ơn bạn. Tôi sẽ kiểm tra hộp thư và gửi mã nguồn cùng tài liệu hướng dẫn cài đặt sớm nhất qua email của bạn.
                </p>
                <Button variant="outline" size="sm" onClick={() => setShowFreeModal(false)}>
                  Đóng cửa sổ
                </Button>
              </div>
            ) : (
              <form onSubmit={handleFreeSubmit} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 block font-medium">Họ và tên *</label>
                  <input
                    type="text"
                    required
                    value={freeFormData.name}
                    onChange={(e) => setFreeFormData((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Nguyễn Văn A"
                    className="glass-input w-full px-4 py-2.5 text-sm focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 block font-medium">Email của bạn *</label>
                    <input
                      type="email"
                      required
                      value={freeFormData.email}
                      onChange={(e) => setFreeFormData((p) => ({ ...p, email: e.target.value }))}
                      placeholder="client@gmail.com"
                      className="glass-input w-full px-4 py-2.5 text-sm focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 block font-medium">Số điện thoại / Zalo *</label>
                    <input
                      type="tel"
                      required
                      value={freeFormData.phone}
                      onChange={(e) => setFreeFormData((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="0912345678"
                      className="glass-input w-full px-4 py-2.5 text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400 block font-medium">Lời nhắn thêm (Tùy chọn)</label>
                  <textarea
                    value={freeFormData.message}
                    onChange={(e) => setFreeFormData((p) => ({ ...p, message: e.target.value }))}
                    rows={3}
                    placeholder="Tôi muốn xin source code và tài liệu lắp đặt..."
                    className="glass-input w-full px-4 py-2 text-sm focus:outline-none resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={freeSubmitting}
                  className="w-full flex items-center justify-center gap-2 pt-3 bg-pink-600 hover:bg-pink-500 font-bold"
                >
                  {freeSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Gửi yêu cầu nhận Code</span>
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Simple loader helper to show in form submits
function Loader2({ className }: { className?: string }) {
  return <Star className={`animate-spin ${className}`} />;
}
