"use client";

import Image from "next/image";
import { useState } from "react";

interface PublicAvatarProps {
  name: string;
  src?: string | null;
}

function isImageSource(value: string) {
  return value.startsWith("/") || /^https?:\/\//i.test(value) || value.startsWith("data:image/");
}

export default function PublicAvatar({ name, src }: PublicAvatarProps) {
  const source = src?.trim() ?? "";
  const [failedSource, setFailedSource] = useState<string | null>(null);

  if (source && isImageSource(source) && failedSource !== source) {
    return (
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/10 bg-black/30">
        <Image
          src={source}
          alt={name}
          fill
          sizes="40px"
          className="object-cover"
          unoptimized
          onError={() => setFailedSource(source)}
        />
      </div>
    );
  }

  return (
    <div className="flex h-10 w-10 shrink-0 select-none items-center justify-center rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 text-xs font-bold text-white">
      {name.charAt(0).toUpperCase() || "?"}
    </div>
  );
}
