import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { prisma } from "@/lib/db";
import { resolveMediaStoragePath } from "@/lib/media/storage";
import { normalizeSlug } from "@/lib/seo/slug";
import { AiProviderError, providerEndpoint, type Fetcher } from "./provider";
import { getAiRuntimeConfig, type AiRuntimeConfig } from "./settings";
import type { GeneratedImage, ImageGenerator } from "./types";

const DEFAULT_GENERATION_TIMEOUT_MS = timeoutFromEnv(
  "AI_IMAGE_GENERATION_TIMEOUT_MS",
  120_000,
);
const DEFAULT_DOWNLOAD_TIMEOUT_MS = timeoutFromEnv(
  "AI_IMAGE_DOWNLOAD_TIMEOUT_MS",
  45_000,
);

function timeoutFromEnv(name: string, fallback: number) {
  const value = Number.parseInt(process.env[name] || "", 10);
  if (!Number.isFinite(value)) return fallback;
  return Math.min(5 * 60_000, Math.max(5_000, value));
}

async function withImageTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number,
  stage: "generation" | "download",
  cancel?: () => void,
) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      cancel?.();
      reject(new Error(`AI_IMAGE_TIMEOUT: ${stage}`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([Promise.resolve().then(operation), timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function fetchImageWithTimeout(
  fetcher: Fetcher,
  input: string | URL,
  init: RequestInit | undefined,
  timeoutMs: number,
  stage: "generation" | "download",
) {
  const controller = new AbortController();
  return withImageTimeout(
    () => fetcher(input, { ...init, signal: controller.signal }),
    timeoutMs,
    stage,
    () => controller.abort(),
  );
}

async function extractImageBuffer(
  payload: unknown,
  fetcher: Fetcher,
  downloadTimeoutMs: number,
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
    const response = await fetchImageWithTimeout(
      fetcher,
      imageUrl,
      undefined,
      downloadTimeoutMs,
      "download",
    );
    if (!response.ok) throw new Error("AI_IMAGE_DOWNLOAD_FAILED");
    return Buffer.from(
      await withImageTimeout(
        () => response.arrayBuffer(),
        downloadTimeoutMs,
        "download",
      ),
    );
  }
  throw new Error("AI_IMAGE_EMPTY_RESPONSE");
}

export async function requestImageSource(input: {
  config: AiRuntimeConfig;
  prompt: string;
  fetcher?: Fetcher;
  timeouts?: {
    generationMs?: number;
    downloadMs?: number;
  };
}): Promise<Buffer> {
  const fetcher = input.fetcher || fetch;
  const generationTimeoutMs = input.timeouts?.generationMs || DEFAULT_GENERATION_TIMEOUT_MS;
  const downloadTimeoutMs = input.timeouts?.downloadMs || DEFAULT_DOWNLOAD_TIMEOUT_MS;
  const response = await fetchImageWithTimeout(
    fetcher,
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
    generationTimeoutMs,
    "generation",
  );
  if (!response.ok) {
    const detail =
      (await withImageTimeout(
        () => response.text(),
        generationTimeoutMs,
        "generation",
      )).trim().slice(0, 600) ||
      `Image provider returned HTTP ${response.status}`;
    throw new AiProviderError("image", response.status, detail);
  }
  return extractImageBuffer(
    await withImageTimeout(
      () => response.json(),
      generationTimeoutMs,
      "generation",
    ),
    fetcher,
    downloadTimeoutMs,
  );
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
    const { filePath } = resolveMediaStoragePath(storageKey);
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
