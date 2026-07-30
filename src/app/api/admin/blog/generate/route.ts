import { NextResponse } from "next/server";
import {
  adminAuthorizationResponse,
  requireAdmin,
} from "@/lib/auth/require-admin";
import { processAiQueueBatch } from "@/lib/ai/queue-processor";

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId") || undefined;
    const stats = await processAiQueueBatch({
      taskId,
      force: true,
      limit: taskId ? 1 : undefined,
    });
    return NextResponse.json({
      success: stats.success > 0,
      stats,
      message:
        stats.claimed === 0
          ? "Không có tác vụ phù hợp để xử lý."
          : "Đã xử lý hàng đợi.",
    });
  } catch (error: unknown) {
    const authorization = adminAuthorizationResponse(error);
    if (authorization) return authorization;
    console.error(
      "AI_QUEUE_MANUAL_RUN_FAILED",
      error instanceof Error ? error.message : error,
    );
    return NextResponse.json(
      { success: false, error: "Không thể xử lý hàng đợi AI." },
      { status: 500 },
    );
  }
}
