"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { updateUserRole, deleteUser } from "@/app/actions/admin-users";
import {
  Users,
  Shield,
  UserCircle,
  Trash2,
  ShoppingCart,
  Star,
  ChevronDown,
} from "lucide-react";

interface UserItem {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: "ADMIN" | "CUSTOMER";
  createdAt: string;
  _count: {
    orders: number;
    reviews: number;
  };
}

interface AdminUsersManagerProps {
  initialData: UserItem[];
  currentUserId: string;
}

export default function AdminUsersManager({
  initialData,
  currentUserId,
}: AdminUsersManagerProps) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const totalCount = initialData.length;
  const adminCount = initialData.filter((u) => u.role === "ADMIN").length;
  const customerCount = totalCount - adminCount;

  const handleRoleChange = async (
    userId: string,
    newRole: "ADMIN" | "CUSTOMER"
  ) => {
    if (userId === currentUserId) return;
    setLoading(userId);
    try {
      const res = await updateUserRole(userId, newRole, currentUserId);
      if (res.success) {
        toast.success("Thành công", "Đã cập nhật vai trò người dùng");
        router.refresh();
      } else {
        toast.error("Lỗi", res.error);
      }
    } catch (err: any) {
      toast.error("Lỗi", err.message);
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async (userId: string) => {
    if (userId === currentUserId) return;
    if (!confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return;
    setLoading(userId);
    try {
      const res = await deleteUser(userId, currentUserId);
      if (res.success) {
        toast.success("Thành công", "Đã xóa người dùng");
        router.refresh();
      } else {
        toast.error("Lỗi", res.error);
      }
    } catch (err: any) {
      toast.error("Lỗi", err.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-white/5 bg-[#0a0822]/50 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
            Tổng người dùng
          </p>
          <p className="text-2xl font-bold text-white mt-1">{totalCount}</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-[#0a0822]/50 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
            Admin
          </p>
          <p className="text-2xl font-bold text-purple-400 mt-1">
            {adminCount}
          </p>
        </div>
        <div className="rounded-xl border border-white/5 bg-[#0a0822]/50 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
            Customer
          </p>
          <p className="text-2xl font-bold text-blue-400 mt-1">
            {customerCount}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/5 bg-[#0a0822]/50 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-pink-500" />
          <h3 className="text-lg font-bold text-white">
            Danh sách người dùng
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-gray-500">
                <th className="py-3 px-2">Người dùng</th>
                <th className="py-3 px-2">Vai trò</th>
                <th className="py-3 px-2">Đơn hàng</th>
                <th className="py-3 px-2">Đánh giá</th>
                <th className="py-3 px-2">Ngày tham gia</th>
                <th className="py-3 px-2 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {initialData.length > 0 ? (
                initialData.map((user) => {
                  const isSelf = user.id === currentUserId;
                  return (
                    <tr key={user.id} className="hover:bg-white/5">
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-3">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name || user.email}
                              className="w-8 h-8 rounded-full object-cover border border-white/10"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 font-bold text-xs">
                              {(user.name || user.email)[0]?.toUpperCase() ||
                                "?"}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-white flex items-center gap-1.5">
                              {user.name || "Chưa đặt tên"}
                              {isSelf && (
                                <span className="text-[10px] text-pink-400 bg-pink-500/10 border border-pink-500/20 px-1.5 py-0.5 rounded-full font-semibold">
                                  (Bạn)
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                            user.role === "ADMIN"
                              ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                              : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          }`}
                        >
                          {user.role === "ADMIN" ? (
                            <Shield className="w-3 h-3" />
                          ) : (
                            <UserCircle className="w-3 h-3" />
                          )}
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-1 text-gray-400">
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>{user._count.orders}</span>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-1 text-gray-400">
                          <Star className="w-3.5 h-3.5" />
                          <span>{user._count.reviews}</span>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="py-4 px-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Role dropdown */}
                          <div className="relative">
                            <select
                              value={user.role}
                              disabled={isSelf || loading === user.id}
                              onChange={(e) =>
                                handleRoleChange(
                                  user.id,
                                  e.target.value as "ADMIN" | "CUSTOMER"
                                )
                              }
                              className={`appearance-none text-xs px-3 py-1.5 pr-7 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pink-500/50 ${
                                isSelf
                                  ? "opacity-40 cursor-not-allowed"
                                  : "cursor-pointer"
                              }`}
                            >
                              <option value="ADMIN">ADMIN</option>
                              <option value="CUSTOMER">CUSTOMER</option>
                            </select>
                            <ChevronDown className="w-3 h-3 text-gray-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>

                          {/* Delete button */}
                          <button
                            onClick={() => handleDelete(user.id)}
                            disabled={isSelf || loading === user.id}
                            className={`p-1 rounded-lg transition-all ${
                              isSelf
                                ? "text-gray-600 cursor-not-allowed opacity-40"
                                : "text-red-400 hover:text-red-300 hover:bg-white/5 cursor-pointer"
                            }`}
                            title={
                              isSelf
                                ? "Không thể xóa chính bạn"
                                : "Xóa người dùng"
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    Chưa có người dùng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
