import { prisma } from "@/lib/db";
import { permanentRedirect, redirect } from "next/navigation";
import { cache } from "react";
import { normalizeCanonicalPath } from "./url";

const findRedirect = cache(async (path: string) =>
  prisma.seoRedirect.findUnique({ where: { sourcePath: path } }),
);

export async function resolveSeoRedirect(path: string): Promise<never | null> {
  const rule = await findRedirect(normalizeCanonicalPath(path));
  if (!rule) return null;
  if (rule.permanent) permanentRedirect(rule.destinationPath);
  redirect(rule.destinationPath);
}
