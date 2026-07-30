import { processAiQueueBatch } from "../src/lib/ai/queue-processor";

const interval = Math.max(
  15_000,
  Number.parseInt(process.env.AI_QUEUE_INTERVAL_MS || "60000", 10),
);
let running = false;

async function run() {
  if (running) return;
  running = true;
  try {
    await processAiQueueBatch();
  } catch (error) {
    console.error(
      "AI_QUEUE_INFRASTRUCTURE_ERROR",
      error instanceof Error ? error.message : error,
    );
  } finally {
    running = false;
  }
}

async function main() {
  console.info(
    "AI_QUEUE_STANDALONE_WORKER_STARTED",
    JSON.stringify({ interval }),
  );
  await run();
  setInterval(() => void run(), interval);
}

void main().catch((error) => {
  console.error(
    "AI_QUEUE_WORKER_START_FAILED",
    error instanceof Error ? error.message : error,
  );
  process.exitCode = 1;
});
