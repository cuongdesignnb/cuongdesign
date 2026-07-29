"use client";

import { Clock3, Eye, History, Save, Send } from "lucide-react";
import Link from "next/link";

interface PublishBarProps {
  documentId?: string;
  publishedAt?: string | null;
  unsaved: boolean;
  busy: boolean;
  onSave: () => void;
  onPublish: () => void;
  onPreview: () => void;
}

export default function PublishBar({
  documentId,
  publishedAt,
  unsaved,
  busy,
  onSave,
  onPublish,
  onPreview,
}: PublishBarProps) {
  return (
    <div className="sticky bottom-3 z-30 flex flex-wrap items-center justify-between gap-3 rounded-md border border-white/10 bg-[#0a0822]/95 px-4 py-3 shadow-2xl backdrop-blur">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span className={`h-2 w-2 rounded-full ${unsaved ? "bg-amber-400" : "bg-emerald-500"}`} />
        {unsaved ? "Có thay đổi chưa lưu" : "Đã lưu bản nháp"}
        {publishedAt && <span className="hidden items-center gap-1 sm:flex"><Clock3 className="h-3.5 w-3.5" />Publish {new Date(publishedAt).toLocaleString("vi-VN")}</span>}
      </div>
      <div className="flex flex-wrap gap-2">
        {documentId && (
          <Link href={`/admin/content/revisions/${documentId}`} className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs text-gray-300 hover:bg-white/5">
            <History className="h-4 w-4" />Lịch sử
          </Link>
        )}
        <button type="button" onClick={onPreview} className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs text-gray-300 hover:bg-white/5">
          <Eye className="h-4 w-4" />Preview
        </button>
        <button type="button" disabled={busy} onClick={onSave} className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-3 py-2 text-xs font-medium text-white hover:bg-white/15 disabled:opacity-50">
          <Save className="h-4 w-4" />Save draft
        </button>
        <button type="button" disabled={busy} onClick={onPublish} className="inline-flex items-center gap-1.5 rounded-md bg-pink-600 px-3 py-2 text-xs font-semibold text-white hover:bg-pink-500 disabled:opacity-50">
          <Send className="h-4 w-4" />Publish
        </button>
      </div>
    </div>
  );
}
