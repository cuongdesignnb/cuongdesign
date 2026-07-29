import { prisma } from "@/lib/db";
import { serviceContentSchema } from "@/content/schemas";
import { sanitizeContentTree } from "./sanitize";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { connection } from "next/server";

export const SERVICE_COLOR_TOKENS = {
  pink: "from-pink-500 to-rose-500",
  purple: "from-purple-500 to-pink-500",
  blue: "from-blue-500 to-indigo-500",
  emerald: "from-emerald-500 to-teal-500",
  amber: "from-amber-500 to-orange-500",
  cyan: "from-cyan-500 to-sky-500",
  violet: "from-violet-500 to-fuchsia-500",
} as const;

const readPublishedServices = unstable_cache(async () => {
  try {
    const services = await prisma.serviceContent.findMany({
      where: { isPublished: true },
      include: { coverMedia: true },
      orderBy: { order: "asc" },
    });

    return services.flatMap((service) => {
      const parsed = serviceContentSchema.safeParse(service);
      if (!parsed.success) {
        console.error(`[Content Hub] Invalid service "${service.slug}"`, parsed.error.flatten());
        return [];
      }
      return [{ ...sanitizeContentTree(parsed.data), coverMedia: service.coverMedia }];
    });
  } catch (error) {
    console.error("[Content Hub] Could not load services.", error);
    return [];
  }
}, ["published-service-content"], { tags: ["service-content"] });

const getPublishedServicesOnce = cache(readPublishedServices);

export async function getPublishedServices() {
  await connection();
  return getPublishedServicesOnce();
}

export const getPublishedService = cache(async (slug: string) => {
  await connection();
  const services = await getPublishedServicesOnce();
  return services.find((service) => service.slug === slug) ?? null;
});
