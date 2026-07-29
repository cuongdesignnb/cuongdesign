import { auth } from "@/auth";
import { NextResponse } from "next/server";

export class AdminAuthorizationError extends Error {
  constructor(
    message: string,
    public readonly status: 401 | 403,
  ) {
    super(message);
    this.name = "AdminAuthorizationError";
  }
}

export interface AdminIdentity {
  id: string;
  email: string | null;
  name: string | null;
}

export async function requireAdmin(): Promise<AdminIdentity> {
  const session = await auth();
  const user = session?.user as
    | { id?: string; email?: string | null; name?: string | null; role?: string }
    | undefined;

  if (!user) {
    throw new AdminAuthorizationError("Authentication required.", 401);
  }

  if (user.role !== "ADMIN") {
    throw new AdminAuthorizationError("Administrator access required.", 403);
  }

  if (!user.id) {
    throw new AdminAuthorizationError("Invalid administrator session.", 401);
  }

  return {
    id: user.id,
    email: user.email ?? null,
    name: user.name ?? null,
  };
}

export function adminAuthorizationResponse(error: unknown) {
  if (error instanceof AdminAuthorizationError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  return null;
}
