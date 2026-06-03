"use client";

import React, { useState, useEffect } from "react";
import { getOrderStatus } from "@/app/actions/orders";
import { formatVND } from "@/lib/utils";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import {
  CreditCard,
  Copy,
  Check,
  CheckCircle,
  Download,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

interface Product {
  id: string;
  title: string;
  price: number;
  coverImage: string;
  maxDownloads: number;
  slug: string;
}

interface Order {
  id: string;
  productId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  status: "PENDING" | "COMPLETED" | "FAILED";
  sepayCode: string;
  downloadToken: string | null;
  product: Product;
}

interface BankDetails {
  bankId: string;
  accountNo: string;
  accountName: string;
}

interface CheckoutClientProps {
  initialOrder: Order;
  bankDetails: BankDetails;
}

export default function CheckoutClient({ initialOrder, bankDetails }: CheckoutClientProps) {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  // Poll order status every 3 seconds if status is PENDING
  useEffect(() => {
    if (order.status !== "PENDING") return;

    const interval = setInterval(async () => {
      try {
        const res = await getOrderStatus(order.id);
        if (res.success && res.status) {
          if (res.status !== order.status) {
            setOrder((prev) => ({
              ...prev,
              status: res.status as any,
              downloadToken: res.downloadToken || prev.downloadToken,
            }));
          }
        }
      } catch (err) {
        console.error("Lỗi polling trạng thái thanh toán:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [order.id, order.status]);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleManualCheck = async () => {
    if (checking) return;
    setChecking(true);
    try {
      const res = await getOrderStatus(order.id);
      if (res.success && res.status) {
        setOrder((prev) => ({
          ...prev,
          status: res.status as any,
          downloadToken: res.downloadToken || prev.downloadToken,
        }));
        if (res.status === "COMPLETED") {
          alert("Tuyệt vời! Đơn hàng của bạn đã được thanh toán.");
        } else {
          alert("Hệ thống chưa nhận được khoản thanh toán của bạn. Vui lòng đợi thêm hoặc liên hệ hỗ trợ.");
        }
      }
    } catch (err) {
      alert("Đã xảy ra lỗi khi kiểm tra.");
    } finally {
      setChecking(false);
    }
  };

  // Generate VietQR URL
  const qrUrl = `https://img.vietqr.io/image/${bankDetails.bankId}-${bankDetails.accountNo}-compact2.png?amount=${order.amount}&addInfo=${order.sepayCode}&accountName=${encodeURIComponent(bankDetails.accountName)}`;

  if (order.status === "COMPLETED") {
    return (
      <GlassCard className="max-w-2xl w-full p-8 border-pink-500/30 bg-[#0a0822]/80 space-y-6 text-center z-10 animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Thanh toán Thành công!</h2>
          <p className="text-sm text-gray-400 max-w-md mx-auto">
            Hệ thống đã nhận được tiền của bạn. Bạn có thể tải mã nguồn ngay lập tức bằng nút dưới đây.
          </p>
        </div>

        <div className="bg-white/5 border border-white/5 rounded-2xl p-6 text-left space-y-4 max-w-lg mx-auto">
          <div>
            <span className="text-[10px] text-gray-500 uppercase font-semibold">Tên sản phẩm</span>
            <h4 className="text-sm font-bold text-white mt-0.5">{order.product.title}</h4>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
            <div>
              <span className="text-[10px] text-gray-500 uppercase font-semibold">Khách hàng</span>
              <p className="text-xs text-white font-medium mt-0.5">{order.customerName}</p>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 uppercase font-semibold">Email nhận hóa đơn</span>
              <p className="text-xs text-white font-medium mt-0.5">{order.customerEmail}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 max-w-md mx-auto pt-4">
          <a
            href={`/download/${order.downloadToken}`}
            download
            className="block"
          >
            <Button
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-bold py-4 flex items-center justify-center gap-2 rounded-xl text-sm"
            >
              <Download className="w-4 h-4" />
              <span>Tải xuống Source Code (ZIP)</span>
            </Button>
          </a>

          <div className="flex items-start gap-2 bg-yellow-500/5 border border-yellow-500/10 rounded-xl p-3 text-left">
            <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
            <div className="text-[10px] text-gray-400 leading-normal">
              <strong>Lưu ý:</strong> Admin quy định mỗi liên kết mua hàng chỉ được tải tối đa{" "}
              <span className="text-yellow-400 font-bold">{order.product.maxDownloads} lần</span>. Vui lòng không chia sẻ liên kết tải xuống này với người khác.
            </div>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 gap-8 px-4 z-10 text-left">
      
      {/* Dynamic VietQR Code Panel */}
      <div className="md:col-span-5 flex flex-col items-center">
        <GlassCard className="p-6 border-white/5 bg-[#0a0822]/80 space-y-6 w-full text-center">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Quét mã VietQR để thanh toán</h3>
            <p className="text-[11px] text-gray-500">Mở ứng dụng ngân hàng và quét mã để điền thông tin tự động.</p>
          </div>

          <div className="relative aspect-square w-full max-w-[260px] mx-auto bg-white rounded-xl p-3 border border-pink-500/20 shadow-[0_0_20px_rgba(236,72,153,0.15)] flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={qrUrl} 
              alt="VietQR Chuyển Khoản"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="space-y-1.5 border-t border-white/5 pt-4 text-left">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Ngân hàng:</span>
              <span className="font-semibold text-white uppercase">{bankDetails.bankId}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Tên tài khoản:</span>
              <span className="font-semibold text-white uppercase">{bankDetails.accountName}</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Payment Information & Guidelines */}
      <div className="md:col-span-7 flex flex-col justify-center">
        <GlassCard className="p-6 border-white/5 bg-[#0a0822]/80 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5 text-pink-400" />
            </div>
            <div className="text-left">
              <h3 className="text-base font-bold text-white">Thông tin chuyển khoản thủ công</h3>
              <p className="text-[10px] text-gray-500">Dùng khi không quét được mã QR. Vui lòng copy chính xác.</p>
            </div>
          </div>

          {/* Copyable fields */}
          <div className="space-y-3.5">
            
            {/* Account Number */}
            <div className="bg-black/30 border border-white/5 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-[9px] text-gray-500 uppercase tracking-wider block font-medium">Số tài khoản</span>
                <span className="text-sm font-mono font-bold text-white">{bankDetails.accountNo}</span>
              </div>
              <button
                onClick={() => handleCopy(bankDetails.accountNo, "account")}
                className="text-gray-400 hover:text-white p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                title="Sao chép số tài khoản"
              >
                {copiedField === "account" ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Amount */}
            <div className="bg-black/30 border border-white/5 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-[9px] text-gray-500 uppercase tracking-wider block font-medium">Số tiền</span>
                <span className="text-base font-bold text-pink-400">{formatVND(order.amount)}</span>
              </div>
              <button
                onClick={() => handleCopy(order.amount.toString(), "amount")}
                className="text-gray-400 hover:text-white p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                title="Sao chép số tiền"
              >
                {copiedField === "amount" ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Transfer Memo (The vital SePay code) */}
            <div className="bg-pink-500/5 border border-pink-500/10 rounded-xl p-3.5 flex items-center justify-between shadow-[inset_0_1px_10px_rgba(236,72,153,0.05)]">
              <div>
                <span className="text-[9px] text-pink-400/80 uppercase tracking-wider block font-semibold">Nội dung chuyển khoản (Bắt buộc)</span>
                <span className="text-base font-mono font-bold text-pink-400 tracking-wider">{order.sepayCode}</span>
              </div>
              <button
                onClick={() => handleCopy(order.sepayCode, "memo")}
                className="bg-pink-500/10 border border-pink-500/20 text-pink-400 hover:text-white p-2.5 hover:bg-pink-600 rounded-xl transition-all cursor-pointer"
                title="Sao chép nội dung"
              >
                {copiedField === "memo" ? <Check className="w-4.5 h-4.5 text-white" /> : <Copy className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          {/* Guidelines */}
          <div className="flex items-center justify-center py-2.5 px-4 bg-white/5 border border-white/5 rounded-xl">
            <span className="flex items-center gap-2 text-xs text-gray-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-pink-500" />
              <span>Hệ thống tự động phát hiện giao dịch trong 15-30 giây...</span>
            </span>
          </div>

          {/* Action Row */}
          <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <button
              onClick={handleManualCheck}
              disabled={checking}
              className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5 py-2 px-3 border border-white/10 hover:border-white/20 rounded-lg bg-white/5 transition-all disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${checking ? "animate-spin" : ""}`} />
              <span>Tôi đã chuyển tiền, kiểm tra thủ công</span>
            </button>

            <a
              href="/"
              className="text-xs text-pink-400 hover:text-white font-semibold flex items-center justify-center gap-1"
            >
              <span>Quay lại trang chủ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

        </GlassCard>
      </div>

    </div>
  );
}

function Loader2({ className }: { className?: string }) {
  return <Check className={`animate-spin ${className}`} />;
}
