"use client";

import MediaField from "./MediaField";

export interface SeoValue {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogMedia?: string;
  robotsIndex?: boolean;
  robotsFollow?: boolean;
}

export default function SeoFields({ value, onChange }: { value: SeoValue; onChange: (value: SeoValue) => void }) {
  const field = (key: keyof SeoValue, label: string) => (
    <label className="space-y-1 text-xs text-gray-400">{label}<input value={String(value[key] ?? "")} onChange={(event) => onChange({ ...value, [key]: event.target.value })} className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" /></label>
  );
  return (
    <div className="grid gap-4">
      {field("title", "SEO title")}
      <label className="space-y-1 text-xs text-gray-400">SEO description<textarea value={value.description ?? ""} onChange={(event) => onChange({ ...value, description: event.target.value })} rows={3} className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" /></label>
      {field("keywords", "Keywords")}
      {field("canonical", "Canonical")}
      {field("ogTitle", "Open Graph title")}
      {field("ogDescription", "Open Graph description")}
      <MediaField label="Open Graph image" value={value.ogMedia ?? ""} onChange={(ogMedia) => onChange({ ...value, ogMedia })} />
      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-xs text-gray-300"><input type="checkbox" checked={value.robotsIndex ?? true} onChange={(event) => onChange({ ...value, robotsIndex: event.target.checked })} />Index</label>
        <label className="flex items-center gap-2 text-xs text-gray-300"><input type="checkbox" checked={value.robotsFollow ?? true} onChange={(event) => onChange({ ...value, robotsFollow: event.target.checked })} />Follow</label>
      </div>
    </div>
  );
}
