import React from "react";
import { prisma } from "@/lib/db";
import AdminReviewsManager from "./AdminReviewsManager";

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    include: {
      product: { select: { title: true } },
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const pendingCount = reviews.filter((r) => !r.isApproved).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Quản lý đánh giá</h1>
        <p className="text-sm text-gray-500 mt-1">
          Duyệt, từ chối và quản lý đánh giá sản phẩm từ khách hàng.
        </p>
      </div>
      <AdminReviewsManager
        initialReviews={JSON.parse(JSON.stringify(reviews))}
        initialPendingCount={pendingCount}
      />
    </div>
  );
}
