import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db";
import {
  processAiQueueBatch,
  type ProcessorDependencies,
  type QueueBatchStats,
} from "./queue-processor";

const MANUAL_RUN_PREFIX = "ai_queue_manual_run:";
const MANUAL_RUN_LIMIT = 20;

interface ManualRunRequest {
  taskId: string | null;
  requestedAt: string;
}

interface ProcessManualRunOptions {
  requestKey?: string;
  dependencies?: Partial<ProcessorDependencies>;
}

export interface ManualRunResult {
  requestKey: string;
  taskId: string | null;
  stats: QueueBatchStats;
}

function parseManualRunRequest(value: string): ManualRunRequest | null {
  try {
    const parsed = JSON.parse(value) as Partial<ManualRunRequest>;
    if (
      (parsed.taskId !== null && typeof parsed.taskId !== "string") ||
      typeof parsed.requestedAt !== "string"
    ) {
      return null;
    }
    return {
      taskId: parsed.taskId,
      requestedAt: parsed.requestedAt,
    };
  } catch {
    return null;
  }
}

export function isManualRunSettingKey(key: string) {
  return key.startsWith(MANUAL_RUN_PREFIX);
}

export async function enqueueManualQueueRun(taskId?: string) {
  const requestKey = `${MANUAL_RUN_PREFIX}${randomUUID()}`;
  const request: ManualRunRequest = {
    taskId: taskId || null,
    requestedAt: new Date().toISOString(),
  };

  await prisma.setting.create({
    data: {
      key: requestKey,
      value: JSON.stringify(request),
    },
  });

  return requestKey;
}

export async function processManualQueueRuns(
  options: ProcessManualRunOptions = {},
): Promise<ManualRunResult[]> {
  const requests = await prisma.setting.findMany({
    where: options.requestKey
      ? { key: options.requestKey }
      : { key: { startsWith: MANUAL_RUN_PREFIX } },
    orderBy: { updatedAt: "asc" },
    take: options.requestKey ? 1 : MANUAL_RUN_LIMIT,
  });
  const results: ManualRunResult[] = [];

  for (const row of requests) {
    const request = parseManualRunRequest(row.value);
    if (!request) {
      await prisma.setting.deleteMany({
        where: { key: row.key, value: row.value },
      });
      console.error(
        "AI_QUEUE_MANUAL_RUN_INVALID",
        JSON.stringify({ request_key: row.key }),
      );
      continue;
    }

    try {
      const stats = await processAiQueueBatch({
        taskId: request.taskId || undefined,
        force: true,
        limit: request.taskId ? 1 : undefined,
        dependencies: options.dependencies,
      });
      await prisma.setting.deleteMany({
        where: { key: row.key, value: row.value },
      });
      results.push({
        requestKey: row.key,
        taskId: request.taskId,
        stats,
      });
    } catch (error) {
      console.error(
        "AI_QUEUE_MANUAL_RUN_FAILED",
        JSON.stringify({
          request_key: row.key,
          task_id: request.taskId,
          error: error instanceof Error ? error.message : String(error),
        }),
      );
    }
  }

  return results;
}

export async function runAiQueueCycle() {
  await processManualQueueRuns();
  return processAiQueueBatch();
}
