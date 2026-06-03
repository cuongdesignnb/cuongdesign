"use client";

import React, { useState, useMemo } from "react";
import { useToast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
  Search,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Trash2,
  Check,
  X,
  Package,
  Mail,
  Phone,
  Download,
  Key,
} from "lucide-react";
import { updateOrderStatus, deleteOrder } from "@/app/actions/admin-orders";
import { formatVND } from "@/lib/utils";

interface Order {
  id: string;
  productId: string;
  product: { title: string; coverImage: string };
  userId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  amount: number;
  status: "PENDING" | "COMPLETED" | "FAILED";
  paymentMethod: string;
  sepayCode: string;
  downloadCount: number;
  downloadToken: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Props {
  initialOrders: Order[];
  stats: {
    total: number;
    pending: number;
    completed: number;
    failed: number;
    revenue: number;
  };
}

const statusConfig = {
  PENDING: {
    label: "Chờ thanh toán",
    color: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  },
  COMPLETED: {
    label: "Hoàn thành",
    color: "bg-green-500/10 text-green-400 border border-green-500/20",
  },
  FAILED: {
    label: "Thất bại",
    color: "bg-red-500/10 text-red-400 border border-red-500/20",
  },
};

export default function AdminOrdersManager({ initialOrders, stats }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const filteredOrders = useMemo(() => {
    return initialOrders.filter((order) => {
      // Status filter
      if (statusFilter !== "ALL" && order.status !== statusFilter) return false;
      // Search filter
      if (search) {
        const q = search.toLowerCase();
        return (
          order.customerName.toLowerCase().includes(q) ||
          order.customerEmail.toLowerCase().includes(q) ||
          order.sepayCode.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [initialOrders, search, statusFilter]);

  async function handleUpdateStatus(
    id: string,
    status: "COMPLETED" | "FAILED"
  ) {
    setLoading(id);
    setOpenMenuId(null);
    const result = await updateOrderStatus(id, status);
    if (result.success) {
      toast.success("Thành công", `Đã cập nhật trạng thái đơn hàng thành ${status === "COMPLETED" ? "Hoàn thành" : "Thất bại"}.`);
      router.refresh();
    } else {
      toast.error("Lỗi", result.error);
    }
    setLoading(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Bạn có chắc muốn xoá đơn hàng này?")) return;
    setLoading(id);
    setOpenMenuId(null);
    const result = await deleteOrder(id);
    if (result.success) {
      toast.success("Thành công", "Đã xoá đơn hàng.");
      router.refresh();
    } else {
      toast.error("Lỗi", result.error);
    }
    setLoading(null);
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const kpiCards = [
    {
      label: "Tổng đơn",
      value: stats.total,
      icon: ShoppingCart,
      color: "text-white",
      bg: "bg-white/5",
    },
    {
      label: "Chờ thanh toán",
      value: stats.pending,
      icon: Clock,
      color: "text-yellow-400",
      bg: "bg-yellow-500/5",
    },
    {
      label: "Hoàn thành",
      value: stats.completed,
      icon: CheckCircle2,
      color: "text-green-400",
      bg: "bg-green-500/5",
    },
    {
      label: "Thất bại",
      value: stats.failed,
      icon: XCircle,
      color: "text-red-400",
      bg: "bg-red-500/5",
    },
    {
      label: "Tổng doanh thu",
      value: formatVND(stats.revenue),
      icon: DollarSign,
      color: "text-pink-400",
      bg: "bg-pink-500/5",
      isRevenue: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className={`rounded-xl border border-white/5 ${card.bg} p-4`}
          >
            <div className="flex items-center gap-3">
              <card.icon className={`h-5 w-5 ${card.color}`} />
              <div>
                <p className="text-xs text-gray-500">{card.label}</p>
                <p className={`text-lg font-semibold ${card.color}`}>
                  {card.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Tìm theo tên, email, mã SePay..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#0a0822]/50 border border-white/10 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-pink-500/50"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-lg bg-[#0a0822]/50 border border-white/10 text-white text-sm focus:outline-none focus:border-pink-500/50 appearance-none cursor-pointer"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="PENDING">Chờ thanh toán</option>
          <option value="COMPLETED">Hoàn thành</option>
          <option value="FAILED">Thất bại</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="rounded-xl border border-white/5 bg-[#0a0822]/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left">
                <th className="px-4 py-3 text-gray-500 font-medium w-10">#</th>
                <th className="px-4 py-3 text-gray-500 font-medium">
                  Mã SePay
                </th>
                <th className="px-4 py-3 text-gray-500 font-medium">
                  Sản phẩm
                </th>
                <th className="px-4 py-3 text-gray-500 font-medium">
                  Khách hàng
                </th>
                <th className="px-4 py-3 text-gray-500 font-medium">
                  Số tiền
                </th>
                <th className="px-4 py-3 text-gray-500 font-medium">
                  Trạng thái
                </th>
                <th className="px-4 py-3 text-gray-500 font-medium">
                  Ngày tạo
                </th>
                <th className="px-4 py-3 text-gray-500 font-medium w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    Không tìm thấy đơn hàng nào.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, index) => (
                  <React.Fragment key={order.id}>
                    <tr
                      className={`hover:bg-white/5 cursor-pointer transition-colors ${
                        loading === order.id ? "opacity-50" : ""
                      }`}
                      onClick={() =>
                        setExpandedId(
                          expandedId === order.id ? null : order.id
                        )
                      }
                    >
                      <td className="px-4 py-3 text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-xs bg-white/5 px-2 py-1 rounded text-pink-400 font-mono">
                          {order.sepayCode}
                        </code>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {order.product.coverImage && (
                            <img
                              src={order.product.coverImage}
                              alt=""
                              className="h-8 w-8 rounded object-cover"
                            />
                          )}
                          <span className="text-white truncate max-w-[180px]">
                            {order.product.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-white">{order.customerName}</p>
                          <p className="text-gray-500 text-xs">
                            {order.customerEmail}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white font-medium">
                        {formatVND(order.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            statusConfig[order.status].color
                          }`}
                        >
                          {statusConfig[order.status].label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(
                                openMenuId === order.id ? null : order.id
                              );
                            }}
                            className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                          {openMenuId === order.id && (
                            <div className="absolute right-0 top-8 z-50 w-48 rounded-lg border border-white/10 bg-[#0a0822] shadow-xl py-1">
                              {order.status !== "COMPLETED" && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateStatus(order.id, "COMPLETED");
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-green-400 hover:bg-white/5"
                                >
                                  <Check className="h-4 w-4" />
                                  Đánh dấu hoàn thành
                                </button>
                              )}
                              {order.status !== "FAILED" && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateStatus(order.id, "FAILED");
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-white/5"
                                >
                                  <X className="h-4 w-4" />
                                  Đánh dấu thất bại
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(order.id);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-white/5"
                              >
                                <Trash2 className="h-4 w-4" />
                                Xoá đơn hàng
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Expandable Row Detail */}
                    {expandedId === order.id && (
                      <tr className="bg-white/[0.02]">
                        <td colSpan={8} className="px-4 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="space-y-2">
                              <h4 className="text-gray-500 text-xs uppercase tracking-wider font-medium">
                                Thông tin khách hàng
                              </h4>
                              <div className="flex items-center gap-2 text-white">
                                <Package className="h-4 w-4 text-gray-500" />
                                {order.customerName}
                              </div>
                              <div className="flex items-center gap-2 text-white">
                                <Mail className="h-4 w-4 text-gray-500" />
                                {order.customerEmail}
                              </div>
                              {order.customerPhone && (
                                <div className="flex items-center gap-2 text-white">
                                  <Phone className="h-4 w-4 text-gray-500" />
                                  {order.customerPhone}
                                </div>
                              )}
                            </div>
                            <div className="space-y-2">
                              <h4 className="text-gray-500 text-xs uppercase tracking-wider font-medium">
                                Download Token
                              </h4>
                              <div className="flex items-center gap-2">
                                <Key className="h-4 w-4 text-gray-500" />
                                <code className="text-xs bg-white/5 px-2 py-1 rounded text-gray-300 font-mono break-all">
                                  {order.downloadToken || "—"}
                                </code>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <h4 className="text-gray-500 text-xs uppercase tracking-wider font-medium">
                                Lượt tải
                              </h4>
                              <div className="flex items-center gap-2 text-white">
                                <Download className="h-4 w-4 text-gray-500" />
                                {order.downloadCount} lượt
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Result count */}
      <p className="text-xs text-gray-500 text-right">
        Hiển thị {filteredOrders.length} / {initialOrders.length} đơn hàng
      </p>
    </div>
  );
}
