import ContentHubNav from "@/components/admin/content/ContentHubNav";
import type { ReactNode } from "react";

export default function ContentHubLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6">
      <ContentHubNav />
      {children}
    </div>
  );
}
