"use client";

import { AlertTriangle, Globe2, Search } from "lucide-react";
import MediaField from "./MediaField";
import { absoluteUrl, normalizeCanonicalPath } from "@/lib/seo/url";

export interface SeoValue {
  title?: string;
  description?: string;
  keywords?: string | string[];
  canonical?: string;
  canonicalPath?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogMedia?: string;
  ogImage?: string;
  robotsIndex?: boolean;
  robotsFollow?: boolean;
}

interface SeoFieldsProps {
  value: SeoValue;
  onChange: (value: SeoValue) => void;
  entityType?: "page" | "service" | "project" | "product" | "post" | "category";
  basePath?: string;
  slug?: string;
  fallbackTitle?: string;
  fallbackDescription?: string;
  fallbackImage?: string;
  allowNoIndex?: boolean;
}

export default function SeoFields({
  value,
  onChange,
  basePath = "",
  slug = "",
  fallbackTitle = "",
  fallbackDescription = "",
  fallbackImage = "",
  allowNoIndex = true,
}: SeoFieldsProps) {
  const title = value.title || fallbackTitle;
  const description = value.description || fallbackDescription;
  const image = value.ogImage || value.ogMedia || fallbackImage;
  const canonicalInput = value.canonicalPath || value.canonical || "";
  const defaultPath = normalizeCanonicalPath(`${basePath}/${slug}`);
  const finalUrl = absoluteUrl(canonicalInput || defaultPath);
  const externalCanonical =
    Boolean(canonicalInput) && finalUrl === absoluteUrl("/") && canonicalInput !== "/";
  const warnings = [
    title.length > 0 && (title.length < 30 || title.length > 60)
      ? `SEO title hiện có ${title.length} ký tự; nên nằm trong khoảng 30-60.`
      : "",
    description.length > 0 && (description.length < 70 || description.length > 160)
      ? `Meta description hiện có ${description.length} ký tự; nên nằm trong khoảng 70-160.`
      : "",
    !image ? "Chưa có ảnh Open Graph." : "",
    externalCanonical ? "Canonical khác domain chính nên sẽ bị bỏ qua." : "",
    value.robotsIndex === false ? "Nội dung đang đặt noindex." : "",
  ].filter(Boolean);

  const field = (key: keyof SeoValue, label: string, placeholder?: string) => (
    <label className="space-y-1 text-xs text-gray-400">
      <span>{label}</span>
      <input
        value={Array.isArray(value[key]) ? (value[key] as string[]).join(", ") : String(value[key] ?? "")}
        placeholder={placeholder}
        onChange={(event) => onChange({ ...value, [key]: event.target.value })}
        className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
      />
    </label>
  );

  return (
    <div className="grid gap-5">
      {field("title", "SEO title", fallbackTitle)}
      <label className="space-y-1 text-xs text-gray-400">
        <span>Meta description</span>
        <textarea
          value={value.description ?? ""}
          placeholder={fallbackDescription}
          onChange={(event) => onChange({ ...value, description: event.target.value })}
          rows={3}
          className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
        />
      </label>
      {field("keywords", "Keywords", "next.js, thiết kế website, ui/ux")}

      <div className="space-y-2 border-y border-white/10 py-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-300">
          <Search className="h-4 w-4" />
          Google preview
        </div>
        <div className="text-sm text-emerald-400">{finalUrl}</div>
        <div className="text-lg text-blue-300">{title || "Tiêu đề trang"}</div>
        <p className="line-clamp-2 text-sm text-gray-400">
          {description || "Meta description sẽ hiển thị tại đây."}
        </p>
      </div>

      <details className="space-y-4">
        <summary className="cursor-pointer text-sm font-semibold text-gray-200">Nâng cao</summary>
        <div className="mt-4 grid gap-4">
          {field("canonicalPath", "Canonical override", defaultPath)}
          {field("ogTitle", "Open Graph title", title)}
          {field("ogDescription", "Open Graph description", description)}
          <MediaField
            label="Open Graph image"
            value={value.ogImage || value.ogMedia || ""}
            onChange={(ogImage) => onChange({ ...value, ogImage, ogMedia: ogImage })}
          />
          <div className="border-t border-white/10 pt-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-gray-300">
              <Globe2 className="h-4 w-4" />
              Facebook / Open Graph preview
            </div>
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt="" className="aspect-[1.91/1] w-full max-w-lg object-cover" />
            ) : null}
            <div className="max-w-lg bg-white/5 p-3">
              <div className="font-semibold text-white">{value.ogTitle || title || "Tiêu đề"}</div>
              <div className="mt-1 line-clamp-2 text-xs text-gray-400">
                {value.ogDescription || description}
              </div>
            </div>
          </div>
        </div>
      </details>

      <div className="flex gap-6">
        {allowNoIndex ? (
          <label className="flex items-center gap-2 text-xs text-gray-300">
            <input
              type="checkbox"
              checked={value.robotsIndex ?? true}
              onChange={(event) => onChange({ ...value, robotsIndex: event.target.checked })}
            />
            Index
          </label>
        ) : null}
        <label className="flex items-center gap-2 text-xs text-gray-300">
          <input
            type="checkbox"
            checked={value.robotsFollow ?? true}
            onChange={(event) => onChange({ ...value, robotsFollow: event.target.checked })}
          />
          Follow
        </label>
      </div>

      {warnings.length ? (
        <div className="space-y-2 border-l-2 border-amber-400 pl-3 text-xs text-amber-200">
          {warnings.map((warning) => (
            <div key={warning} className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{warning}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
