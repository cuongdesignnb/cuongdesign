"use client";

import { ImagePlus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import MediaPickerDialog from "./MediaPickerDialog";
import type { MediaRecord } from "./media-types";

interface MediaFieldProps {
  label?: string;
  value: string;
  onChange: (value: string, media?: MediaRecord) => void;
  valueMode?: "url" | "id";
}

export default function MediaField({
  label,
  value,
  onChange,
  valueMode = "url",
}: MediaFieldProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<MediaRecord | null>(null);
  const imageUrl = selected?.url || (valueMode === "url" ? value : "");

  return (
    <div className="space-y-2">
      {label && <label className="block text-xs font-medium text-gray-300">{label}</label>}
      <div className="flex min-h-28 items-center gap-3 rounded-md border border-dashed border-white/15 bg-white/[0.025] p-3">
        {imageUrl ? (
          <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-md bg-black/20">
            <Image src={imageUrl} alt={selected?.alt || label || "Selected media"} fill sizes="128px" className="object-cover" unoptimized />
          </div>
        ) : (
          <div className="grid h-24 w-32 shrink-0 place-items-center rounded-md bg-white/5 text-gray-600">
            <ImagePlus className="h-7 w-7" />
          </div>
        )}
        <div className="min-w-0 space-y-2">
          <p className="truncate text-xs text-gray-400">{selected?.name || value || "Chưa chọn ảnh"}</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setOpen(true)} className="rounded-md bg-white/10 px-3 py-2 text-xs text-white hover:bg-white/15">
              Chọn từ thư viện
            </button>
            {value && (
              <button type="button" onClick={() => { setSelected(null); onChange(""); }} className="rounded-md p-2 text-red-400 hover:bg-red-500/10" title="Bỏ chọn">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
      <MediaPickerDialog
        open={open}
        onClose={() => setOpen(false)}
        onSelect={([media]) => {
          setSelected(media);
          onChange(valueMode === "id" ? media.id : media.url, media);
        }}
      />
    </div>
  );
}
