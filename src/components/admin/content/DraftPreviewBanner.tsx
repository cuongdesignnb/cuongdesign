import { auth } from "@/auth";
import { draftMode } from "next/headers";

export default async function DraftPreviewBanner() {
  const draft = await draftMode();
  if (!draft.isEnabled) return null;
  const session = await auth();
  if ((session?.user as { role?: string } | undefined)?.role !== "ADMIN") return null;
  return (
    <div className="fixed inset-x-0 top-0 z-[200] flex items-center justify-center gap-3 bg-amber-400 px-4 py-2 text-center text-xs font-semibold text-black">
      Bạn đang xem bản nháp.
      <a href="/api/admin/content/preview/disable" className="underline">Thoát Preview</a>
    </div>
  );
}
