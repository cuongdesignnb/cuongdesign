import type { ReactNode } from "react";

interface ContentSectionCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export default function ContentSectionCard({
  title,
  description,
  children,
  defaultOpen = false,
}: ContentSectionCardProps) {
  return (
    <details open={defaultOpen} className="group border-b border-white/10 py-1">
      <summary className="cursor-pointer list-none py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">{title}</h2>
            {description && <p className="mt-1 text-xs text-gray-500">{description}</p>}
          </div>
          <span className="text-lg text-gray-500 transition-transform group-open:rotate-45">+</span>
        </div>
      </summary>
      <div className="grid gap-5 pb-6">{children}</div>
    </details>
  );
}
