import {
  adminAuthorizationResponse,
  requireAdmin,
} from "@/lib/auth/require-admin";
import { draftMode } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const draft = await draftMode();
    draft.disable();
    return NextResponse.redirect(new URL("/admin/content", request.url));
  } catch (error) {
    const authorization = adminAuthorizationResponse(error);
    if (authorization) return authorization;
    return NextResponse.json({ error: "Could not disable preview." }, { status: 500 });
  }
}
