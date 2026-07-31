import { after, NextResponse } from "next/server";
import {
  adminAuthorizationResponse,
  requireAdmin,
} from "@/lib/auth/require-admin";
import {
  enqueueManualQueueRun,
  processManualQueueRuns,
} from "@/lib/ai/manual-run";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId") || undefined;

    if (taskId) {
      const task = await prisma.aiTask.findUnique({
        where: { id: taskId },
        select: { status: true, generatedPostId: true },
      });
      if (!task) {
        return NextResponse.json(
          { success: false, error: "Không tìm thấy tác vụ AI." },
          { status: 404 },
        );
      }
      if (task.status !== "PENDING" || task.generatedPostId) {
        return NextResponse.json(
          {
            success: false,
            error: "Tác vụ này không còn ở trạng thái chờ xử lý.",
          },
          { status: 409 },
        );
      }
    }

    const requestKey = await enqueueManualQueueRun(taskId);
    after(async () => {
      await processManualQueueRuns({ requestKey });
    });

    return NextResponse.json(
      {
        success: true,
        queued: true,
        taskId: taskId || null,
        message: taskId
          ? "Tác vụ đã được giao cho AI worker."
          : "Các tác vụ đến giờ đã được giao cho AI worker.",
      },
      { status: 202 },
    );
  } catch (error: unknown) {
    const authorization = adminAuthorizationResponse(error);
    if (authorization) return authorization;
    console.error(
      "AI_QUEUE_MANUAL_ENQUEUE_FAILED",
      error instanceof Error ? error.message : error,
    );
    return NextResponse.json(
      { success: false, error: "Không thể giao tác vụ cho hàng đợi AI." },
      { status: 500 },
    );
  }
}
