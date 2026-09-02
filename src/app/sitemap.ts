import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { absoluteUrl, getSiteUrl, resolveCanonicalPath } from "@/lib/seo/url";

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

const staticPriorities: Record<string, number> = {
  home: 1,
  services: 0.9,
  projects: 0.9,
  products: 0.9,
  blog: 0.9,
  about: 0.7,
  process: 0.7,
  skills: 0.7,
  reviews: 0.7,
  contact: 0.7,
};

function sitemapUrl(canonicalPath: string | null | undefined, fallbackPath: string) {
  return absoluteUrl(resolveCanonicalPath(canonicalPath, fallbackPath));
}

function sitemapImages(...values: Array<string | string[] | null | undefined>) {
  return [...new Set(values.flatMap((value) => Array.isArray(value) ? value : [value]))]
    .filter((value): value is string => Boolean(value?.trim()))
    .map((value) => sitemapUrl(value, ""))
    .filter((value) => value !== getSiteUrl());
}

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
          select: {
            slug: true,
            updatedAt: true,
            canonicalPath: true,
            ogImage: true,
            coverMedia: { select: { url: true } },
          },
        }),
        prisma.page.findMany({
          where: { isPublished: true, robotsIndex: true },
          select: { slug: true, updatedAt: true, canonicalPath: true, ogImage: true },
        }),
        prisma.category.findMany({
          where: {
            robotsIndex: true,
            posts: { some: { status: "PUBLISHED", robotsIndex: true } },
          },
          select: { slug: true, updatedAt: true, canonicalPath: true, coverImage: true, ogImage: true },
        }),
        prisma.post.findMany({
          where: { status: "PUBLISHED", robotsIndex: true },
          select: { slug: true, updatedAt: true, canonicalPath: true, coverImage: true, ogImage: true },
        }),
        prisma.project.findMany({
          where: { isPublished: true, robotsIndex: true },
          select: { slug: true, updatedAt: true, canonicalPath: true, coverImage: true, images: true, ogImage: true },
        }),
        prisma.product.findMany({
          where: { isPublished: true, robotsIndex: true },
          select: { slug: true, updatedAt: true, canonicalPath: true, coverImage: true, images: true, ogImage: true },
        }),
      ]);

    const documentDates = new Map(documents.map((document) => [document.key, document.updatedAt]));
    const staticEntries = Object.entries(staticRoutes).map(([key, path]) => ({
      url: absoluteUrl(path),
      lastModified: documentDates.get(key),
      changeFrequency: key === "home" ? ("weekly" as const) : ("monthly" as const),
      priority: staticPriorities[key] || 0.6,
    }));

    return [
      ...staticEntries,
      ...services.map((item) => ({
        url: sitemapUrl(item.canonicalPath, `/dich-vu/${item.slug}`),
        lastModified: item.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.8,
        images: sitemapImages(item.ogImage, item.coverMedia?.url),
      })),
      ...pages.map((item) => ({
        url: sitemapUrl(item.canonicalPath, `/${item.slug}`),
        lastModified: item.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.6,
        images: sitemapImages(item.ogImage),
      })),
      ...categories.map((item) => ({
        url: sitemapUrl(item.canonicalPath, `/bai-viet/chuyen-muc/${item.slug}`),
        lastModified: item.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
        images: sitemapImages(item.ogImage, item.coverImage),
      })),
      ...posts.map((item) => ({
        url: sitemapUrl(item.canonicalPath, `/bai-viet/${item.slug}`),
        lastModified: item.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
        images: sitemapImages(item.ogImage, item.coverImage),
      })),
      ...projects.map((item) => ({
        url: sitemapUrl(item.canonicalPath, `/du-an/${item.slug}`),
        lastModified: item.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.8,
        images: sitemapImages(item.ogImage, item.coverImage, item.images),
      })),
      ...products.map((item) => ({
        url: sitemapUrl(item.canonicalPath, `/san-pham/${item.slug}`),
        lastModified: item.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
        images: sitemapImages(item.ogImage, item.coverImage, item.images),
      })),
    ];
  } catch (error) {
    console.error("[SEO] Could not generate sitemap.", error);
    return Object.values(staticRoutes).map((path) => ({ url: absoluteUrl(path) }));
  }
}
