import React from "react";
import { prisma } from "@/lib/db";
import AdminContactsManager from "./AdminContactsManager";

export default async function AdminContactsPage() {
  const contacts = await prisma.contact.findMany({
    orderBy: { createdAt: "desc" },
  });

  const totalCount = contacts.length;
  const unprocessedCount = contacts.filter((c) => !c.isProcessed).length;
  const processedCount = contacts.filter((c) => c.isProcessed).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Hộp thư liên hệ
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Quản lý các yêu cầu liên hệ và báo giá từ khách hàng.
        </p>
      </div>
      <AdminContactsManager
        initialContacts={JSON.parse(JSON.stringify(contacts))}
        stats={{
          total: totalCount,
          unprocessed: unprocessedCount,
          processed: processedCount,
        }}
      />
    </div>
  );
}
