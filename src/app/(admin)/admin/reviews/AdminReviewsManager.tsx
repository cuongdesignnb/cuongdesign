"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { approveReview, rejectReview, deleteReview } from "@/app/actions/admin-reviews";
import {
  Star,
  CheckCircle2,
  XCircle,
  Trash2,
  MessageSquare,
  ShieldCheck,
  Clock,
  Search,
} from "lucide-react";

interface ReviewItem {
  id: string;
  productId: string;
  userId: string | null;
  rating: number;
  comment: string | null;
  isApproved: boolean;
  createdAt: string;
  product: { title: string };
  user: { name: string | null; email: string } | null;
}

interface AdminReviewsManagerProps {
  initialReviews: ReviewItem[];
  initialPendingCount: number;
}

type FilterTab = "ALL" | "PENDING" | "APPROVED";

function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5 text-sm">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= rating ? "text-yellow-400" : "text-gray-600"}>
          {i <= rating ? "★" : "☆"}
        </span>
      ))}
    </span>
  );
}

export default function AdminReviewsManager({
  initialReviews,
  initialPendingCount,
}: AdminReviewsManagerProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterTab>("ALL");

  const filteredReviews =
    filter === "ALL"
      ? initialReviews
      : filter === "PENDING"
        ? initialReviews.filter((r) => !r.isApproved)
        : initialReviews.filter((r) => r.isApproved);

  const stats = {
    total: initialReviews.length,
    pending: initialReviews.filter((r) => !r.isApproved).length,
    approved: initialReviews.filter((r) => r.isApproved).length,
  };

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "ALL", label: "Tất cả", count: stats.total },
    { key: "PENDING", label: "Chờ duyệt", count: stats.pending },
    { key: "APPROVED", label: "Đã duyệt", count: stats.approved },
  ];

  const handleApprove = async (id: string) => {
    try {
      const res = await approveReview(id);
      if (res.success) {
        router.refresh();
      } else {
        alert("Lỗi: " + res.error);
      }
    } catch (err: any) {
      alert("Đã xảy ra lỗi: " + err.message);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await rejectReview(id);
      if (res.success) {
        router.refresh();
      } else {
        alert("Lỗi: " + res.error);
      }
    } catch (err: any) {
      alert("Đã xảy ra lỗi: " + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) return;
    try {
      const res = await deleteReview(id);
      if (res.success) {
        router.refresh();
      } else {
        alert("Lỗi: " + res.error);
      }
    } catch (err: any) {
      alert("Đã xảy ra lỗi: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-white/5 bg-[#0a0822]/50 p-4 flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-pink-500" />
          <div>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-xs text-gray-500">Tổng đánh giá</p>
          </div>
        </div>
        <div className="rounded-xl border border-white/5 bg-[#0a0822]/50 p-4 flex items-center gap-3">
          <Clock className="w-5 h-5 text-red-400" />
          <div>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-white">{stats.pending}</p>
              {stats.pending > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/20">
                  Cần duyệt
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">Chờ duyệt</p>
          </div>
        </div>
        <div className="rounded-xl border border-white/5 bg-[#0a0822]/50 p-4 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-green-400" />
          <div>
            <p className="text-2xl font-bold text-white">{stats.approved}</p>
            <p className="text-xs text-gray-500">Đã duyệt</p>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
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

      {/* Table */}
      <div className="rounded-xl border border-white/5 bg-[#0a0822]/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-gray-500">
                <th className="py-3 px-4">Sản phẩm</th>
                <th className="py-3 px-4">Người đánh giá</th>
                <th className="py-3 px-4">Đánh giá</th>
                <th className="py-3 px-4">Nội dung</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4">Ngày</th>
                <th className="py-3 px-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {filteredReviews.length > 0 ? (
                filteredReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-white/5">
                    <td className="py-4 px-4">
                      <span className="font-semibold text-white truncate max-w-[160px] block">
                        {review.product.title}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <span className="text-white block">
                          {review.user?.name || "Ẩn danh"}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          {review.user?.email || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <RatingStars rating={review.rating} />
                    </td>
                    <td className="py-4 px-4 text-gray-400">
                      <span className="truncate max-w-[200px] block">
                        {review.comment || "—"}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {review.isApproved ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border bg-green-500/10 text-green-400 border-green-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Đã duyệt</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Chờ duyệt</span>
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {!review.isApproved ? (
                          <button
                            onClick={() => handleApprove(review.id)}
                            className="text-green-400 hover:text-green-300 p-1.5 hover:bg-white/5 rounded-lg transition-all cursor-pointer"
                            title="Duyệt"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReject(review.id)}
                            className="text-yellow-400 hover:text-yellow-300 p-1.5 hover:bg-white/5 rounded-lg transition-all cursor-pointer"
                            title="Bỏ duyệt"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(review.id)}
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
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    Không tìm thấy đánh giá nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
