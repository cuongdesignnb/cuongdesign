import RevisionHistory from "@/components/admin/content/RevisionHistory";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ContentRevisionPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  await requireAdmin();
  const { documentId } = await params;
  const document = await prisma.contentDocument.findUnique({
    where: { id: documentId },
    include: {
      revisions: {
        include: { createdBy: { select: { name: true, email: true } } },
        orderBy: { version: "desc" },
      },
    },
  });
  if (!document) notFound();

  return (
    <div className="space-y-5">
      <header>
        <Link href={`/admin/content/${document.key}`} className="text-xs text-pink-400 hover:text-pink-300">← Quay lại nội dung</Link>
        <h1 className="mt-3 text-2xl font-bold text-white">Lịch sử: {document.name}</h1>
        <p className="mt-1 text-sm text-gray-500">Restore sẽ đưa phiên bản đã chọn về bản nháp, không tự publish.</p>
      </header>
      <div className="rounded-md border border-white/10 bg-white/[0.02] px-5">
        <RevisionHistory revisions={JSON.parse(JSON.stringify(document.revisions))} />
      </div>
    </div>
  );
}
