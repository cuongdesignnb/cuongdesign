import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { prisma } from "@/lib/db";
import { normalizeSlug } from "@/lib/seo/slug";
import { getAiRuntimeConfig } from "./settings";
import type { GeneratedImage, ImageGenerator } from "./types";

function extractImageBuffer(payload: unknown): Promise<Buffer> {
  const data = payload as {
    data?: Array<{ b64_json?: string; url?: string }>;
  };
  const first = data.data?.[0];
  if (first?.b64_json) {
    return Promise.resolve(Buffer.from(first.b64_json, "base64"));
  }
  if (first?.url) {
    return fetch(first.url).then(async (response) => {
      if (!response.ok) throw new Error("AI_IMAGE_DOWNLOAD_FAILED");
      return Buffer.from(await response.arrayBuffer());
    });
  }
  return Promise.reject(new Error("AI_IMAGE_EMPTY_RESPONSE"));
}

export class OpenAiImageGenerator implements ImageGenerator {
  async generate(input: {
    title: string;
    prompt: string;
    alt: string;
    kind: "cover" | "inline";
  }): Promise<GeneratedImage> {
    const config = await getAiRuntimeConfig();
    if (!config.imageApiKey) {
      throw new Error("AI_IMAGE_API_KEY_MISSING");
    }

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.imageApiKey}`,
      },
      body: JSON.stringify({
        model: config.imageModel,
        prompt: `${input.prompt}\nNo text, letters, captions, logos or watermarks.`,
        n: 1,
        size: "1536x1024",
        quality: "medium",
        output_format: "webp",
      }),
    });

    if (!response.ok) {
      const detail = (await response.text()).slice(0, 600);
      throw new Error(`AI_IMAGE_API_ERROR_${response.status}: ${detail}`);
    }

    const source = await extractImageBuffer(await response.json());
    const webp = await sharp(source).webp({ quality: 82 }).toBuffer();
    const metadata = await sharp(webp).metadata();
    const storageKey = path.posix.join(
      "blog",
      `${Date.now()}-${input.kind}-${normalizeSlug(input.title).slice(0, 72)}.webp`,
    );
    const uploadRoot = path.resolve(process.cwd(), "public", "uploads");
    const filePath = path.resolve(uploadRoot, ...storageKey.split("/"));
    if (!filePath.startsWith(`${uploadRoot}${path.sep}`)) {
      throw new Error("AI_IMAGE_INVALID_STORAGE_PATH");
    }
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, webp);

    const url = `/uploads/${storageKey}`;
    const media = await prisma.media.create({
      data: {
        name: `${input.title} - ${input.kind === "cover" ? "Ảnh bìa" : "Ảnh nội dung"}`,
        url,
        storageKey,
        size: webp.length,
        width: metadata.width || null,
        height: metadata.height || null,
        alt: input.alt.trim(),
        mimeType: "image/webp",
      },
    });

    return {
      mediaId: media.id,
      url,
      alt: media.alt || input.alt.trim(),
      width: media.width,
      height: media.height,
    };
  }
}
