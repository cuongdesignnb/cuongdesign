import { PrismaClient, type Prisma } from "@prisma/client";
import { contentRegistry } from "../src/content/registry";
import { servicesDetail } from "../src/data/services-detail";

const servicePresentation: Record<string, { iconKey: string; colorKey: string; priceText: string; durationText: string }> = {
  "thiet-ke-ui-ux": { iconKey: "Layout", colorKey: "pink", priceText: "Từ 5.000.000 VNĐ", durationText: "5 - 10 ngày làm việc" },
  "website-doanh-nghiep": { iconKey: "Globe", colorKey: "blue", priceText: "Từ 15.000.000 VNĐ", durationText: "10 - 20 ngày làm việc" },
  "landing-page": { iconKey: "Target", colorKey: "emerald", priceText: "Từ 6.000.000 VNĐ", durationText: "3 - 7 ngày làm việc" },
  "e-commerce": { iconKey: "ShoppingBag", colorKey: "purple", priceText: "Từ 25.000.000 VNĐ", durationText: "20 - 45 ngày làm việc" },
  "dashboard-saas": { iconKey: "BarChart3", colorKey: "amber", priceText: "Liên hệ tư vấn", durationText: "30 - 60 ngày làm việc" },
  "seo-toi-uu-toc-do": { iconKey: "Zap", colorKey: "cyan", priceText: "Từ 4.000.000 VNĐ", durationText: "3 - 5 ngày làm việc" },
  "automation-doanh-nghiep": { iconKey: "Cpu", colorKey: "violet", priceText: "Từ 10.000.000 VNĐ", durationText: "7 - 15 ngày làm việc" },
};

export async function seedContent(prisma: PrismaClient) {
  for (const [key, entry] of Object.entries(contentRegistry)) {
    await prisma.contentDocument.upsert({
      where: { key },
      update: { name: entry.name, route: entry.route },
      create: {
        key,
        name: entry.name,
        route: entry.route,
        draftData: entry.defaultData as Prisma.InputJsonValue,
        publishedData: entry.defaultData as Prisma.InputJsonValue,
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });
  }

  for (const [order, service] of servicesDetail.entries()) {
    const presentation = servicePresentation[service.slug] ?? {
      iconKey: "Code2",
      colorKey: "pink",
      priceText: "Liên hệ tư vấn",
      durationText: "Theo phạm vi dự án",
    };
    await prisma.serviceContent.upsert({
      where: { slug: service.slug },
      update: {},
      create: {
        slug: service.slug,
        title: service.title,
        subtitle: service.metaTitle,
        shortDescription: service.description,
        heroContent: `<p>${service.heroDescription}</p>`,
        iconKey: presentation.iconKey,
        colorKey: presentation.colorKey,
        priceText: presentation.priceText,
        durationText: presentation.durationText,
        features: service.features,
        process: service.process,
        faqs: service.faqs,
        ctaText: service.ctaText,
        seoTitle: service.metaTitle,
        seoDescription: service.description,
        seoKeywords: service.keywords,
        isPublished: true,
        order,
      },
    });
  }
}

if (process.argv[1]?.replace(/\\/g, "/").endsWith("/prisma/seed-content.ts")) {
  const prisma = new PrismaClient();
  seedContent(prisma)
    .then(() => console.log("Content Hub seed completed."))
    .finally(() => prisma.$disconnect());
}
