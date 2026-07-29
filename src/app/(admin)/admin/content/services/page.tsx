import ContentDocumentForm from "@/components/admin/content/ContentDocumentForm";
import ServiceContentManager from "@/components/admin/content/ServiceContentManager";
import { contentRegistry } from "@/content/registry";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminServicesContentPage() {
  await requireAdmin();
  const entry = contentRegistry.services;
  const [document, services] = await Promise.all([
    prisma.contentDocument.upsert({
      where: { key: "services" },
      update: { name: entry.name, route: entry.route },
      create: {
        key: "services",
        name: entry.name,
        route: entry.route,
        draftData: entry.defaultData as Prisma.InputJsonValue,
      },
    }),
    prisma.serviceContent.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <div className="space-y-10">
      <ContentDocumentForm
        contentKey="services"
        name="Trang danh sách dịch vụ"
        route={entry.route}
        documentId={document.id}
        initialData={JSON.parse(JSON.stringify(document.draftData))}
        publishedAt={document.publishedAt?.toISOString() ?? null}
      />
      <ServiceContentManager services={JSON.parse(JSON.stringify(services))} />
    </div>
  );
}
