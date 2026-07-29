"use server";

import { contentRegistry, isContentKey, type ContentKey } from "@/content/registry";
import type { ContentActionResult } from "@/content/types";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";
import { sanitizeContentTree } from "@/lib/content/sanitize";
import { revalidateContentKey } from "@/lib/content/revalidate";
import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { globalContentToSettings } from "@/lib/content/global-settings";
import type { GlobalContent } from "@/content/defaults/global";

function message(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

export async function getContentDocument(key: string): Promise<ContentActionResult> {
  try {
    await requireAdmin();
    if (!isContentKey(key)) return { success: false, error: "Unknown content key." };
    const entry = contentRegistry[key];
    const document = await prisma.contentDocument.upsert({
      where: { key },
      update: {},
      create: {
        key,
        name: entry.name,
        route: entry.route,
        draftData: entry.defaultData as Prisma.InputJsonValue,
      },
    });
    return { success: true, data: document };
  } catch (error) {
    return { success: false, error: message(error) };
  }
}

export async function saveContentDraft(
  key: string,
  data: unknown,
): Promise<ContentActionResult> {
  try {
    const admin = await requireAdmin();
    if (!isContentKey(key)) return { success: false, error: "Unknown content key." };
    const entry = contentRegistry[key];
    const parsed = entry.schema.safeParse(sanitizeContentTree(data));
    if (!parsed.success) return { success: false, error: parsed.error.message };

    const document = await prisma.contentDocument.upsert({
      where: { key },
      update: {
        name: entry.name,
        route: entry.route,
        draftData: parsed.data as Prisma.InputJsonValue,
        updatedById: admin.id,
      },
      create: {
        key,
        name: entry.name,
        route: entry.route,
        draftData: parsed.data as Prisma.InputJsonValue,
        updatedById: admin.id,
      },
    });
    revalidatePath(`/admin/content/${key}`);
    return { success: true, data: document };
  } catch (error) {
    return { success: false, error: message(error) };
  }
}

export async function publishContentDocument(
  key: string,
): Promise<ContentActionResult> {
  try {
    const admin = await requireAdmin();
    if (!isContentKey(key)) return { success: false, error: "Unknown content key." };
    const entry = contentRegistry[key];
    const document = await prisma.contentDocument.findUnique({ where: { key } });
    if (!document) return { success: false, error: "Save a draft before publishing." };

    const parsed = entry.schema.safeParse(document.draftData);
    if (!parsed.success) return { success: false, error: parsed.error.message };

    const latest = await prisma.contentRevision.aggregate({
      where: { documentId: document.id },
      _max: { version: true },
    });
    const version = (latest._max.version ?? 0) + 1;
    const now = new Date();

    const updated = await prisma.$transaction(async (tx) => {
      await tx.contentRevision.create({
        data: {
          documentId: document.id,
          version,
          data: parsed.data as Prisma.InputJsonValue,
          note: `Published version ${version}`,
          createdById: admin.id,
        },
      });
      const published = await tx.contentDocument.update({
        where: { id: document.id },
        data: {
          publishedData: parsed.data as Prisma.InputJsonValue,
          status: "PUBLISHED",
          publishedAt: now,
          updatedById: admin.id,
        },
      });
      if (key === "global") {
        const settings = globalContentToSettings(parsed.data as GlobalContent);
        await Promise.all(
          Object.entries(settings).map(([settingKey, value]) =>
            tx.setting.upsert({
              where: { key: settingKey },
              update: { value },
              create: { key: settingKey, value },
            }),
          ),
        );
      }
      return published;
    });

    revalidateContentKey(key as ContentKey);
    revalidatePath(`/admin/content/revisions/${document.id}`);
    return { success: true, data: updated };
  } catch (error) {
    return { success: false, error: message(error) };
  }
}

export async function getContentRevisions(documentId: string): Promise<ContentActionResult> {
  try {
    await requireAdmin();
    const revisions = await prisma.contentRevision.findMany({
      where: { documentId },
      include: { createdBy: { select: { name: true, email: true } } },
      orderBy: { version: "desc" },
    });
    return { success: true, data: revisions };
  } catch (error) {
    return { success: false, error: message(error) };
  }
}

export async function restoreContentRevision(
  documentId: string,
  version: number,
): Promise<ContentActionResult> {
  try {
    const admin = await requireAdmin();
    const revision = await prisma.contentRevision.findUnique({
      where: { documentId_version: { documentId, version } },
      include: { document: true },
    });
    if (!revision) return { success: false, error: "Revision not found." };

    const updated = await prisma.contentDocument.update({
      where: { id: documentId },
      data: {
        draftData: revision.data as Prisma.InputJsonValue,
        status: "DRAFT",
        updatedById: admin.id,
      },
    });
    revalidatePath(`/admin/content/${revision.document.key}`);
    return { success: true, data: updated };
  } catch (error) {
    return { success: false, error: message(error) };
  }
}
