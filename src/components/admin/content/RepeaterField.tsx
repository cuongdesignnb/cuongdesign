"use client";

import { ChevronDown, Copy, GripVertical, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface RepeaterFieldProps<T> {
  label: string;
  items: T[];
  createItem: () => T;
  onChange: (items: T[]) => void;
  renderItem: (item: T, index: number, update: (value: T) => void) => React.ReactNode;
  itemLabel?: (item: T, index: number) => string;
}

export default function RepeaterField<T>({
  label,
  items,
  createItem,
  onChange,
  renderItem,
  itemLabel,
}: RepeaterFieldProps<T>) {
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());
  const [dragging, setDragging] = useState<number | null>(null);

  function move(from: number, to: number) {
    if (from === to) return;
    const next = [...items];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-gray-300">{label}</label>
        <button type="button" onClick={() => onChange([...items, createItem()])} className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2.5 py-1.5 text-xs text-gray-300 hover:bg-white/10">
          <Plus className="h-3.5 w-3.5" />Thêm
        </button>
      </div>

      {items.map((item, index) => (
        <div
          key={index}
          draggable
          onDragStart={() => setDragging(index)}
          onDragOver={(event) => event.preventDefault()}
          onDrop={() => {
            if (dragging !== null) move(dragging, index);
            setDragging(null);
          }}
          className="rounded-md border border-white/10 bg-black/10"
        >
          <div className="flex items-center gap-2 border-b border-white/5 px-2 py-2">
            <GripVertical className="h-4 w-4 cursor-grab text-gray-600" />
            <button
              type="button"
              onClick={() =>
                setCollapsed((current) => {
                  const next = new Set(current);
                  if (next.has(index)) next.delete(index);
                  else next.add(index);
                  return next;
                })
              }
              className="flex min-w-0 flex-1 items-center gap-2 text-left text-xs font-medium text-gray-300"
            >
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${collapsed.has(index) ? "-rotate-90" : ""}`} />
              <span className="truncate">{itemLabel?.(item, index) || `Mục ${index + 1}`}</span>
            </button>
            <button type="button" onClick={() => onChange([...items.slice(0, index + 1), structuredClone(item), ...items.slice(index + 1)])} className="rounded p-1.5 text-gray-500 hover:bg-white/5 hover:text-white" title="Nhân bản">
              <Copy className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))} className="rounded p-1.5 text-red-400 hover:bg-red-500/10" title="Xóa">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          {!collapsed.has(index) && (
            <div className="grid gap-4 p-4">
              {renderItem(item, index, (value) => onChange(items.map((current, itemIndex) => itemIndex === index ? value : current)))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
