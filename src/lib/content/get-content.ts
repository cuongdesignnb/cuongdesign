import { auth } from "@/auth";
import { contentRegistry, type ContentKey } from "@/content/registry";
import { prisma } from "@/lib/db";
import { draftMode } from "next/headers";
import { unstable_cache } from "next/cache";
import { connection } from "next/server";
import { cache } from "react";
import { mergeContentDefaults } from "./merge-defaults";
import { sanitizeContentTree } from "./sanitize";
import {
  applyGlobalSettings,
  GLOBAL_SETTING_KEYS,
} from "./global-settings";
import type { GlobalContent } from "@/content/defaults/global";

async function readDocument(key: ContentKey, preview: boolean) {
  const entry = contentRegistry[key];

  try {
    const document = await prisma.contentDocument.findUnique({ where: { key } });
    const candidate = preview
      ? document?.draftData
      : document?.publishedData;
    const merged = mergeContentDefaults(entry.defaultData, candidate);
    const parsed = entry.schema.safeParse(merged);

    if (!parsed.success) {
      console.error(`[Content Hub] Invalid content for "${key}"`, parsed.error.flatten());
      return entry.defaultData;
    }

    const content = sanitizeContentTree(parsed.data);
    if (key === "global") {
      const settings = await prisma.setting.findMany({
        where: { key: { in: [...GLOBAL_SETTING_KEYS] } },
        select: { key: true, value: true },
      });
      return applyGlobalSettings(content as GlobalContent, settings);
    }

    return content;
  } catch (error) {
    console.error(`[Content Hub] Could not resolve "${key}", using defaults.`, error);
    return entry.defaultData;
  }
}

const readPublishedDocument = cache((key: ContentKey) =>
  unstable_cache(
    () => readDocument(key, false),
    ["content-document", key],
    { tags: [`content:${key}`] },
  )(),
);

const readDraftDocument = cache((key: ContentKey) => readDocument(key, true));

export async function getPublishedContent<K extends ContentKey>(key: K) {
  await connection();
  const draft = await draftMode();
  let preview = false;

  if (draft.isEnabled) {
    const session = await auth();
    preview = (session?.user as { role?: string } | undefined)?.role === "ADMIN";
  }

  return (preview ? readDraftDocument(key) : readPublishedDocument(key)) as Promise<
    (typeof contentRegistry)[K]["defaultData"]
  >;
}
