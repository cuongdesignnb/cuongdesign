"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";
import { createOrder } from "@/app/actions/orders";
import { formatVND } from "@/lib/utils";
import Button from "@/components/ui/Button";
import {
  Monitor,
  Tablet,
  Smartphone,
  ArrowLeft,
  ShoppingBag,
  Download,
  CreditCard,
  Send,
  X,
  CheckCircle2,
  Star,
  MessageSquare,
} from "lucide-react";

interface PreviewItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  demoUrl: string;
  price?: number;
  salePrice?: number | null;
  type?: string;
  features?: string[];
  techStack?: string[];
  coverImage?: string;
  images?: string[];
  maxDownloads?: number;
}

interface PreviewClientProps {
  item: PreviewItem;
  isProject?: boolean;
}

export default function PreviewClient({ item, isProject = false }: PreviewClientProps) {
  const router = useRouter();
  const toast = useToast();
  const [viewMode, setViewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");

  // Buy modal states (product only)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutFormData, setCheckoutFormData] = useState({ name: "", email: "", phone: "" });
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);

  // Free code modal states (product only)
  const [showFreeModal, setShowFreeModal] = useState(false);
  const [freeFormData, setFreeFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [freeSubmitting, setFreeSubmitting] = useState(false);
  const [freeSuccess, setFreeSuccess] = useState(false);

  // Project consultation modal states (project only)
  const [showConsultModal, setShowConsultModal] = useState(false);
  const [consultFormData, setConsultFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [consultSubmitting, setConsultSubmitting] = useState(false);
  const [consultSuccess, setConsultSuccess] = useState(false);

  const finalPrice = !isProject && item.salePrice !== null && item.salePrice !== undefined ? item.salePrice : (item.price || 0);

  // Prevent right-click, F12, Ctrl+Shift+I/J/C, Ctrl+U
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      toast.warning(
        "Hành động bị chặn!",
        "Thao tác click chuột phải đã bị vô hiệu hóa để bảo vệ bản quyền giao diện."
      );
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === "F12") {
        e.preventDefault();
        toast.warning(
          "Hành động bị chặn!",
          "Phím F12 đã bị vô hiệu hóa để bảo vệ bản quyền giao diện."
        );
        return;
      }

      // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
      if (
        e.ctrlKey &&
        e.shiftKey &&
        (e.key === "I" ||
          e.key === "J" ||
          e.key === "C" ||
          e.key === "i" ||
          e.key === "j" ||
          e.key === "c")
      ) {
        e.preventDefault();
        toast.warning(
          "Hành động bị chặn!",
          "Developer Tools đã bị vô hiệu hóa để bảo vệ bản quyền giao diện."
        );
        return;
      }

      // Ctrl+U (View Source)
      if (e.ctrlKey && (e.key === "U" || e.key === "u")) {
        e.preventDefault();
        toast.warning(
          "Hành động bị chặn!",
          "Xem mã nguồn (View Source) đã bị vô hiệu hóa."
        );
        return;
      }
    };

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [toast]);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutSubmitting(true);

    try {
      const res = await createOrder({
        productId: item.id,
        customerName: checkoutFormData.name,
        customerEmail: checkoutFormData.email,
        customerPhone: checkoutFormData.phone || undefined,
      });

      if (res.success && res.orderId) {
        setShowCheckoutModal(false);
        router.push(`/thanh-toan/${res.orderId}`);
      } else {
        toast.error("Lỗi giao dịch", res.error || "Không thể tạo đơn hàng.");
      }
    } catch (err) {
      toast.error("Lỗi hệ thống", "Đã xảy ra lỗi khi tạo đơn hàng.");
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
          subject: `Yêu cầu mã nguồn miễn phí từ Live Preview: ${item.title}`,
          message:
            freeFormData.message ||
            `Tôi muốn xin source code miễn phí của sản phẩm "${item.title}" từ trang Live Preview.`,
          productId: item.id,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFreeSuccess(true);
        toast.success("Đăng ký thành công!", "Yêu cầu của bạn đã được tiếp nhận.");
      } else {
        toast.error("Gửi thất bại", data.error || "Không thể gửi yêu cầu.");
      }
    } catch (err) {
      toast.error("Lỗi kết nối", "Đã xảy ra lỗi kết nối mạng.");
    } finally {
      setFreeSubmitting(false);
    }
  };

  const handleConsultSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConsultSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: consultFormData.name,
          email: consultFormData.email,
          phone: consultFormData.phone,
          subject: `Yêu cầu tư vấn thiết kế từ Live Preview: ${item.title}`,
          message:
            consultFormData.message ||
            `Tôi quan tâm đến dự án "${item.title}" và muốn yêu cầu tư vấn thiết kế một website/ứng dụng tương tự từ trang Live Preview.`,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setConsultSuccess(true);
        toast.success("Gửi yêu cầu thành công!", "Cường sẽ liên hệ lại với bạn sớm nhất.");
      } else {
        toast.error("Gửi thất bại", data.error || "Không thể gửi yêu cầu.");
      }
    } catch (err) {
      toast.error("Lỗi kết nối", "Đã xảy ra lỗi kết nối mạng.");
    } finally {
      setConsultSubmitting(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#030014] overflow-hidden text-gray-200">
      
      {/* ─── LIVE PREVIEW BAR ─────────────────────────────────── */}
      <header className="h-16 w-full flex items-center justify-between border-b border-white/10 bg-[#0a0822]/90 backdrop-blur-md px-4 sm:px-6 z-40 shrink-0">
        
        {/* Left: Back button & Title */}
        <div className="flex items-center gap-3">
          <Link
            href={isProject ? `/du-an/${item.slug}` : `/san-pham/${item.slug}`}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-400 hover:text-white transition-colors py-1.5 px-3 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Quay lại chi tiết</span>
          </Link>
          <div className="h-4 w-px bg-white/10 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
            </span>
            <span className="text-xs sm:text-sm font-bold text-white tracking-tight leading-none max-w-[120px] sm:max-w-none truncate">
              {item.title}
            </span>
          </div>
        </div>

        {/* Middle: Device Switcher */}
        <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 gap-1">
          <button
            onClick={() => setViewMode("desktop")}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === "desktop"
                ? "bg-pink-500/20 text-pink-400 border border-pink-500/30"
                : "text-gray-400 hover:text-white border border-transparent"
            }`}
            title="Desktop View"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("tablet")}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === "tablet"
                ? "bg-pink-500/20 text-pink-400 border border-pink-500/30"
                : "text-gray-400 hover:text-white border border-transparent"
            }`}
            title="Tablet View"
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("mobile")}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === "mobile"
                ? "bg-pink-500/20 text-pink-400 border border-pink-500/30"
                : "text-gray-400 hover:text-white border border-transparent"
            }`}
            title="Mobile View"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Buy/Get code or consultation action */}
        <div>
          {isProject ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setConsultSuccess(false);
                setConsultFormData({ name: "", email: "", phone: "", message: "" });
                setShowConsultModal(true);
              }}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white text-[10px] sm:text-xs font-bold py-1.5 px-3 sm:px-4 rounded-xl flex items-center gap-1 cursor-pointer shrink-0 shadow-[0_0_15px_rgba(236,72,153,0.3)] hover:shadow-[0_0_20px_rgba(236,72,153,0.5)] transition-all duration-300"
            >
              <MessageSquare className="w-3.5 h-3.5 shrink-0" />
              <span>Liên hệ tư vấn</span>
            </Button>
          ) : item.price === 0 ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setFreeSuccess(false);
                setFreeFormData({ name: "", email: "", phone: "", message: "" });
                setShowFreeModal(true);
              }}
              className="bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 text-[10px] sm:text-xs font-bold py-1.5 px-3 sm:px-4 rounded-xl flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải Miễn Phí</span>
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-pink-400 hidden md:inline">
                {formatVND(finalPrice)}
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setCheckoutFormData({ name: "", email: "", phone: "" });
                  setShowCheckoutModal(true);
                }}
                className="text-[10px] sm:text-xs font-bold py-1.5 px-3 sm:px-4 rounded-xl flex items-center gap-1 cursor-pointer shrink-0"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Mua ngay</span>
              </Button>
            </div>
          )}
        </div>

      </header>

      {/* ─── WORKSPACE / IFRAME ─────────────────────────────── */}
      <div className="grow w-full bg-[#030014] flex items-center justify-center p-4 overflow-hidden relative">
        
        {/* Decorative Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none select-none z-0" />

        {/* Device Frame Wrapper */}
        <div
          className={`
            relative bg-black transition-all duration-300 shadow-2xl flex flex-col
            ${
              viewMode === "desktop"
                ? "w-full h-full border-none rounded-none"
                : viewMode === "tablet"
                ? "w-[768px] max-w-full h-[95%] border-[12px] border-[#1e1c2e] rounded-[32px]"
                : "w-[375px] max-w-full h-[90%] border-[12px] border-[#1e1c2e] rounded-[42px]"
            }
          `}
        >
          {/* Tablet/Mobile Speaker Pill/Camera Notch decoration */}
          {viewMode !== "desktop" && (
            <div className="absolute top-[-8px] left-1/2 -translate-x-1/2 w-16 h-3 bg-[#1e1c2e] rounded-b-lg z-50 flex items-center justify-center">
              <div className="w-8 h-1 bg-[#2e2c40] rounded-full" />
            </div>
          )}

          {/* Actual IFrame content */}
          <iframe
            src={item.demoUrl}
            title={`Live Demo of ${item.title}`}
            className="w-full h-full border-none bg-white rounded-lg select-none"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        </div>
      </div>

      {/* ─── MODALS ─────────────────────────────────────────── */}
      
      {/* Paid Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
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
                  <Star className="w-4 h-4 animate-spin text-white" />
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

      {/* Free Product Modal */}
      {showFreeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
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
                    <Star className="w-4 h-4 animate-spin text-white" />
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

      {/* Project Consultation Modal */}
      {showConsultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg overflow-hidden glass-card border border-white/10 p-8 flex flex-col space-y-6 bg-[#0c0a21]/95 rounded-2xl">
            <button
              onClick={() => setShowConsultModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2 text-left">
                <MessageSquare className="w-6 h-6 text-pink-500" />
                <span>Liên hệ tư vấn thiết kế</span>
              </h3>
              <p className="text-xs text-gray-400 mt-1 text-left">
                Bạn muốn làm một website hoặc ứng dụng tương tự dự án <strong className="text-pink-400">{item.title}</strong>? Nhập thông tin liên hệ của bạn bên dưới.
              </p>
            </div>

            {consultSuccess ? (
              <div className="flex flex-col items-center justify-center text-center py-6 space-y-4">
                <CheckCircle2 className="w-14 h-14 text-green-400 animate-bounce" />
                <h4 className="text-base font-semibold text-white">Gửi yêu cầu thành công!</h4>
                <p className="text-xs text-gray-400 max-w-xs leading-normal">
                  Cảm ơn bạn. Cường đã tiếp nhận yêu cầu và sẽ liên hệ trực tiếp với bạn qua số điện thoại/Zalo hoặc Email sớm nhất để trao đổi thêm.
                </p>
                <Button variant="outline" size="sm" onClick={() => setShowConsultModal(false)}>
                  Đóng cửa sổ
                </Button>
              </div>
            ) : (
              <form onSubmit={handleConsultSubmit} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 block font-medium">Họ và tên *</label>
                  <input
                    type="text"
                    required
                    value={consultFormData.name}
                    onChange={(e) => setConsultFormData((p) => ({ ...p, name: e.target.value }))}
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
                      value={consultFormData.email}
                      onChange={(e) => setConsultFormData((p) => ({ ...p, email: e.target.value }))}
                      placeholder="client@gmail.com"
                      className="glass-input w-full px-4 py-2.5 text-sm focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 block font-medium">Số điện thoại / Zalo *</label>
                    <input
                      type="tel"
                      required
                      value={consultFormData.phone}
                      onChange={(e) => setConsultFormData((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="0912345678"
                      className="glass-input w-full px-4 py-2.5 text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400 block font-medium">Yêu cầu cụ thể của bạn (Tùy chọn)</label>
                  <textarea
                    value={consultFormData.message}
                    onChange={(e) => setConsultFormData((p) => ({ ...p, message: e.target.value }))}
                    rows={3}
                    placeholder={`Tôi muốn xin tư vấn thiết kế và báo giá chi tiết cho website tương tự như "${item.title}"...`}
                    className="glass-input w-full px-4 py-2 text-sm focus:outline-none resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={consultSubmitting}
                  className="w-full flex items-center justify-center gap-2 pt-3 bg-pink-600 hover:bg-pink-500 font-bold"
                >
                  {consultSubmitting ? (
                    <Star className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Gửi yêu cầu tư vấn</span>
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
