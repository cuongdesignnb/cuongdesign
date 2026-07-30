import { prisma } from "@/lib/db";

export type AiWireApi = "chat_completions" | "responses";
export type AiReasoningEffort = "none" | "low" | "medium" | "high" | "xhigh";
export type AiImageQuality = "low" | "medium" | "high" | "auto";

const AI_SETTING_KEYS = [
  "openai_api_key",
  "openai_text_api_key",
  "openai_base_url",
  "openai_wire_api",
  "openai_model",
  "openai_text_model",
  "openai_reasoning_effort",
  "openai_max_tokens",
  "openai_image_api_key",
  "openai_image_base_url",
  "openai_image_model",
  "openai_image_quality",
  "ai_writer_prompt",
  "ai_queue_auto_enabled",
  "ai_queue_batch_limit",
] as const;

export interface AiRuntimeConfig {
  textApiKey: string;
  textBaseUrl: string;
  textWireApi: AiWireApi;
  textModel: string;
  textReasoningEffort: AiReasoningEffort;
  textMaxTokens: number;
  imageApiKey: string;
  imageBaseUrl: string;
  imageModel: string;
  imageQuality: AiImageQuality;
  writerPrompt: string;
  autoEnabled: boolean;
  batchLimit: number;
}

type SettingValues = Record<string, string | undefined>;

function firstNonEmpty(...values: Array<string | undefined>): string {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return "";
}

function parseBoolean(value: string | undefined, fallback: boolean) {
  if (value === undefined || !value.trim()) return fallback;
  return !["false", "0", "off", "no"].includes(value.trim().toLowerCase());
}

function parseInteger(
  value: string | undefined,
  fallback: number,
  minimum: number,
  maximum: number,
) {
  if (!value?.trim()) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(maximum, Math.max(minimum, parsed));
}

function parseMaxTokens(value: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 128000) {
    throw new Error("OPENAI_MAX_TOKENS_INVALID");
  }
  return parsed;
}

export function normalizeHttpsBaseUrl(value: string, field: string): string {
  let parsed: URL;
  try {
    parsed = new URL(value.trim());
  } catch {
    throw new Error(`${field}_INVALID_URL`);
  }
  if (parsed.protocol !== "https:") {
    throw new Error(`${field}_HTTPS_REQUIRED`);
  }
  if (parsed.username || parsed.password || parsed.search || parsed.hash) {
    throw new Error(`${field}_INVALID_URL`);
  }
  return parsed.toString().replace(/\/+$/, "");
}

function oneOf<T extends string>(
  value: string,
  allowed: readonly T[],
  field: string,
): T {
  if (!allowed.includes(value as T)) throw new Error(`${field}_INVALID`);
  return value as T;
}

export function validateAiSettingValues(values: SettingValues): void {
  if (values.openai_base_url?.trim()) {
    normalizeHttpsBaseUrl(values.openai_base_url, "OPENAI_BASE_URL");
  }
  if (values.openai_image_base_url?.trim()) {
    normalizeHttpsBaseUrl(
      values.openai_image_base_url,
      "OPENAI_IMAGE_BASE_URL",
    );
  }
  if (values.openai_wire_api?.trim()) {
    oneOf(
      values.openai_wire_api.trim(),
      ["chat_completions", "responses"] as const,
      "OPENAI_WIRE_API",
    );
  }
  if (values.openai_reasoning_effort?.trim()) {
    oneOf(
      values.openai_reasoning_effort.trim(),
      ["none", "low", "medium", "high", "xhigh"] as const,
      "OPENAI_REASONING_EFFORT",
    );
  }
  if (values.openai_image_quality?.trim()) {
    oneOf(
      values.openai_image_quality.trim(),
      ["low", "medium", "high", "auto"] as const,
      "OPENAI_IMAGE_QUALITY",
    );
  }
  if (values.openai_max_tokens?.trim()) {
    const parsed = Number(values.openai_max_tokens);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 128000) {
      throw new Error("OPENAI_MAX_TOKENS_INVALID");
    }
  }
}

export function resolveAiRuntimeConfig(
  settings: SettingValues,
  env: SettingValues = process.env,
): AiRuntimeConfig {
  validateAiSettingValues(settings);

  const textBaseUrl = normalizeHttpsBaseUrl(
    firstNonEmpty(
      settings.openai_base_url,
      env.OPENAI_BASE_URL,
      "https://modelapi.vn/v1",
    ),
    "OPENAI_BASE_URL",
  );
  const imageBaseUrl = normalizeHttpsBaseUrl(
    firstNonEmpty(
      settings.openai_image_base_url,
      env.OPENAI_IMAGE_BASE_URL,
      "https://api.openai.com/v1",
    ),
    "OPENAI_IMAGE_BASE_URL",
  );
  const textWireApi = oneOf(
    firstNonEmpty(
      settings.openai_wire_api,
      env.OPENAI_WIRE_API,
      "chat_completions",
    ),
    ["chat_completions", "responses"] as const,
    "OPENAI_WIRE_API",
  );
  const textReasoningEffort = oneOf(
    firstNonEmpty(
      settings.openai_reasoning_effort,
      env.OPENAI_REASONING_EFFORT,
      "high",
    ),
    ["none", "low", "medium", "high", "xhigh"] as const,
    "OPENAI_REASONING_EFFORT",
  );
  const imageQuality = oneOf(
    firstNonEmpty(
      settings.openai_image_quality,
      env.OPENAI_IMAGE_QUALITY,
      "medium",
    ),
    ["low", "medium", "high", "auto"] as const,
    "OPENAI_IMAGE_QUALITY",
  );

  return {
    textApiKey: firstNonEmpty(
      settings.openai_text_api_key,
      settings.openai_api_key,
      env.OPENAI_TEXT_API_KEY,
      env.OPENAI_API_KEY,
    ),
    textBaseUrl,
    textWireApi,
    textModel: firstNonEmpty(
      settings.openai_text_model,
      settings.openai_model,
      env.OPENAI_TEXT_MODEL,
      env.OPENAI_MODEL,
      "gpt-5.5",
    ),
    textReasoningEffort,
    textMaxTokens: parseMaxTokens(
      firstNonEmpty(
        settings.openai_max_tokens,
        env.OPENAI_MAX_TOKENS,
        "4096",
      ),
    ),
    imageApiKey: firstNonEmpty(
      settings.openai_image_api_key,
      env.OPENAI_IMAGE_API_KEY,
    ),
    imageBaseUrl,
    imageModel: firstNonEmpty(
      settings.openai_image_model,
      env.OPENAI_IMAGE_MODEL,
      "gpt-image-2",
    ),
    imageQuality,
    writerPrompt: firstNonEmpty(settings.ai_writer_prompt),
    autoEnabled: parseBoolean(settings.ai_queue_auto_enabled, false),
    batchLimit: parseInteger(settings.ai_queue_batch_limit, 5, 1, 20),
  };
}

export async function getAiRuntimeConfig(): Promise<AiRuntimeConfig> {
  const rows = await prisma.setting.findMany({
    where: { key: { in: [...AI_SETTING_KEYS] } },
  });
  return resolveAiRuntimeConfig(
    Object.fromEntries(rows.map((row) => [row.key, row.value])),
  );
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
