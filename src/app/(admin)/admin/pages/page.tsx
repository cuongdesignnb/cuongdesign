import React from "react";
import { prisma } from "@/lib/db";
import AdminPagesManager from "./AdminPagesManager";

export default async function AdminPagesPage() {
  // Query all policy pages from the database
  const pages = await prisma.page.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Trang Chính sách</h1>
        <p className="text-sm text-gray-500 mt-1">
          Quản lý các trang thông tin động như: Điều khoản dịch vụ, Chính sách bảo mật, Chính sách hoàn tiền.
        </p>
      </div>

      <AdminPagesManager initialPages={JSON.parse(JSON.stringify(pages))} />
    </div>
  );
}
