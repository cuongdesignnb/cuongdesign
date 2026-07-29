import { prisma } from "@/lib/db";
import { cache } from "react";

export const getProjectBySlug = cache((slug: string) =>
  prisma.project.findFirst({ where: { slug, isPublished: true } }),
);

export const getProductBySlug = cache((slug: string) =>
  prisma.product.findFirst({
    where: { slug, isPublished: true },
    include: {
      reviews: {
        where: { isApproved: true },
        include: { user: { select: { name: true, avatar: true } } },
      },
    },
  }),
);

export const getPostBySlug = cache((slug: string) =>
  prisma.post.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { category: true },
  }),
);

export const getCategoryBySlug = cache((slug: string) =>
  prisma.category.findUnique({
    where: { slug },
    include: {
      posts: {
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
      },
    },
  }),
);

export const getPageBySlug = cache((slug: string) =>
  prisma.page.findFirst({ where: { slug, isPublished: true } }),
);
