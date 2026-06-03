import React from "react";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import AdminUsersManager from "./AdminUsersManager";

export default async function AdminUsersPage() {
  const session = await auth();
  const currentUserId = (session?.user as any)?.id || "";

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { orders: true, reviews: true } },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Quản lý Users
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Quản lý tài khoản người dùng, phân quyền Admin và Customer
        </p>
      </div>
      <AdminUsersManager
        initialData={JSON.parse(JSON.stringify(users))}
        currentUserId={currentUserId}
      />
    </div>
  );
}
