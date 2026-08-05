import { promises as fs } from "node:fs";
import sharp from "sharp";
import { getPublishedContent } from "@/lib/content/get-content";
import { getSiteUrl } from "@/lib/seo/url";
import { isIcoFile } from "./ico";
import { resolveMediaStoragePath } from "./storage";

const ICON_SIZE = 48;

export interface FaviconFile {
  body: Buffer;
  contentType: "image/png" | "image/x-icon";
}

export function faviconStorageKey(url: string | null | undefined) {
  if (!url) return null;

  try {
    const siteUrl = new URL(getSiteUrl());
    const mediaUrl = new URL(url, siteUrl);
    if (mediaUrl.origin !== siteUrl.origin || !mediaUrl.pathname.startsWith("/uploads/")) {
      return null;
    }

    const storageKey = decodeURIComponent(mediaUrl.pathname.slice("/uploads/".length));
    return storageKey || null;
  } catch {
    return null;
  }
}

async function createFallbackIcon() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${ICON_SIZE}" height="${ICON_SIZE}" viewBox="0 0 48 48">
      <rect width="48" height="48" rx="10" fill="#120d2b"/>
      <path d="M35.5 14.5A14 14 0 1 0 35.5 33.5" fill="none" stroke="#ec4899" stroke-width="6" stroke-linecap="round"/>
      <circle cx="35.5" cy="24" r="3" fill="#a855f7"/>
    </svg>`;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

export async function getPublishedFavicon(): Promise<FaviconFile> {
  const global = await getPublishedContent("global");
  const storageKey = faviconStorageKey(global.brand.faviconMedia);

  if (storageKey) {
    try {
      const { filePath } = resolveMediaStoragePath(storageKey);
      const source = await fs.readFile(filePath);

      if (isIcoFile(source)) {
        return { body: source, contentType: "image/x-icon" };
      }

      const body = await sharp(source)
        .resize(ICON_SIZE, ICON_SIZE, {
          fit: "contain",
          background: { r: 18, g: 13, b: 43, alpha: 1 },
        })
        .png()
        .toBuffer();
      return { body, contentType: "image/png" };
    } catch (error) {
      console.error("[Favicon] Could not load configured favicon.", error);
    }
  }

  return { body: await createFallbackIcon(), contentType: "image/png" };
}
