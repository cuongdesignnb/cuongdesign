import { contentRegistry, isContentKey } from "@/content/registry";
import {
  adminAuthorizationResponse,
  requireAdmin,
} from "@/lib/auth/require-admin";
import { draftMode } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const key = request.nextUrl.searchParams.get("key") ?? "";
    if (!isContentKey(key) || !contentRegistry[key].route) {
      return NextResponse.json({ error: "Content route not found." }, { status: 404 });
    }
    const draft = await draftMode();
    draft.enable();
    return NextResponse.redirect(new URL(contentRegistry[key].route!, request.url));
  } catch (error) {
    const authorization = adminAuthorizationResponse(error);
    if (authorization) return authorization;
    return NextResponse.json({ error: "Could not enable preview." }, { status: 500 });
  }
}
