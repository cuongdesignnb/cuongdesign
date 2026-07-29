"use server";

import { prisma } from "@/lib/db";
import {
  globalContentDefaults,
  type GlobalContent,
} from "@/content/defaults/global";
import { globalContentSchema } from "@/content/schemas";
import { applyGlobalSettings } from "@/lib/content/global-settings";
import { mergeContentDefaults } from "@/lib/content/merge-defaults";
import { revalidateContentKey } from "@/lib/content/revalidate";
import type { Prisma } from "@prisma/client";

export async function updateSettings(data: Record<string, string>) {
  try {
    await prisma.$transaction(async (tx) => {
      await Promise.all(Object.entries(data).map(([key, value]) => {
        return tx.setting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        });
      }));

      const document = await tx.contentDocument.findUnique({ where: { key: "global" } });
      if (!document) return;

      const syncContent = (value: unknown) => {
        if (!value) return null;
        const parsed = globalContentSchema.safeParse(
          mergeContentDefaults(globalContentDefaults, value),
        );
        if (!parsed.success) return null;
        return applyGlobalSettings(
          parsed.data as GlobalContent,
          data,
          true,
        ) as Prisma.InputJsonValue;
      };

      const draftData = syncContent(document.draftData);
      const publishedData = syncContent(document.publishedData);
      await tx.contentDocument.update({
        where: { key: "global" },
        data: {
          ...(draftData && { draftData }),
          ...(publishedData && { publishedData }),
        },
      });
    });
    revalidateContentKey("global");
    
    return { success: true };
  } catch (error: any) {
    console.error("Lỗi cập nhật cài đặt:", error);
    return { success: false, error: error.message };
  }
}
