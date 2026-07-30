import assert from "node:assert/strict";
import { after, beforeEach, describe, test } from "node:test";
import { prisma } from "@/lib/db";
import type { AiTaskStatus } from "@prisma/client";
import {
  processAiQueueBatch,
  recoverStaleAiTasks,
} from "../queue-processor";
import { getQueueStatus } from "../settings";
import type {
  ArticleGenerator,
  GenerateArticleInput,
  ImageGenerator,
} from "../types";

const hasTestDatabase = Boolean(process.env.AI_QUEUE_TEST_DATABASE_URL);
const now = new Date("2026-07-30T08:00:00.000Z");

class FakeArticleGenerator implements ArticleGenerator {
  constructor(
    private readonly shouldFail: (topic: string) => boolean = () => false,
    private readonly delayMs = 0,
  ) {}

  async generate(input: GenerateArticleInput) {
    if (this.delayMs) {
      await new Promise((resolve) => setTimeout(resolve, this.delayMs));
    }
    if (this.shouldFail(input.topic)) throw new Error(`FAKE_FAILURE:${input.topic}`);

    return {
      title: input.topic,
      excerpt: `Tóm tắt ${input.topic}`,
      seoTitle: input.topic,
      seoDescription: `Mô tả SEO ${input.topic}`,
      keywords: [input.topic],
      content: `<h2>${input.topic}</h2><p>Nội dung kiểm thử.</p>`,
      coverImageAlt: `Ảnh bìa ${input.topic}`,
      coverImagePrompt: `Ảnh bìa ${input.topic}`,
      imagePlans: [],
      internalLinks: [],
    };
  }
}

const fakeImageGenerator: ImageGenerator = {
  async generate() {
    throw new Error("IMAGE_GENERATOR_MUST_NOT_BE_CALLED");
  },
};

function dependencies(articleGenerator: ArticleGenerator) {
  return {
    articleGenerator,
    imageGenerator: fakeImageGenerator,
    now: () => new Date(now),
  };
}

async function createTask(
  keyword: string,
  input: {
    scheduleTime?: Date;
    autoPublish?: boolean;
    categoryId?: string | null;
    status?: AiTaskStatus;
    attempts?: number;
    lockedAt?: Date | null;
    withImages?: boolean;
    imageCount?: number;
  } = {},
) {
  return prisma.aiTask.create({
    data: {
      keyword,
      scheduleTime: input.scheduleTime || new Date(now.getTime() - 60_000),
      autoPublish: input.autoPublish ?? false,
      categoryId: input.categoryId,
      status: input.status || "PENDING",
      attempts: input.attempts || 0,
      lockedAt: input.lockedAt,
      withImages: input.withImages ?? false,
      imageCount: input.imageCount ?? 0,
      claimToken: input.status?.startsWith("GENERATING") ? `${keyword}-claim` : null,
    },
  });
}

async function setAutoEnabled(enabled: boolean) {
  await prisma.setting.upsert({
    where: { key: "ai_queue_auto_enabled" },
    update: { value: String(enabled) },
    create: { key: "ai_queue_auto_enabled", value: String(enabled) },
  });
}

