import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { absoluteUrl } from "@/lib/seo/url";

export const dynamic = "force-dynamic";

const staticRoutes: Record<string, string> = {
  home: "/",
  about: "/gioi-thieu",
  services: "/dich-vu",
  process: "/quy-trinh",
  skills: "/ky-nang",
  projects: "/du-an",
  products: "/san-pham",
  reviews: "/danh-gia",
  contact: "/lien-he",
  blog: "/bai-viet",
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const [documents, services, pages, categories, posts, projects, products] =
      await Promise.all([
        prisma.contentDocument.findMany({
          where: { key: { in: Object.keys(staticRoutes) }, status: "PUBLISHED" },
          select: { key: true, updatedAt: true },
        }),
        prisma.serviceContent.findMany({
          where: { isPublished: true, robotsIndex: true },
          select: { slug: true, updatedAt: true, canonicalPath: true },
        }),
        prisma.page.findMany({
          where: { isPublished: true, robotsIndex: true },
          select: { slug: true, updatedAt: true, canonicalPath: true },
        }),
        prisma.category.findMany({
          where: {
            robotsIndex: true,
            posts: { some: { status: "PUBLISHED", robotsIndex: true } },
          },
          select: { slug: true, updatedAt: true, canonicalPath: true },
        }),
        prisma.post.findMany({
          where: { status: "PUBLISHED", robotsIndex: true },
          select: { slug: true, updatedAt: true, canonicalPath: true },
        }),
        prisma.project.findMany({
          where: { isPublished: true, robotsIndex: true },
          select: { slug: true, updatedAt: true, canonicalPath: true },
        }),
        prisma.product.findMany({
          where: { isPublished: true, robotsIndex: true },
          select: { slug: true, updatedAt: true, canonicalPath: true },
        }),
      ]);

    const documentDates = new Map(documents.map((document) => [document.key, document.updatedAt]));
    const staticEntries = Object.entries(staticRoutes).map(([key, path]) => ({
      url: absoluteUrl(path),
      lastModified: documentDates.get(key),
    }));

    return [
      ...staticEntries,
      ...services.map((item) => ({
        url: absoluteUrl(item.canonicalPath || `/dich-vu/${item.slug}`),
        lastModified: item.updatedAt,
      })),
      ...pages.map((item) => ({
        url: absoluteUrl(item.canonicalPath || `/${item.slug}`),
        lastModified: item.updatedAt,
      })),
      ...categories.map((item) => ({
        url: absoluteUrl(item.canonicalPath || `/bai-viet/chuyen-muc/${item.slug}`),
        lastModified: item.updatedAt,
      })),
      ...posts.map((item) => ({
        url: absoluteUrl(item.canonicalPath || `/bai-viet/${item.slug}`),
        lastModified: item.updatedAt,
      })),
      ...projects.map((item) => ({
        url: absoluteUrl(item.canonicalPath || `/du-an/${item.slug}`),
        lastModified: item.updatedAt,
      })),
      ...products.map((item) => ({
        url: absoluteUrl(item.canonicalPath || `/san-pham/${item.slug}`),
        lastModified: item.updatedAt,
      })),
    ];
  } catch (error) {
    console.error("[SEO] Could not generate sitemap.", error);
    return Object.values(staticRoutes).map((path) => ({ url: absoluteUrl(path) }));
  }
}
