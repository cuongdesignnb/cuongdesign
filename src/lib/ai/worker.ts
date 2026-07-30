import { processAiQueueBatch } from "./queue-processor";

const WORKER_INTERVAL_MS = 60_000;

declare global {
  var __cuongDesignAiQueueWorkerStarted: boolean | undefined;
  var __cuongDesignAiQueueWorkerRunning: boolean | undefined;
}

async function tick() {
  if (globalThis.__cuongDesignAiQueueWorkerRunning) return;
  globalThis.__cuongDesignAiQueueWorkerRunning = true;
  try {
    await processAiQueueBatch();
  } catch (error) {
    console.error(
      "AI_QUEUE_INFRASTRUCTURE_ERROR",
      error instanceof Error ? error.message : error,
    );
  } finally {
    globalThis.__cuongDesignAiQueueWorkerRunning = false;
  }
}

export function startAiQueueWorker() {
  if (globalThis.__cuongDesignAiQueueWorkerStarted) return;
  globalThis.__cuongDesignAiQueueWorkerStarted = true;

  void tick();
  const timer = setInterval(() => void tick(), WORKER_INTERVAL_MS);
  timer.unref();
  console.info("AI_QUEUE_WORKER_STARTED", JSON.stringify({ interval_ms: WORKER_INTERVAL_MS }));
}
