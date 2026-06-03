import React from "react";
import { prisma } from "@/lib/db";
import AdminOrdersManager from "./AdminOrdersManager";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      product: {
        select: { title: true, coverImage: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalCount = orders.length;
  const pendingCount = orders.filter((o) => o.status === "PENDING").length;
  const completedCount = orders.filter((o) => o.status === "COMPLETED").length;
  const failedCount = orders.filter((o) => o.status === "FAILED").length;

  const revenueResult = await prisma.order.aggregate({
    _sum: { amount: true },
    where: { status: "COMPLETED" },
  });
  const totalRevenue = revenueResult._sum.amount || 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Quản lý đơn hàng
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Theo dõi và quản lý tất cả đơn hàng từ SePay.
        </p>
      </div>
      <AdminOrdersManager
        initialOrders={JSON.parse(JSON.stringify(orders))}
        stats={{
          total: totalCount,
          pending: pendingCount,
          completed: completedCount,
          failed: failedCount,
          revenue: totalRevenue,
        }}
      />
    </div>
  );
}
