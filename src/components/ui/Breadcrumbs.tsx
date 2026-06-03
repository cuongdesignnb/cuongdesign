"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { siteConfig } from "@/data/site";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const baseUrl = siteConfig?.url || "https://cuongdesign.com";

  // Build JSON-LD Structured Schema for search engines
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Trang chủ",
        "item": baseUrl,
      },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 2,
        "name": item.label,
        "item": item.href ? `${baseUrl}${item.href}` : undefined,
      })),
    ],
  };

  return (
    <nav className="flex flex-col space-y-2 text-left z-10 relative">
      {/* Inject JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ol className="flex flex-wrap items-center space-x-2 text-[11px] md:text-xs text-gray-500 font-medium">
        <li className="flex items-center">
          <Link href="/" className="hover:text-pink-500 flex items-center gap-1 transition-colors">
            <Home className="w-3.5 h-3.5" />
            <span>Trang chủ</span>
          </Link>
        </li>

        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={idx} className="flex items-center space-x-2">
              <ChevronRight className="w-3.5 h-3.5 text-gray-700 shrink-0" />
              {isLast || !item.href ? (
                <span className="text-gray-300 font-semibold truncate max-w-[200px] md:max-w-xs">{item.label}</span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-pink-500 transition-colors truncate max-w-[120px] md:max-w-[200px]"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
