"use server";

import { serviceContentSchema } from "@/content/schemas";
import type { ContentActionResult } from "@/content/types";
import { requireAdmin } from "@/lib/auth/require-admin";
import { sanitizeContentTree } from "@/lib/content/sanitize";
import { revalidateServices } from "@/lib/content/revalidate";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { recordSeoRedirect } from "@/lib/seo/redirects";

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

function serviceData(input: unknown) {
  const parsed = serviceContentSchema.safeParse(sanitizeContentTree(input));
  if (!parsed.success) throw new Error(parsed.error.message);
  const data = { ...parsed.data };
  delete data.id;
  return {
    ...data,
    features: data.features as Prisma.InputJsonValue,
    process: data.process as Prisma.InputJsonValue,
    faqs: data.faqs as Prisma.InputJsonValue,
  };
}

export async function createServiceContent(input: unknown): Promise<ContentActionResult> {
  try {
    await requireAdmin();
    const data = serviceData(input);
    const service = await prisma.serviceContent.create({ data });
    revalidatePath("/admin/content/services");
    return { success: true, data: service };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function updateServiceContent(id: string, input: unknown): Promise<ContentActionResult> {
  try {
    await requireAdmin();
    const previous = await prisma.serviceContent.findUnique({
      where: { id },
      select: { slug: true },
    });
    const data = serviceData(input);
    const service = await prisma.serviceContent.update({ where: { id }, data });
    if (previous && previous.slug !== service.slug) {
      await recordSeoRedirect(
        `/dich-vu/${previous.slug}`,
        `/dich-vu/${service.slug}`,
        "service-slug-changed",
      );
      revalidateServices(previous.slug);
    }
    revalidateServices(service.slug);
    revalidatePath(`/admin/content/services/${id}`);
    return { success: true, data: service };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function publishServiceContent(id: string): Promise<ContentActionResult> {
  try {
    await requireAdmin();
    const current = await prisma.serviceContent.findUnique({ where: { id } });
    if (!current) return { success: false, error: "Service not found." };
    const service = await prisma.serviceContent.update({
      where: { id },
      data: {
        isPublished: !current.isPublished,
        publishedAt: current.isPublished ? null : new Date(),
      },
    });
    revalidateServices(service.slug);
    revalidatePath("/admin/content/services");
    return { success: true, data: service };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function deleteServiceContent(id: string): Promise<ContentActionResult> {
  try {
    await requireAdmin();
    const service = await prisma.serviceContent.delete({ where: { id } });
    revalidateServices(service.slug);
    revalidatePath("/admin/content/services");
    return { success: true };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}
