export async function register() {
  if (
    process.env.NEXT_RUNTIME !== "nodejs" ||
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.AI_QUEUE_EMBEDDED_WORKER === "false"
  ) {
    return;
  }

  const { startAiQueueWorker } = await import("@/lib/ai/worker");
  startAiQueueWorker();
}
