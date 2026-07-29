import MotionProvider from "@/components/motion/MotionProvider";
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
import { createMetadataFromSeoFields } from "@/lib/seo";
import { prisma } from "@/lib/db";
import { getPublishedContent } from "@/lib/content/get-content";
import { getPublishedServices } from "@/lib/content/get-service-content";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const global = await getPublishedContent("global");
  return createMetadataFromSeoFields({
    seo: {
      title: global.seo.title,
      description: global.seo.description,
      keywords: global.seo.keywords,
      ogTitle: global.seo.ogTitle,
      ogDescription: global.seo.ogDescription,
      ogImage: global.brand.defaultOgMedia,
    },
    fallback: {
      title: global.seo.title,
      description: global.seo.description,
      image: global.brand.defaultOgMedia,
    },
    path: "/",
  });
}

export default async function Home() {
  const [homeContent, globalContent, services] = await Promise.all([
    getPublishedContent("home"),
    getPublishedContent("global"),
    getPublishedServices(),
  ]);

  let dbProjects: Awaited<ReturnType<typeof prisma.project.findMany>> = [];
  let dbProducts: Awaited<ReturnType<typeof prisma.product.findMany>> = [];
  let dbTestimonials: Awaited<ReturnType<typeof prisma.testimonial.findMany>> = [];
  try {
    [dbProjects, dbProducts, dbTestimonials] = await Promise.all([
      prisma.project.findMany({
        where: { isPublished: true },
        orderBy: { order: "asc" },
      }),
      prisma.product.findMany({
        where: { isPublished: true },
        orderBy: { order: "asc" },
      }),
      prisma.testimonial.findMany({
        where: { isPublished: true },
        orderBy: { order: "asc" },
      }),
    ]);
  } catch (error) {
    console.error("[Home] Could not load collection content.", error);
  }

  return (
    <MotionProvider>
      <Header />
      <main className="flex-1 bg-[#030014] relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none select-none z-0" />
        <HeroSection content={homeContent.hero} />
        <AboutSection content={homeContent.about} />
        <ServicesSection content={homeContent.services} initialServices={services} />
        <FeaturedProjectsSection initialProjects={dbProjects} content={homeContent.projects} />
        <DigitalProductsSection initialProducts={dbProducts} content={homeContent.products} />
        <WorkProcessSection content={homeContent.process} />
        <TechStackSection content={homeContent.techStack} />
        <TestimonialsSection initialTestimonials={dbTestimonials} content={homeContent.testimonials} />
        <CTASection content={homeContent.cta} />
        <ContactSection content={homeContent.contact} contact={globalContent.contact} />
      </main>
      <Footer />
    </MotionProvider>
  );
}
