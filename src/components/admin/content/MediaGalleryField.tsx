"use client";

import { Images, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import MediaPickerDialog from "./MediaPickerDialog";

interface MediaGalleryFieldProps {
  label?: string;
  value: string[];
  onChange: (value: string[]) => void;
}

export default function MediaGalleryField({ label, value, onChange }: MediaGalleryFieldProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-2">
      {label && <label className="block text-xs font-medium text-gray-300">{label}</label>}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {value.map((url) => (
          <div key={url} className="relative aspect-square overflow-hidden rounded-md border border-white/10">
            <Image src={url} alt="" fill sizes="160px" className="object-cover" unoptimized />
            <button type="button" onClick={() => onChange(value.filter((item) => item !== url))} className="absolute right-1 top-1 rounded bg-black/70 p-1 text-white" title="Bỏ ảnh">
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        <button type="button" onClick={() => setOpen(true)} className="grid aspect-square place-items-center rounded-md border border-dashed border-white/15 text-xs text-gray-500 hover:border-pink-500/40 hover:text-pink-400">
          <span><Images className="mx-auto mb-1 h-5 w-5" />Chọn ảnh</span>
        </button>
      </div>
      <MediaPickerDialog
        open={open}
        multiple
        onClose={() => setOpen(false)}
        onSelect={(media) => onChange(Array.from(new Set([...value, ...media.map((item) => item.url)])))}
      />
    </div>
  );
}
