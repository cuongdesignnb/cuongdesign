"use client";

import { contentRegistry } from "@/content/registry";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ContentHubNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-white/10 pb-2">
      {Object.entries(contentRegistry).map(([key, entry]) => {
        const href = `/admin/content/${key}`;
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={key}
            href={href}
            className={`shrink-0 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
              active ? "bg-pink-500/15 text-pink-300" : "text-gray-500 hover:bg-white/5 hover:text-white"
            }`}
          >
            {entry.name}
          </Link>
        );
      })}
    </nav>
  );
}
