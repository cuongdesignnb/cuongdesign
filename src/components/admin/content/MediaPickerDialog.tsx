"use client";

import { Check, ImageIcon, Search, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import MediaUploadButton from "./MediaUploadButton";
import type { MediaRecord } from "./media-types";

interface MediaPickerDialogProps {
  open: boolean;
  multiple?: boolean;
  selected?: string[];
  onClose: () => void;
  onSelect: (media: MediaRecord[]) => void;
}

export default function MediaPickerDialog({
  open,
  multiple = false,
  selected = [],
  onClose,
  onSelect,
}: MediaPickerDialogProps) {
  const [items, setItems] = useState<MediaRecord[]>([]);
  const [query, setQuery] = useState("");
  const [selection, setSelection] = useState<string[]>(selected);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSelection(selected);
    setLoading(true);
    fetch("/api/admin/media")
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        setItems(result);
      })
      .catch((error) => window.alert(error.message))
      .finally(() => setLoading(false));
  }, [open, selected]);

  const filtered = useMemo(
    () =>
      items.filter((item) =>
        `${item.name} ${item.alt ?? ""}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [items, query],
  );

  if (!open) return null;

  function toggle(item: MediaRecord) {
    if (!multiple) {
      onSelect([item]);
      onClose();
      return;
    }
    setSelection((current) =>
      current.includes(item.id)
        ? current.filter((id) => id !== item.id)
        : [...current, item.id],
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4">
      <div className="flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-white/10 bg-[#0a0822] shadow-2xl">
        <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <h2 className="font-semibold text-white">Thư viện Media</h2>
            <p className="text-xs text-gray-500">Chọn ảnh đã có hoặc tải ảnh mới.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-2 text-gray-400 hover:bg-white/5 hover:text-white" title="Đóng">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex items-center gap-3 border-b border-white/10 p-4">
          <label className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm theo tên hoặc alt text"
              className="w-full rounded-md border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-white outline-none focus:border-pink-500/50"
            />
          </label>
          <MediaUploadButton onUploaded={(media) => setItems((current) => [...media, ...current])} />
        </div>

        <div className="min-h-64 flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="grid h-48 place-items-center text-sm text-gray-500">Đang tải...</div>
          ) : filtered.length === 0 ? (
            <div className="grid h-48 place-items-center text-center text-sm text-gray-500">
              <div><ImageIcon className="mx-auto mb-2 h-8 w-8" />Thư viện chưa có ảnh phù hợp.</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {filtered.map((item) => {
                const active = selection.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggle(item)}
                    className={`relative overflow-hidden rounded-md border text-left ${active ? "border-pink-500 ring-2 ring-pink-500/20" : "border-white/10 hover:border-white/30"}`}
                  >
                    <div className="relative aspect-square bg-black/20">
                      <Image src={item.url} alt={item.alt || item.name} fill sizes="180px" className="object-cover" />
                    </div>
                    <div className="truncate px-2 py-2 text-[11px] text-gray-300">{item.name}</div>
                    {active && <span className="absolute right-2 top-2 rounded-full bg-pink-600 p-1 text-white"><Check className="h-3 w-3" /></span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {multiple && (
          <footer className="flex items-center justify-between border-t border-white/10 px-5 py-4">
            <span className="text-xs text-gray-500">{selection.length} ảnh đã chọn</span>
            <button
              type="button"
              onClick={() => {
                onSelect(items.filter((item) => selection.includes(item.id)));
                onClose();
              }}
              className="rounded-md bg-pink-600 px-4 py-2 text-xs font-semibold text-white hover:bg-pink-500"
            >
              Xác nhận
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}
