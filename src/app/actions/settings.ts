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
import { requireAdmin } from "@/lib/auth/require-admin";
import { validateAiSettingValues } from "@/lib/ai/settings";
import { isSecretSettingKey } from "@/lib/settings/secrets";

export async function updateSettings(data: Record<string, string>) {
  try {
    await requireAdmin();
    const normalized = Object.fromEntries(
      Object.entries(data).filter(([key, value]) => {
        if (isSecretSettingKey(key) && !value.trim()) return false;
        return true;
      }).map(([key, value]) => [key, value.trim()]),
    );
    validateAiSettingValues(normalized);
    await prisma.$transaction(async (tx) => {
      await Promise.all(Object.entries(normalized).map(([key, value]) => {
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
          normalized,
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
