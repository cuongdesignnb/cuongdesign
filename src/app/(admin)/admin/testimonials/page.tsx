import React from "react";
import { prisma } from "@/lib/db";
import AdminTestimonialsManager from "./AdminTestimonialsManager";

export default async function AdminTestimonialsPage() {
  const testimonials = await prisma.testimonial.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Đánh giá Khách hàng
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Quản lý các đánh giá, nhận xét của khách hàng hiển thị trên trang chủ
        </p>
      </div>
      <AdminTestimonialsManager
        initialData={JSON.parse(JSON.stringify(testimonials))}
      />
    </div>
  );
}
