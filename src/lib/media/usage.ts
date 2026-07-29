import { prisma } from "@/lib/db";

export interface MediaUsage {
  count: number;
  locations: string[];
}

function containsMedia(value: unknown, mediaId: string, url: string): boolean {
  if (typeof value === "string") return value === mediaId || value === url || value.includes(url);
  if (Array.isArray(value)) return value.some((item) => containsMedia(item, mediaId, url));
  if (value && typeof value === "object") {
    return Object.values(value).some((item) => containsMedia(item, mediaId, url));
  }
  return false;
}

async function usageQuery<T>(label: string, operation: Promise<T[]>): Promise<T[]> {
  try {
    return await operation;
  } catch (error) {
    console.error(`Media usage lookup failed (${label}):`, error);
    return [];
  }
}

export async function getMediaUsage(mediaId: string, url: string): Promise<MediaUsage> {
  const [services, projects, products, posts, categories, testimonials, documents, pages] =
    await Promise.all([
      usageQuery("services", prisma.serviceContent.findMany({ where: { coverMediaId: mediaId }, select: { title: true } })),
      usageQuery("projects", prisma.project.findMany({ where: { OR: [{ coverImage: url }, { images: { has: url } }] }, select: { title: true } })),
      usageQuery("products", prisma.product.findMany({ where: { OR: [{ coverImage: url }, { images: { has: url } }] }, select: { title: true } })),
      usageQuery("posts", prisma.post.findMany({ where: { coverImage: url }, select: { title: true } })),
      usageQuery("categories", prisma.category.findMany({ where: { coverImage: url }, select: { name: true } })),
      usageQuery("testimonials", prisma.testimonial.findMany({ where: { avatar: url }, select: { name: true } })),
      usageQuery("documents", prisma.contentDocument.findMany({ select: { key: true, draftData: true, publishedData: true } })),
      usageQuery("pages", prisma.page.findMany({ select: { title: true, content: true } })),
    ]);

  const locations = [
    ...services.map((item) => `Service: ${item.title}`),
    ...projects.map((item) => `Project: ${item.title}`),
    ...products.map((item) => `Product: ${item.title}`),
    ...posts.map((item) => `Post: ${item.title}`),
    ...categories.map((item) => `Category: ${item.name}`),
    ...testimonials.map((item) => `Testimonial: ${item.name}`),
    ...documents
      .filter((item) => containsMedia(item.draftData, mediaId, url) || containsMedia(item.publishedData, mediaId, url))
      .map((item) => `Content: ${item.key}`),
    ...pages.filter((item) => item.content.includes(url)).map((item) => `Page: ${item.title}`),
  ];

  return { count: locations.length, locations };
}
