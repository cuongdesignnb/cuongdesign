import { randomUUID } from "node:crypto";
import type { AiTask, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { sanitizeRichHtml } from "@/lib/content/sanitize";
import { normalizeSlug } from "@/lib/seo/slug";
import { ensureImageAlt, insertInlineImages } from "./html";
import { OpenAiArticleGenerator } from "./openai-article-generator";
import { OpenAiImageGenerator } from "./openai-image-generator";
import {
  getAiRuntimeConfig,
  writeSchedulerHeartbeat,
} from "./settings";
import type { ArticleGenerator, ImageGenerator } from "./types";

const STALE_AFTER_MS = 30 * 60 * 1000;
const RETRY_DELAYS_MS = [2 * 60 * 1000, 5 * 60 * 1000];

export interface QueueBatchStats {
  claimed: number;
  success: number;
  retrying: number;
  failed: number;
  skipped: number;
  recovered: number;
}

interface ProcessorDependencies {
  articleGenerator: ArticleGenerator;
  imageGenerator: ImageGenerator;
  now: () => Date;
}

interface ProcessBatchOptions {
  limit?: number;
  force?: boolean;
  taskId?: string;
  dependencies?: Partial<ProcessorDependencies>;
}

interface ClaimedTask {
  task: AiTask;
  claimToken: string;
}

function logEvent(
  event: string,
  context: Record<string, string | number | boolean | null | undefined>,
) {
  console.info(event, JSON.stringify(context));
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message.slice(0, 2000) : "UNKNOWN_ERROR";
}

export async function recoverStaleAiTasks(now = new Date()) {
  const staleBefore = new Date(now.getTime() - STALE_AFTER_MS);
  const stale = await prisma.aiTask.findMany({
    where: {
      status: { in: ["GENERATING_TEXT", "GENERATING_IMAGE"] },
      lockedAt: { lt: staleBefore },
      generatedPostId: null,
    },
    select: { id: true, keyword: true, attempts: true },
  });

  if (stale.length === 0) return 0;

  await prisma.aiTask.updateMany({
    where: { id: { in: stale.map((task) => task.id) } },
    data: {
      status: "PENDING",
      lockedAt: null,
      claimToken: null,
      nextAttemptAt: now,
      errorMessage: "STALE_TASK_RECOVERED",
    },
  });
  stale.forEach((task) =>
    logEvent("AI_QUEUE_STALE_ITEM_RECOVERED", {
      queue_item_id: task.id,
      topic: task.keyword,
      attempt: task.attempts,
    }),
  );
  return stale.length;
}

async function claimTask(
  taskId: string,
  now: Date,
  force: boolean,
): Promise<ClaimedTask | null> {
  const claimToken = randomUUID();
  const claimed = await prisma.aiTask.updateMany({
    where: {
      id: taskId,
      status: "PENDING",
      generatedPostId: null,
      ...(force
        ? {}
        : {
            scheduleTime: { lte: now },
            OR: [{ nextAttemptAt: null }, { nextAttemptAt: { lte: now } }],
          }),
    },
    data: {
      status: "GENERATING_TEXT",
      claimToken,
      lockedAt: now,
      lastAttemptAt: now,
      startedAt: now,
      attempts: { increment: 1 },
      errorMessage: null,
    },
  });
  if (claimed.count !== 1) return null;

  const task = await prisma.aiTask.findUnique({ where: { id: taskId } });
  if (!task || task.claimToken !== claimToken) return null;
  logEvent("AI_QUEUE_ITEM_CLAIMED", {
    queue_item_id: task.id,
    topic: task.keyword,
    attempt: task.attempts,
    scheduled_at: task.scheduleTime.toISOString(),
    auto_publish: task.autoPublish,
  });
  return { task, claimToken };
}

async function uniquePostSlug(
  tx: Prisma.TransactionClient,
  title: string,
  taskId: string,
) {
  const base = normalizeSlug(title) || `bai-viet-${taskId.slice(-8)}`;
  const existing = await tx.post.findUnique({
    where: { slug: base },
    select: { id: true },
  });
  return existing ? `${base}-${taskId.slice(-8)}` : base;
}

async function processClaimedTask(
  claimed: ClaimedTask,
  dependencies: ProcessorDependencies,
) {
  const { task, claimToken } = claimed;
  const started = Date.now();
  const article = await dependencies.articleGenerator.generate({
    topic: task.keyword,
    categoryId: task.categoryId,
    tone: task.tone as "professional" | "casual" | "luxury",
    length: task.length as "short" | "medium" | "long",
    sharedKeywords: task.sharedKeywords,
    imageCount: task.withImages ? task.imageCount : 0,
  });

  let coverImage: Awaited<ReturnType<ImageGenerator["generate"]>> | null = null;
  const inlineImages: Array<
    Awaited<ReturnType<ImageGenerator["generate"]>> & { afterHeading?: string }
  > = [];

  if (task.withImages) {
    const statusUpdated = await prisma.aiTask.updateMany({
      where: { id: task.id, claimToken, generatedPostId: null },
      data: { status: "GENERATING_IMAGE" },
    });
    if (statusUpdated.count !== 1) throw new Error("AI_TASK_CLAIM_LOST");

    coverImage = await dependencies.imageGenerator.generate({
      title: article.title,
      prompt: article.coverImagePrompt,
      alt: article.coverImageAlt,
      kind: "cover",
    });
    for (const plan of article.imagePlans.slice(0, task.imageCount)) {
      const image = await dependencies.imageGenerator.generate({
        title: article.title,
        prompt: plan.prompt,
        alt: plan.alt,
        kind: "inline",
      });
      inlineImages.push({ ...image, afterHeading: plan.afterHeading });
    }
  }

  const content = ensureImageAlt(
    sanitizeRichHtml(insertInlineImages(article.content, inlineImages)),
    article.title,
  );
  const completedAt = dependencies.now();
  const post = await prisma.$transaction(async (tx) => {
    const current = await tx.aiTask.findUnique({ where: { id: task.id } });
    if (
      !current ||
      current.generatedPostId ||
      current.claimToken !== claimToken ||
      !["GENERATING_TEXT", "GENERATING_IMAGE"].includes(current.status)
    ) {
      return null;
    }

    const slug = await uniquePostSlug(tx, article.title, task.id);
    const created = await tx.post.create({
      data: {
        title: article.title,
        slug,
        excerpt: article.excerpt,
        content,
        coverImage: coverImage?.url || null,
        coverImageAlt: coverImage?.alt || null,
        status: task.autoPublish ? "PUBLISHED" : "DRAFT",
        publishedAt: task.autoPublish ? completedAt : null,
        categoryId: task.categoryId,
        seoTitle: article.seoTitle,
        seoDescription: article.seoDescription,
        seoKeywords: article.keywords,
        ogTitle: article.seoTitle,
        ogDescription: article.seoDescription,
        ogImage: coverImage?.url || null,
        schemaMarkup: {
          generatedBy: "ai-queue",
          internalLinks: article.internalLinks.map((link) => ({
            anchor: link.anchor,
            href: link.href,
            postId: link.postId,
          })),
          generatedImages: [
            ...(coverImage ? [{ url: coverImage.url, alt: coverImage.alt }] : []),
            ...inlineImages.map((image) => ({ url: image.url, alt: image.alt })),
          ],
        } as Prisma.InputJsonObject,
      },
    });

    const updated = await tx.aiTask.updateMany({
      where: {
        id: task.id,
        claimToken,
        generatedPostId: null,
      },
      data: {
        status: "COMPLETED",
        generatedPostId: created.id,
        completedAt,
        lockedAt: null,
        claimToken: null,
        nextAttemptAt: null,
        errorMessage: null,
      },
    });
    if (updated.count !== 1) throw new Error("AI_TASK_FINALIZE_FAILED");
    return created;
  });

  if (!post) {
    logEvent("AI_QUEUE_ITEM_SKIPPED", {
      queue_item_id: task.id,
      topic: task.keyword,
      reason: "claim_lost_or_already_completed",
    });
    return null;
  }

  logEvent("AI_QUEUE_ITEM_DONE", {
    queue_item_id: task.id,
    topic: task.keyword,
    attempt: task.attempts,
    article_id: post.id,
    auto_publish: task.autoPublish,
    duration_ms: Date.now() - started,
    result: "success",
  });
  return post;
}

async function scheduleRetry(
  claimed: ClaimedTask,
  error: unknown,
  now: Date,
): Promise<"retrying" | "failed" | "skipped"> {
  const { task, claimToken } = claimed;
  const failed = task.attempts >= task.maxAttempts;
  const delay =
    RETRY_DELAYS_MS[Math.min(task.attempts - 1, RETRY_DELAYS_MS.length - 1)];
  const updated = await prisma.aiTask.updateMany({
    where: { id: task.id, claimToken, generatedPostId: null },
    data: failed
      ? {
          status: "FAILED",
          errorMessage: errorMessage(error),
          completedAt: now,
          lockedAt: null,
          claimToken: null,
          nextAttemptAt: null,
        }
      : {
          status: "PENDING",
          errorMessage: errorMessage(error),
          nextAttemptAt: new Date(now.getTime() + delay),
          lockedAt: null,
          claimToken: null,
        },
  });
  if (updated.count !== 1) return "skipped";

  logEvent(failed ? "AI_QUEUE_ITEM_FAILED" : "AI_QUEUE_ITEM_RETRY", {
    queue_item_id: task.id,
    topic: task.keyword,
    attempt: task.attempts,
    scheduled_at: task.scheduleTime.toISOString(),
    auto_publish: task.autoPublish,
    result: failed ? "failed" : "retrying",
    error: errorMessage(error),
  });
  return failed ? "failed" : "retrying";
}

export async function processAiQueueBatch(
  options: ProcessBatchOptions = {},
): Promise<QueueBatchStats> {
  const config = await getAiRuntimeConfig();
  const limit = Math.min(20, Math.max(1, options.limit || config.batchLimit));
  const dependencies: ProcessorDependencies = {
    articleGenerator:
      options.dependencies?.articleGenerator || new OpenAiArticleGenerator(),
    imageGenerator:
      options.dependencies?.imageGenerator || new OpenAiImageGenerator(),
    now: options.dependencies?.now || (() => new Date()),
  };
  const now = dependencies.now();
  const stats: QueueBatchStats = {
    claimed: 0,
    success: 0,
    retrying: 0,
    failed: 0,
    skipped: 0,
    recovered: 0,
  };

  await writeSchedulerHeartbeat();
  logEvent("AI_QUEUE_RUN_STARTED", {
    force: Boolean(options.force),
    limit,
  });

  if (!config.autoEnabled && !options.force) {
    await writeSchedulerHeartbeat({ ...stats, auto_enabled: false });
    logEvent("AI_QUEUE_RUN_FINISHED", { ...stats });
    return stats;
  }

  stats.recovered = await recoverStaleAiTasks(now);
  const tasks = options.taskId
    ? [{ id: options.taskId }]
    : await prisma.aiTask.findMany({
        where: {
          status: "PENDING",
          generatedPostId: null,
          scheduleTime: { lte: now },
          OR: [{ nextAttemptAt: null }, { nextAttemptAt: { lte: now } }],
        },
        orderBy: [{ scheduleTime: "asc" }, { id: "asc" }],
        take: limit,
        select: { id: true },
      });

  for (const candidate of tasks) {
    const claimed = await claimTask(
      candidate.id,
      now,
      Boolean(options.force || options.taskId),
    );
    if (!claimed) {
      stats.skipped += 1;
      continue;
    }
    stats.claimed += 1;

    try {
      const post = await processClaimedTask(claimed, dependencies);
      if (post) stats.success += 1;
      else stats.skipped += 1;
    } catch (error) {
      const result = await scheduleRetry(claimed, error, dependencies.now());
      stats[result] += 1;
    }
  }

  await writeSchedulerHeartbeat({ ...stats, auto_enabled: config.autoEnabled });
  logEvent("AI_QUEUE_RUN_FINISHED", { ...stats });
  return stats;
}
