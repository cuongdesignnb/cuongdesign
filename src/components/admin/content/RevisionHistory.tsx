"use client";

import { restoreContentRevision } from "@/app/actions/content";
import { RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Revision {
  id: string;
  documentId: string;
  version: number;
  note: string | null;
  createdAt: string;
  createdBy: { name: string | null; email: string | null } | null;
}

export default function RevisionHistory({ revisions }: { revisions: Revision[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<number | null>(null);
  return (
    <div className="divide-y divide-white/10">
      {revisions.map((revision) => (
        <div key={revision.id} className="flex items-center justify-between gap-4 py-4">
          <div>
            <p className="text-sm font-medium text-white">Version {revision.version}</p>
            <p className="mt-1 text-xs text-gray-500">
              {new Date(revision.createdAt).toLocaleString("vi-VN")} · {revision.createdBy?.name || revision.createdBy?.email || "Admin"}
            </p>
            {revision.note && <p className="mt-1 text-xs text-gray-400">{revision.note}</p>}
          </div>
          <button
            type="button"
            disabled={busy !== null}
            onClick={async () => {
              if (!window.confirm(`Khôi phục version ${revision.version} thành draft?`)) return;
              setBusy(revision.version);
              const result = await restoreContentRevision(revision.documentId, revision.version);
              setBusy(null);
              if (!result.success) return window.alert(result.error);
              router.refresh();
            }}
            className="inline-flex items-center gap-1.5 rounded-md bg-white/5 px-3 py-2 text-xs text-gray-300 hover:bg-white/10 disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4" />{busy === revision.version ? "Đang khôi phục..." : "Restore"}
          </button>
        </div>
      ))}
      {revisions.length === 0 && <p className="py-12 text-center text-sm text-gray-500">Chưa có phiên bản đã publish.</p>}
    </div>
  );
}
