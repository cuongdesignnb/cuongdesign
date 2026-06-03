import { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { siteConfig } from "@/data/site";
import { servicesDetail } from "@/data/services-detail";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig?.url || "https://cuongdesign.com";

  // Static routes
  const staticPaths = [
    "",
    "/gioi-thieu",
    "/du-an",
    "/san-pham",
    "/dich-vu",
    "/quy-trinh",
    "/ky-nang",
    "/danh-gia",
    "/lien-he",
    "/bai-viet",
  ];

  // Service landing pages
  const servicePaths = servicesDetail.map((s) => `/dich-vu/${s.slug}`);

  const staticRoutes = staticPaths.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: (path === "" ? "daily" : "weekly") as "daily" | "weekly",
    priority: path === "" ? 1.0 : 0.8,
  }));

  try {
    // Dynamic policy pages
    const dbPages = await prisma.page.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
    });

    const pageRoutes = dbPages.map((page) => ({
      url: `${baseUrl}/${page.slug}`,
      lastModified: new Date(page.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));

    // Dynamic blog categories
    const dbCategories = await prisma.category.findMany({
      select: { slug: true, updatedAt: true },
    });

    const categoryRoutes = dbCategories.map((cat) => ({
      url: `${baseUrl}/bai-viet/${cat.slug}`,
      lastModified: new Date(cat.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    // Dynamic blog posts
    const dbPosts = await prisma.post.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true, category: { select: { slug: true } } },
    });

    const blogRoutes = dbPosts.map((post) => ({
      url: `${baseUrl}/bai-viet/${post.category?.slug || "chua-phan-loai"}/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    // Dynamic projects
    const dbProjects = await prisma.project.findMany({
      select: { slug: true, updatedAt: true },
    });

    const projectRoutes = dbProjects.map((project) => ({
      url: `${baseUrl}/du-an/${project.slug}`,
      lastModified: new Date(project.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    // Dynamic products
    const dbProducts = await prisma.product.findMany({
      select: { slug: true, updatedAt: true },
    });

    const productRoutes = dbProducts.map((product) => ({
      url: `${baseUrl}/san-pham/${product.slug}`,
      lastModified: new Date(product.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    const serviceRoutes = servicePaths.map((path) => ({
      url: `${baseUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

    return [
      ...staticRoutes,
      ...serviceRoutes,
      ...pageRoutes,
      ...categoryRoutes,
      ...blogRoutes,
      ...projectRoutes,
      ...productRoutes,
    ];
  } catch (error) {
    console.error("Lỗi khi lập chỉ mục sitemap:", error);
    return staticRoutes;
  }
}
