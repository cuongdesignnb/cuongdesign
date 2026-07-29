import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { projects } from "../src/data/projects";
import { products } from "../src/data/products";
import { testimonials } from "../src/data/testimonials";
import { seedContent } from "./seed-content";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("adminpassword", 10);
  await prisma.user.upsert({
    where: { email: "admin@cuongdesign.com" },
    update: {},
    create: {
      email: "admin@cuongdesign.com",
      password,
      name: "Cường Design",
      role: "ADMIN",
    },
  });

  const categories = [
    { name: "Thiết kế UI/UX", slug: "thiet-ke-ui-ux", color: "#ec4899", order: 0 },
    { name: "Lập trình Web", slug: "lap-trinh-web", color: "#8b5cf6", order: 1 },
    { name: "Next.js & React", slug: "nextjs-react", color: "#3b82f6", order: 2 },
    { name: "SEO & Marketing", slug: "seo-marketing", color: "#10b981", order: 3 },
    { name: "Công nghệ", slug: "cong-nghe", color: "#f59e0b", order: 4 },
    { name: "Chia sẻ kinh nghiệm", slug: "chia-se-kinh-nghiem", color: "#6366f1", order: 5 },
  ];
  for (const category of categories) {
    await prisma.category.upsert({ where: { slug: category.slug }, update: {}, create: category });
  }

  for (const [order, project] of projects.entries()) {
    await prisma.project.upsert({
      where: { slug: project.slug },
      update: {},
      create: {
        title: project.title,
        slug: project.slug,
        description: project.descriptionVi,
        content: `<p>${project.descriptionVi}</p>`,
        coverImage: project.coverImage,
        images: [project.coverImage],
        category: project.category,
        demoUrl: project.demoUrl || null,
        githubUrl: project.githubUrl || null,
        techStack: project.techStack,
        isFeatured: true,
        order,
      },
    });
  }

  for (const [order, product] of products.entries()) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        title: product.title,
        slug: product.slug,
        description: product.descriptionVi,
        price: product.price,
        type: product.type,
        features: ["Bảo mật cao", "Tối ưu SEO", "Responsive"],
        techStack: product.techStack,
        coverImage: product.coverImage,
        images: [product.coverImage],
        demoUrl: product.demoUrl || null,
        downloadUrl: "/uploads/dummy-source.zip",
        maxDownloads: 5,
        isFeatured: true,
        order,
      },
    });
  }

  for (const [order, testimonial] of testimonials.entries()) {
    const existing = await prisma.testimonial.findFirst({
      where: { name: testimonial.name, quote: testimonial.quoteVi },
    });
    if (!existing) {
      await prisma.testimonial.create({
        data: {
          name: testimonial.name,
          role: testimonial.role,
          company: testimonial.company || null,
          avatar: testimonial.avatar,
          rating: testimonial.rating,
          quote: testimonial.quoteVi,
          isPublished: true,
          order,
        },
      });
    }
  }

  if ((await prisma.menuItem.count()) === 0) {
    const home = await prisma.menuItem.create({ data: { label: "Trang chủ", href: "/", order: 0 } });
    const about = await prisma.menuItem.create({ data: { label: "Giới thiệu", order: 1 } });
    const expertise = await prisma.menuItem.create({ data: { label: "Chuyên môn", order: 2 } });
    const shop = await prisma.menuItem.create({ data: { label: "Cửa hàng & Tin tức", order: 3 } });
    await prisma.menuItem.createMany({
      data: [
        { label: "Hồ sơ cá nhân", href: "/gioi-thieu", order: 0, parentId: about.id },
        { label: "Quy trình làm việc", href: "/quy-trinh", order: 1, parentId: about.id },
        { label: "Kỹ năng & Công nghệ", href: "/ky-nang", order: 2, parentId: about.id },
        { label: "Dịch vụ cung cấp", href: "/dich-vu", order: 0, parentId: expertise.id },
        { label: "Dự án thực tế", href: "/du-an", order: 1, parentId: expertise.id },
        { label: "Sản phẩm số", href: "/san-pham", order: 0, parentId: shop.id },
        { label: "Bài viết & Blog", href: "/bai-viet", order: 1, parentId: shop.id },
        { label: "Đánh giá", href: "/danh-gia", order: 4 },
        { label: "Liên hệ & FAQ", href: "/lien-he", order: 5 },
      ],
    });
    void home;
  }

  await seedContent(prisma);
}

main()
  .then(() => console.log("Database seed completed."))
  .finally(() => prisma.$disconnect());
