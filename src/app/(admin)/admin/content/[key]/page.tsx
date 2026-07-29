import ContentDocumentForm from "@/components/admin/content/ContentDocumentForm";
import { contentRegistry, isContentKey } from "@/content/registry";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { notFound } from "next/navigation";
import {
  globalContentDefaults,
  type GlobalContent,
} from "@/content/defaults/global";
import { globalContentSchema } from "@/content/schemas";
import {
  applyGlobalSettings,
  GLOBAL_SETTING_KEYS,
} from "@/lib/content/global-settings";
import { mergeContentDefaults } from "@/lib/content/merge-defaults";

export const dynamic = "force-dynamic";

export default async function ContentDocumentPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  await requireAdmin();
  const { key } = await params;
  if (!isContentKey(key) || key === "services") notFound();
  const entry = contentRegistry[key];
  const document = await prisma.contentDocument.upsert({
    where: { key },
    update: { name: entry.name, route: entry.route },
    create: {
      key,
      name: entry.name,
      route: entry.route,
      draftData: entry.defaultData as Prisma.InputJsonValue,
    },
  });
  let initialData: unknown = document.draftData;
  if (key === "global") {
    const settings = await prisma.setting.findMany({
      where: { key: { in: [...GLOBAL_SETTING_KEYS] } },
      select: { key: true, value: true },
    });
    const parsed = globalContentSchema.safeParse(
      mergeContentDefaults(globalContentDefaults, document.draftData),
    );
    if (parsed.success) {
      initialData = applyGlobalSettings(parsed.data as GlobalContent, settings);
    }
  }

  return (
    <ContentDocumentForm
      contentKey={key}
      name={entry.name}
      route={entry.route}
      documentId={document.id}
      initialData={JSON.parse(JSON.stringify(initialData))}
      publishedAt={document.publishedAt?.toISOString() ?? null}
    />
  );
}
