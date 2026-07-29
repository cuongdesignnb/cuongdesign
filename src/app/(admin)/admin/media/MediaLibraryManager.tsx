"use client";

import MediaUploadButton from "@/components/admin/content/MediaUploadButton";
import type { MediaRecord } from "@/components/admin/content/media-types";
import {
  ADMIN_ASSETS_ENDPOINT,
  adminApiRequest,
} from "@/lib/client/admin-api";
import { Copy, ImageIcon, Save, Search, Trash2 } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function MediaLibraryManager() {
  const [items, setItems] = useState<MediaRecord[]>([]);
  const [query, setQuery] = useState("");
  const [orientation, setOrientation] = useState("all");
  const [selected, setSelected] = useState<MediaRecord | null>(null);

  const load = useCallback(async () => {
    const result = await adminApiRequest<MediaRecord[]>(ADMIN_ASSETS_ENDPOINT);
    setItems(result);
  }, []);

  useEffect(() => {
    void load().catch((error) => window.alert(error.message));
  }, [load]);

  const filtered = useMemo(
    () =>
      items.filter((item) => {
        const matchesQuery = `${item.name} ${item.alt ?? ""}`.toLowerCase().includes(query.toLowerCase());
        const itemOrientation =
          item.width && item.height
            ? item.width === item.height ? "square" : item.width > item.height ? "landscape" : "portrait"
            : "unknown";
        return matchesQuery && (orientation === "all" || orientation === itemOrientation);
      }),
    [items, orientation, query],
  );

  async function save() {
    if (!selected) return;
    try {
      await adminApiRequest<MediaRecord>(ADMIN_ASSETS_ENDPOINT, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selected),
      });
      await load();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Save failed.");
    }
  }

  async function remove(item: MediaRecord) {
    if (!window.confirm(`Xóa "${item.name}"?`)) return;
    try {
      await adminApiRequest<{ success: boolean }>(
        `${ADMIN_ASSETS_ENDPOINT}?id=${item.id}`,
        { method: "DELETE" },
      );
    } catch (error) {
      return window.alert(error instanceof Error ? error.message : "Delete failed.");
    }
    if (selected?.id === item.id) setSelected(null);
    await load();
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Media Library</h1>
          <p className="mt-1 text-sm text-gray-500">Kho ảnh dùng chung cho toàn bộ trang quản trị.</p>
        </div>
        <MediaUploadButton onUploaded={() => void load()} />
      </header>

      <div className="flex flex-wrap gap-3">
        <label className="relative min-w-60 flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm theo tên hoặc alt text" className="w-full rounded-md border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-white outline-none" />
        </label>
        <select value={orientation} onChange={(event) => setOrientation(event.target.value)} className="rounded-md border border-white/10 bg-[#0a0822] px-3 py-2 text-sm text-gray-300">
          <option value="all">Mọi hướng ảnh</option>
          <option value="landscape">Ngang</option>
          <option value="portrait">Dọc</option>
          <option value="square">Vuông</option>
        </select>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="grid content-start grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item) => (
            <button key={item.id} type="button" onClick={() => setSelected(item)} className={`overflow-hidden rounded-md border text-left ${selected?.id === item.id ? "border-pink-500" : "border-white/10 hover:border-white/30"}`}>
              <div className="relative aspect-square bg-black/20"><Image src={item.url} alt={item.alt || item.name} fill sizes="240px" className="object-cover" unoptimized /></div>
              <div className="space-y-1 p-2">
                <p className="truncate text-xs text-white">{item.name}</p>
                <p className="text-[10px] text-gray-500">{item.width}×{item.height} · {(item.size / 1024).toFixed(1)} KB · {item.usage?.count ?? 0} nơi dùng</p>
              </div>
            </button>
          ))}
          {filtered.length === 0 && <div className="col-span-full grid h-52 place-items-center text-sm text-gray-500"><span><ImageIcon className="mx-auto mb-2 h-8 w-8" />Không có ảnh phù hợp.</span></div>}
        </div>

        <aside className="h-fit space-y-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          {selected ? (
            <>
              <div className="relative aspect-video overflow-hidden rounded-md bg-black/20"><Image src={selected.url} alt={selected.alt || selected.name} fill sizes="320px" className="object-contain" unoptimized /></div>
              <label className="block space-y-1 text-xs text-gray-400">Tên<input value={selected.name} onChange={(event) => setSelected({ ...selected, name: event.target.value })} className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" /></label>
              <label className="block space-y-1 text-xs text-gray-400">Alt text<input value={selected.alt ?? ""} onChange={(event) => setSelected({ ...selected, alt: event.target.value })} className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" /></label>
              <label className="block space-y-1 text-xs text-gray-400">Caption<textarea value={selected.caption ?? ""} onChange={(event) => setSelected({ ...selected, caption: event.target.value })} rows={3} className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" /></label>
              <p className="text-[11px] text-gray-500">Đang dùng tại {selected.usage?.count ?? 0} vị trí.</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => void save()} className="flex items-center gap-1 rounded-md bg-pink-600 px-3 py-2 text-xs font-semibold text-white"><Save className="h-4 w-4" />Lưu</button>
                <button type="button" onClick={() => void navigator.clipboard.writeText(selected.url)} className="rounded-md p-2 text-gray-300 hover:bg-white/10" title="Copy URL"><Copy className="h-4 w-4" /></button>
                <button type="button" onClick={() => void remove(selected)} disabled={(selected.usage?.count ?? 0) > 0} className="rounded-md p-2 text-red-400 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-30" title="Xóa"><Trash2 className="h-4 w-4" /></button>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">Chọn một ảnh để xem và sửa metadata.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