describe(
  "AI queue processor integration",
  { skip: !hasTestDatabase, concurrency: false },
  () => {
    beforeEach(async () => {
      await prisma.aiTask.deleteMany();
      await prisma.post.deleteMany();
      await prisma.category.deleteMany();
      await prisma.setting.deleteMany();
      await setAutoEnabled(true);
    });

    after(async () => {
      await prisma.$disconnect();
    });

    test("ignores future items and processes all due items in order", async () => {
      await createTask("Bài chưa đến giờ", {
        scheduleTime: new Date(now.getTime() + 60_000),
      });
      await createTask("Bài đến giờ thứ nhất");
      await createTask("Bài đến giờ thứ hai");

      const stats = await processAiQueueBatch({
        limit: 20,
        dependencies: dependencies(new FakeArticleGenerator()),
      });

      assert.equal(stats.claimed, 2);
      assert.equal(stats.success, 2);
      assert.equal(await prisma.post.count(), 2);
      assert.equal(
        await prisma.aiTask.count({ where: { status: "PENDING" } }),
        1,
      );
    });

    test("continues the batch after a failure and schedules retry", async () => {
      const failedTask = await createTask("FAIL bài thứ nhất");
      const successfulTask = await createTask("Bài thứ hai vẫn chạy");

      const stats = await processAiQueueBatch({
        limit: 20,
        dependencies: dependencies(
          new FakeArticleGenerator((topic) => topic.startsWith("FAIL")),
        ),
      });
      const [failed, successful] = await Promise.all([
        prisma.aiTask.findUniqueOrThrow({ where: { id: failedTask.id } }),
        prisma.aiTask.findUniqueOrThrow({ where: { id: successfulTask.id } }),
      ]);

      assert.equal(stats.retrying, 1);
      assert.equal(stats.success, 1);
      assert.equal(failed.status, "PENDING");
      assert.equal(failed.attempts, 1);
      assert.equal(failed.nextAttemptAt?.toISOString(), "2026-07-30T08:02:00.000Z");
      assert.equal(successful.status, "COMPLETED");
    });

    test("honors publish mode and assigns the selected category", async () => {
      const category = await prisma.category.create({
        data: {
          name: "Kiến thức",
          slug: "kien-thuc-test",
        },
      });
      const publishedTask = await createTask("Bài tự đăng", {
        autoPublish: true,
        categoryId: category.id,
      });
      const draftTask = await createTask("Bài bản nháp", {
        autoPublish: false,
        categoryId: category.id,
      });

      await processAiQueueBatch({
        limit: 20,
        dependencies: dependencies(new FakeArticleGenerator()),
      });
      const [published, draft] = await Promise.all([
        prisma.post.findFirstOrThrow({
          where: { aiTask: { id: publishedTask.id } },
        }),
        prisma.post.findFirstOrThrow({
          where: { aiTask: { id: draftTask.id } },
        }),
      ]);

      assert.equal(published.status, "PUBLISHED");
      assert.equal(published.publishedAt?.toISOString(), now.toISOString());
      assert.equal(published.categoryId, category.id);
      assert.equal(draft.status, "DRAFT");
      assert.equal(draft.publishedAt, null);
      assert.equal(draft.categoryId, category.id);
    });

    test("keeps the article when image generation fails", async () => {
      const task = await createTask("Bài vẫn giữ khi ảnh lỗi", {
        withImages: true,
      });
      const stats = await processAiQueueBatch({
        taskId: task.id,
        force: true,
        dependencies: dependencies(new FakeArticleGenerator()),
      });
      const completed = await prisma.aiTask.findUniqueOrThrow({
        where: { id: task.id },
      });

      assert.equal(stats.success, 1);
      assert.equal(completed.status, "COMPLETED");
      assert.match(completed.errorMessage || "", /IMAGE_GENERATOR_MUST_NOT_BE_CALLED/);
      assert.equal(await prisma.post.count(), 1);
    });

    test("atomic claim prevents duplicate posts from concurrent callers", async () => {
      const task = await createTask("Bài xử lý đồng thời");
      const options = {
        taskId: task.id,
        force: true,
        dependencies: dependencies(new FakeArticleGenerator(() => false, 50)),
      };

      const results = await Promise.all([
        processAiQueueBatch(options),
        processAiQueueBatch(options),
      ]);

      assert.equal(results.reduce((sum, result) => sum + result.success, 0), 1);
      assert.equal(await prisma.post.count(), 1);
      const repeated = await processAiQueueBatch(options);
      assert.equal(repeated.claimed, 0);
      assert.equal(await prisma.post.count(), 1);
    });

    test("moves an item to failed after the third attempt", async () => {
      const task = await createTask("FAIL ba lần");
      const options = {
        taskId: task.id,
        force: true,
        dependencies: dependencies(new FakeArticleGenerator(() => true)),
      };

      await processAiQueueBatch(options);
      await processAiQueueBatch(options);
      const finalStats = await processAiQueueBatch(options);
      const finalTask = await prisma.aiTask.findUniqueOrThrow({
        where: { id: task.id },
      });

      assert.equal(finalStats.failed, 1);
      assert.equal(finalTask.status, "FAILED");
      assert.equal(finalTask.attempts, 3);
      assert.equal(finalTask.nextAttemptAt, null);
    });

    test("recovers stale claims and disabled scheduler only writes heartbeat", async () => {
      const stale = await createTask("Bài bị kẹt", {
        status: "GENERATING_TEXT",
        lockedAt: new Date(now.getTime() - 31 * 60_000),
      });
      assert.equal(await recoverStaleAiTasks(now), 1);
      assert.equal(
        (await prisma.aiTask.findUniqueOrThrow({ where: { id: stale.id } })).status,
        "PENDING",
      );

      await setAutoEnabled(false);
      const stats = await processAiQueueBatch({
        dependencies: dependencies(new FakeArticleGenerator()),
      });
      const status = await getQueueStatus();

      assert.equal(stats.claimed, 0);
      assert.equal(status.autoEnabled, false);
      assert.equal(status.pendingCount, 1);
      assert.ok(status.schedulerLastSeenAt);
      assert.ok(status.schedulerLastRunAt);
    });
  },
);
