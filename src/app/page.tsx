import SmoothScroll from "@/components/layout/SmoothScroll";
import Header from "@/components/layout/Header";
import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import ServicesSection from "@/components/sections/ServicesSection";
import FeaturedProjectsSection from "@/components/sections/FeaturedProjectsSection";
import DigitalProductsSection from "@/components/sections/DigitalProductsSection";
import WorkProcessSection from "@/components/sections/WorkProcessSection";
import TechStackSection from "@/components/sections/TechStackSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import CTASection from "@/components/sections/CTASection";
import ContactSection from "@/components/sections/ContactSection";
import Footer from "@/components/layout/Footer";

// Database integrations
import { prisma } from "@/lib/db";
import { projects as staticProjects } from "@/data/projects";
import { products as staticProducts } from "@/data/products";
import { testimonials as staticTestimonials } from "@/data/testimonials";
import bcrypt from "bcryptjs";

export default async function Home() {
  // 0. Self-seeding database check for default Admin User
  const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
  if (adminCount === 0) {
    const hashedPassword = await bcrypt.hash("adminpassword", 10);
    await prisma.user.create({
      data: {
        email: "admin@cuongdesign.com",
        password: hashedPassword,
        name: "Cường Design",
        role: "ADMIN",
      },
    });
  }

  // 1. Self-seeding database check for projects
  let dbProjects = await prisma.project.findMany({ orderBy: { order: "asc" } });
  if (dbProjects.length === 0) {
    const promises = staticProjects.map((p, idx) =>
      prisma.project.create({
        data: {
          title: p.title,
          slug: p.slug,
          description: p.descriptionVi,
          content: p.descriptionVi,
          coverImage: p.coverImage,
          images: [p.coverImage],
          category: p.category,
          demoUrl: p.demoUrl || null,
          githubUrl: p.githubUrl || null,
          techStack: p.techStack,
          isFeatured: true,
          order: idx,
        },
      })
    );
    await Promise.all(promises);
    dbProjects = await prisma.project.findMany({ orderBy: { order: "asc" } });
  }

  // 2. Self-seeding database check for products
  let dbProducts = await prisma.product.findMany({ orderBy: { order: "asc" } });
  if (dbProducts.length === 0) {
    const promises = staticProducts.map((p, idx) =>
      prisma.product.create({
        data: {
          title: p.title,
          slug: p.slug,
          description: p.descriptionVi,
          price: p.price,
          type: p.type,
          features: ["Bảo mật cao", "Tối ưu SEO 100%", "Responsive hoàn hảo"],
          techStack: p.techStack,
          coverImage: p.coverImage,
          images: [p.coverImage],
          demoUrl: p.demoUrl || null,
          downloadUrl: "/uploads/dummy-source.zip",
          maxDownloads: 5,
          isFeatured: true,
          order: idx,
        },
      })
    );
    await Promise.all(promises);
    dbProducts = await prisma.product.findMany({ orderBy: { order: "asc" } });
  }

  // 3. Self-seeding database check for testimonials
  let dbTestimonials = await prisma.testimonial.findMany({ orderBy: { order: "asc" } });
  if (dbTestimonials.length === 0) {
    const promises = staticTestimonials.map((t, idx) =>
      prisma.testimonial.create({
        data: {
          name: t.name,
          role: t.role,
          company: t.company || null,
          avatar: t.avatar,
          rating: t.rating,
          quote: t.quoteVi,
          isPublished: true,
          order: idx,
        },
      })
    );
    await Promise.all(promises);
    dbTestimonials = await prisma.testimonial.findMany({ orderBy: { order: "asc" } });
  }

  // 4. Self-seeding database check for navigation MenuItems
  const menuCount = await prisma.menuItem.count();
  if (menuCount === 0) {
    await prisma.menuItem.create({ data: { label: "Trang chủ", href: "/", order: 0 } });
    
    const aboutParent = await prisma.menuItem.create({ data: { label: "Giới thiệu", href: null, order: 1 } });
    await prisma.menuItem.create({ data: { label: "Hồ sơ cá nhân", href: "/gioi-thieu", order: 0, parentId: aboutParent.id } });
    await prisma.menuItem.create({ data: { label: "Quy trình làm việc", href: "/quy-trinh", order: 1, parentId: aboutParent.id } });
    await prisma.menuItem.create({ data: { label: "Kỹ năng & Công nghệ", href: "/ky-nang", order: 2, parentId: aboutParent.id } });

    const expertiseParent = await prisma.menuItem.create({ data: { label: "Chuyên môn", href: null, order: 2 } });
    await prisma.menuItem.create({ data: { label: "Dịch vụ cung cấp", href: "/dich-vu", order: 0, parentId: expertiseParent.id } });
    await prisma.menuItem.create({ data: { label: "Dự án thực tế", href: "/du-an", order: 1, parentId: expertiseParent.id } });

    const shopParent = await prisma.menuItem.create({ data: { label: "Cửa hàng & Tin tức", href: null, order: 3 } });
    await prisma.menuItem.create({ data: { label: "Sản phẩm số", href: "/san-pham", order: 0, parentId: shopParent.id } });
    await prisma.menuItem.create({ data: { label: "Bài viết & Blog", href: "/bai-viet", order: 1, parentId: shopParent.id } });

    await prisma.menuItem.create({ data: { label: "Đánh giá", href: "/danh-gia", order: 4 } });
    await prisma.menuItem.create({ data: { label: "Liên hệ & FAQ", href: "/lien-he", order: 5 } });
  }

  return (
    <SmoothScroll>
      <Header />
      <main className="flex-1 bg-[#030014] relative overflow-hidden">
        {/* Decorative Grid Overlay for visual premium structure */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none select-none z-0" />
        
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        
        {/* Render dynamic DB projects */}
        <FeaturedProjectsSection initialProjects={dbProjects} />
        
        {/* Render dynamic DB products */}
        <DigitalProductsSection initialProducts={dbProducts} />
        
        <WorkProcessSection />
        <TechStackSection />
        
        {/* Render dynamic DB testimonials */}
        <TestimonialsSection initialTestimonials={dbTestimonials} />
        
        <CTASection />
        <ContactSection />
      </main>
      <Footer />
    </SmoothScroll>
  );
}
