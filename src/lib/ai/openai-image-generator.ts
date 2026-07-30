import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { prisma } from "@/lib/db";
import { normalizeSlug } from "@/lib/seo/slug";
import { AiProviderError, providerEndpoint, type Fetcher } from "./provider";
import { getAiRuntimeConfig, type AiRuntimeConfig } from "./settings";
import type { GeneratedImage, ImageGenerator } from "./types";

async function extractImageBuffer(
  payload: unknown,
  fetcher: Fetcher,
): Promise<Buffer> {
  const data = payload as {
    data?: Array<{ b64_json?: string; url?: string }>;
  };
  const first = data.data?.[0];
  if (first?.b64_json) {
    return Buffer.from(first.b64_json, "base64");
  }
  if (first?.url) {
    const imageUrl = new URL(first.url);
    if (imageUrl.protocol !== "https:") {
      throw new Error("AI_IMAGE_DOWNLOAD_HTTPS_REQUIRED");
    }
    const response = await fetcher(imageUrl);
    if (!response.ok) throw new Error("AI_IMAGE_DOWNLOAD_FAILED");
    return Buffer.from(await response.arrayBuffer());
  }
  throw new Error("AI_IMAGE_EMPTY_RESPONSE");
}

export async function requestImageSource(input: {
  config: AiRuntimeConfig;
  prompt: string;
  fetcher?: Fetcher;
}): Promise<Buffer> {
  const fetcher = input.fetcher || fetch;
  const response = await fetcher(
    providerEndpoint(input.config.imageBaseUrl, "images/generations"),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${input.config.imageApiKey}`,
      },
      body: JSON.stringify({
        model: input.config.imageModel,
        prompt: `${input.prompt}\nNo text, letters, captions, logos or watermarks.`,
        n: 1,
        size: "1536x1024",
        quality: input.config.imageQuality,
        output_format: "png",
      }),
    },
  );
  if (!response.ok) {
    const detail =
      (await response.text()).trim().slice(0, 600) ||
      `Image provider returned HTTP ${response.status}`;
    throw new AiProviderError("image", response.status, detail);
  }
  return extractImageBuffer(await response.json(), fetcher);
}

export class OpenAiImageGenerator implements ImageGenerator {
  constructor(private readonly fetcher: Fetcher = fetch) {}

  async generate(input: {
    title: string;
    prompt: string;
    alt: string;
    caption?: string;
    kind: "cover" | "inline";
  }): Promise<GeneratedImage> {
    const config = await getAiRuntimeConfig();
    if (!config.imageApiKey) {
      throw new Error("AI_IMAGE_API_KEY_MISSING");
    }

    const source = await requestImageSource({
      config,
      prompt: input.prompt,
      fetcher: this.fetcher,
    });
    const webp = await sharp(source)
      .rotate()
      .resize({
        width: 1600,
        height: 1600,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toBuffer();
    const metadata = await sharp(webp).metadata();
    const now = new Date();
    const storageKey = path.posix.join(
      "ai-generated",
      `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`,
      `${Date.now()}-${input.kind}-${normalizeSlug(input.title).slice(0, 72)}.webp`,
    );
    const uploadRoot = path.resolve(process.cwd(), "public", "uploads");
    const filePath = path.resolve(uploadRoot, ...storageKey.split("/"));
    if (!filePath.startsWith(`${uploadRoot}${path.sep}`)) {
      throw new Error("AI_IMAGE_INVALID_STORAGE_PATH");
    }
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, webp);

    const alt = input.alt.trim() || input.title.trim();
    const caption = input.caption?.trim() || alt;
    const url = `/uploads/${storageKey}`;
    const media = await prisma.media.create({
      data: {
        name: `${input.title} - ${input.kind === "cover" ? "Ảnh bìa" : "Ảnh nội dung"}`,
        url,
        storageKey,
        size: webp.length,
        width: metadata.width || null,
        height: metadata.height || null,
        alt,
        caption,
        mimeType: "image/webp",
      },
    });

    return {
      mediaId: media.id,
      url,
      alt: media.alt || alt,
      caption: media.caption || caption,
      width: media.width,
      height: media.height,
    };
  }
}
