import { prisma } from "@/lib/db";

const AI_SETTING_KEYS = [
  "openai_api_key",
  "openai_text_api_key",
  "openai_text_model",
  "openai_image_api_key",
  "openai_image_model",
  "ai_writer_prompt",
  "ai_queue_auto_enabled",
  "ai_queue_batch_limit",
] as const;

export interface AiRuntimeConfig {
  textApiKey: string;
  textModel: string;
  imageApiKey: string;
  imageModel: string;
  writerPrompt: string;
  autoEnabled: boolean;
  batchLimit: number;
}

function parseBoolean(value: string | undefined, fallback: boolean) {
  if (value === undefined) return fallback;
  return !["false", "0", "off", "no"].includes(value.toLowerCase());
}

function clampBatchLimit(value: string | undefined) {
  const parsed = Number.parseInt(value || "5", 10);
  if (!Number.isFinite(parsed)) return 5;
  return Math.min(20, Math.max(1, parsed));
}

export async function getAiRuntimeConfig(): Promise<AiRuntimeConfig> {
  const rows = await prisma.setting.findMany({
    where: { key: { in: [...AI_SETTING_KEYS] } },
  });
  const settings = Object.fromEntries(rows.map((row) => [row.key, row.value]));

  return {
    textApiKey:
      settings.openai_text_api_key ||
      settings.openai_api_key ||
      process.env.OPENAI_TEXT_API_KEY ||
      process.env.OPENAI_API_KEY ||
      "",
    textModel:
      settings.openai_text_model ||
      process.env.OPENAI_TEXT_MODEL ||
      "gpt-5-mini",
    imageApiKey:
      settings.openai_image_api_key ||
      process.env.OPENAI_IMAGE_API_KEY ||
      "",
    imageModel:
      settings.openai_image_model ||
      process.env.OPENAI_IMAGE_MODEL ||
      "gpt-image-1",
    writerPrompt: settings.ai_writer_prompt || "",
    autoEnabled: parseBoolean(settings.ai_queue_auto_enabled, false),
    batchLimit: clampBatchLimit(settings.ai_queue_batch_limit),
  };
}

export async function writeSchedulerHeartbeat(
  result?: Record<string, number | boolean | string>,
) {
  const now = new Date().toISOString();
  const values: Record<string, string> = {
    ai_queue_scheduler_last_seen_at: now,
    ...(result
      ? {
          ai_queue_scheduler_last_run_at: now,
          ai_queue_scheduler_last_success_at: now,
          ai_queue_scheduler_last_result: JSON.stringify(result),
        }
      : {}),
  };

  await prisma.$transaction(
    Object.entries(values).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      }),
    ),
  );
}

export async function getQueueStatus() {
  const config = await getAiRuntimeConfig();
  const now = new Date();
  const [pendingCount, dueCount, processingCount, failedCount, nextTask, heartbeatRows] =
    await Promise.all([
      prisma.aiTask.count({ where: { status: "PENDING" } }),
      prisma.aiTask.count({
        where: {
          status: "PENDING",
          scheduleTime: { lte: now },
          OR: [{ nextAttemptAt: null }, { nextAttemptAt: { lte: now } }],
        },
      }),
      prisma.aiTask.count({
        where: { status: { in: ["GENERATING_TEXT", "GENERATING_IMAGE"] } },
      }),
      prisma.aiTask.count({ where: { status: "FAILED" } }),
      prisma.aiTask.findFirst({
        where: { status: "PENDING" },
        orderBy: [{ scheduleTime: "asc" }, { id: "asc" }],
        select: { scheduleTime: true },
      }),
      prisma.setting.findMany({
        where: {
          key: {
            in: [
              "ai_queue_scheduler_last_seen_at",
              "ai_queue_scheduler_last_run_at",
              "ai_queue_scheduler_last_success_at",
              "ai_queue_scheduler_last_result",
            ],
          },
        },
      }),
    ]);

  const heartbeat = Object.fromEntries(
    heartbeatRows.map((row) => [row.key, row.value]),
  );
  const lastSeenAt = heartbeat.ai_queue_scheduler_last_seen_at
    ? new Date(heartbeat.ai_queue_scheduler_last_seen_at)
    : null;
  const schedulerOnline = Boolean(
    lastSeenAt &&
      Number.isFinite(lastSeenAt.getTime()) &&
      now.getTime() - lastSeenAt.getTime() <= 3 * 60 * 1000,
  );

  return {
    autoEnabled: config.autoEnabled,
    batchLimit: config.batchLimit,
    schedulerOnline,
    schedulerLastSeenAt: lastSeenAt?.toISOString() || null,
    schedulerLastRunAt: heartbeat.ai_queue_scheduler_last_run_at || null,
    schedulerLastSuccessAt:
      heartbeat.ai_queue_scheduler_last_success_at || null,
    schedulerLastResult: heartbeat.ai_queue_scheduler_last_result || null,
    pendingCount,
    dueCount,
    processingCount,
    failedCount,
    nextScheduledAt: nextTask?.scheduleTime.toISOString() || null,
  };
}
