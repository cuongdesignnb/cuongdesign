"use client";

import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import {
  ADMIN_ASSETS_ENDPOINT,
  adminApiRequest,
} from "@/lib/client/admin-api";
import type { MediaRecord } from "./media-types";

interface MediaUploadButtonProps {
  multiple?: boolean;
  onUploaded: (media: MediaRecord[]) => void;
}

export default function MediaUploadButton({
  multiple = true,
  onUploaded,
}: MediaUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      const body = new FormData();
      Array.from(files).forEach((file) => body.append("files", file));
      const result = await adminApiRequest<MediaRecord | MediaRecord[]>(
        ADMIN_ASSETS_ENDPOINT,
        { method: "POST", body },
      );
      onUploaded(Array.isArray(result) ? result : [result]);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple={multiple}
        className="hidden"
        onChange={(event) => void upload(event.target.files)}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="inline-flex items-center gap-2 rounded-md bg-pink-600 px-3 py-2 text-xs font-semibold text-white hover:bg-pink-500 disabled:opacity-50"
      >
        <Upload className="h-4 w-4" />
        {uploading ? "Đang tải..." : "Tải ảnh"}
      </button>
    </>
  );
}
