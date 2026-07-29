"use client";

interface LinkValue {
  label?: string;
  url?: string;
  enabled?: boolean;
  iconKey?: string;
}

export default function LinkField({
  value,
  onChange,
}: {
  value: LinkValue;
  onChange: (value: LinkValue) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <input value={value.label ?? ""} onChange={(event) => onChange({ ...value, label: event.target.value })} placeholder="Nhãn CTA" className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" />
      <input value={value.url ?? ""} onChange={(event) => onChange({ ...value, url: event.target.value })} placeholder="/duong-dan" className="rounded-md border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-white" />
      {"iconKey" in value && <input value={value.iconKey ?? ""} onChange={(event) => onChange({ ...value, iconKey: event.target.value })} placeholder="Icon key" className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" />}
      {"enabled" in value && <label className="flex items-center gap-2 text-xs text-gray-300"><input type="checkbox" checked={value.enabled ?? false} onChange={(event) => onChange({ ...value, enabled: event.target.checked })} />Hiển thị</label>}
    </div>
  );
}
