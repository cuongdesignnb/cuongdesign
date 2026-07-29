import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import FeaturedProjectsSection from "@/components/sections/FeaturedProjectsSection";
import { prisma } from "@/lib/db";
import { buildCollectionPageSchema, createMetadataFromSeoFields, JsonLd } from "@/lib/seo";
import { getPublishedContent } from "@/lib/content/get-content";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const content = await getPublishedContent("projects");
  return createMetadataFromSeoFields({
    seo: content.metadata,
    fallback: {
      title: content.metadata.title,
      description: content.metadata.description,
    },
    path: "/du-an",
  });
}

export default async function ProjectsListPage() {
  const content = await getPublishedContent("projects");
  // Fetch active projects from database
  let dbProjects: any[] = [];
  try {
    dbProjects = await prisma.project.findMany({
      where: { isPublished: true },
      orderBy: { order: "asc" }
    });
  } catch (error) {
    console.warn("Database connection failed during build for projects page.");
  }

  // CollectionPage JSON-LD schema
  const collectionSchema = buildCollectionPageSchema({
    path: "/du-an",
    name: content.hero.title,
    description: content.hero.intro,
    items: dbProjects.map((project) => ({
      name: project.title,
      description: project.description,
      image: project.coverImage,
      url: `/du-an/${project.slug}`,
    })),
  });

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
            <Breadcrumbs items={[{ label: content.hero.breadcrumb, href: "/du-an" }]} />
          </div>
          
          {/* Reuse the interactive grid, adjusting vertical spacing */}
          <div className="-mt-12">
          <FeaturedProjectsSection headingLevel={1} initialProjects={dbProjects} content={{ title: content.hero.title, subtitle: content.hero.intro.replace(/<[^>]+>/g, ""), displayLimit: 100, ctaLabel: content.cta.label, ctaUrl: content.cta.url, emptyState: content.emptyState }} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
