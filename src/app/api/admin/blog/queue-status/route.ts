import { NextResponse } from "next/server";
import {
  adminAuthorizationResponse,
  requireAdmin,
} from "@/lib/auth/require-admin";
import { getQueueStatus } from "@/lib/ai/settings";

export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json(await getQueueStatus());
  } catch (error: unknown) {
    const authorization = adminAuthorizationResponse(error);
    if (authorization) return authorization;
    return NextResponse.json(
      { error: "Không thể tải trạng thái AI Scheduler." },
      { status: 500 },
    );
  }
}
