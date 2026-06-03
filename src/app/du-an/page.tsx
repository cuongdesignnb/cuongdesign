import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import FeaturedProjectsSection from "@/components/sections/FeaturedProjectsSection";
import { prisma } from "@/lib/db";
import { createMetadata, JsonLd } from "@/lib/seo";
import { siteConfig } from "@/data/site";

export const metadata = createMetadata({
  title: "Dự án thực tế",
  description: "Chiêm ngưỡng bộ sưu tập các dự án thiết kế UI/UX Figma chuyên nghiệp, lập trình Web App Next.js/React chuẩn SEO tối ưu tốc độ của Cường Design.",
  path: "/du-an",
  keywords: ["Dự án Cường Design", "Hồ sơ dự án", "Next.js Web App", "Thiết kế Figma", "Portfolio Cường Design"],
});

export default async function ProjectsListPage() {
  // Fetch active projects from database
  const dbProjects = await prisma.project.findMany({
    orderBy: { order: "asc" }
  });

  // CollectionPage JSON-LD schema
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Dự án thực tế — Cuong Design",
    "description": "Bộ sưu tập các dự án thiết kế UI/UX và lập trình website nổi bật của Cuong Design.",
    "url": `${siteConfig.url}/du-an`,
    "publisher": {
      "@type": "Person",
      "name": siteConfig.author.name,
      "url": siteConfig.url
    },
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": dbProjects.length,
      "itemListElement": dbProjects.map((project, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `${siteConfig.url}/du-an/${project.slug}`
      }))
    }
  };

  return (
    <div className="min-h-screen bg-[#030014] text-gray-200 flex flex-col">
      <JsonLd data={collectionSchema} />
      <Header />

      <main className="grow pt-28 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Grid backgrounds */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none select-none z-0" />
        
        {/* Glow decorations */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 space-y-6">
          <div className="px-4 sm:px-6 lg:px-8">
            <Breadcrumbs items={[{ label: "Dự án", href: "/du-an" }]} />
          </div>
          
          {/* Reuse the interactive grid, adjusting vertical spacing */}
          <div className="-mt-12">
            <FeaturedProjectsSection initialProjects={dbProjects} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
