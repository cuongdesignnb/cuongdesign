"use client";

import {
  deleteServiceContent,
  publishServiceContent,
} from "@/app/actions/service-content";
import { Edit2, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ServiceRow {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  isPublished: boolean;
  order: number;
  updatedAt: string;
}

export default function ServiceContentManager({ services }: { services: ServiceRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  return (
    <section className="space-y-4 border-t border-white/10 pt-8">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Danh sách dịch vụ</h2>
          <p className="mt-1 text-sm text-gray-500">Mỗi dịch vụ có route, SEO và trạng thái publish riêng.</p>
        </div>
        <Link href="/admin/content/services/new" className="inline-flex items-center gap-1.5 rounded-md bg-pink-600 px-3 py-2 text-xs font-semibold text-white hover:bg-pink-500">
          <Plus className="h-4 w-4" />Thêm dịch vụ
        </Link>
      </header>

      <div className="overflow-x-auto rounded-md border border-white/10">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="border-b border-white/10 bg-white/[0.025] text-xs text-gray-500">
            <tr><th className="px-4 py-3">Dịch vụ</th><th className="px-4 py-3">Slug</th><th className="px-4 py-3">Order</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3 text-right">Thao tác</th></tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {services.map((service) => (
              <tr key={service.id}>
                <td className="px-4 py-3"><p className="font-medium text-white">{service.title}</p><p className="text-xs text-gray-500">{service.subtitle}</p></td>
                <td className="px-4 py-3 font-mono text-xs text-gray-400">{service.slug}</td>
                <td className="px-4 py-3 text-gray-400">{service.order}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={async () => {
                      setBusy(service.id);
                      const result = await publishServiceContent(service.id);
                      setBusy(null);
                      if (!result.success) return window.alert(result.error);
                      router.refresh();
                    }}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${service.isPublished ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-300"}`}
                  >
                    {service.isPublished ? "Published" : "Draft"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Link href={`/admin/content/services/${service.id}`} className="rounded-md p-2 text-gray-400 hover:bg-white/5 hover:text-white" title="Sửa"><Edit2 className="h-4 w-4" /></Link>
                    <button
                      type="button"
                      disabled={busy !== null}
                      onClick={async () => {
                        if (!window.confirm(`Xóa dịch vụ "${service.title}"?`)) return;
                        setBusy(service.id);
                        const result = await deleteServiceContent(service.id);
                        setBusy(null);
                        if (!result.success) return window.alert(result.error);
                        router.refresh();
                      }}
                      className="rounded-md p-2 text-red-400 hover:bg-red-500/10"
                      title="Xóa"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {services.length === 0 && <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-500">Chưa có dịch vụ. Chạy seed hoặc tạo dịch vụ đầu tiên.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
