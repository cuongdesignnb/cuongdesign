import React from "react";
import { notFound } from "next/navigation";
import { sanitizeRichHtml } from "@/lib/content/sanitize";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Metadata } from "next";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import {
  buildBreadcrumbSchema,
  buildWebPageSchema,
  createMetadataFromSeoFields,
  JsonLd,
  resolveCanonicalPath,
} from "@/lib/seo";
import { getPageBySlug } from "@/lib/seo/queries";
import { resolveSeoRedirect } from "@/lib/seo/resolve-redirect";

interface PolicyPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PolicyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page || !page.isPublished) {
    return {};
  }

  return createMetadataFromSeoFields({
    seo: {
      title: page.seoTitle || undefined,
      description: page.seoDescription || undefined,
      keywords: page.seoKeywords,
      canonicalPath: page.canonicalPath || undefined,
      ogTitle: page.ogTitle || undefined,
      ogDescription: page.ogDescription || undefined,
      ogImage: page.ogImage || undefined,
      robotsIndex: page.robotsIndex,
      robotsFollow: page.robotsFollow,
    },
    fallback: { title: page.title, description: page.title },
    path: `/${page.slug}`,
  });
}

export default async function PolicyPage({ params }: PolicyPageProps) {
  const { slug } = await params;
  
  const page = await getPageBySlug(slug);

  if (!page) {
    await resolveSeoRedirect(`/${slug}`);
    notFound();
  }

  const canonicalPath = resolveCanonicalPath(page.canonicalPath, `/${page.slug}`);

  const schemas = [
    buildWebPageSchema({
      path: canonicalPath,
      name: page.title,
      description: page.seoDescription || page.title,
    }),
    buildBreadcrumbSchema([
      { name: "Trang chủ", href: "/" },
      { name: page.title, href: canonicalPath },
    ]),
  ];

  return (
    <div className="min-h-screen bg-[#030014] text-gray-200 flex flex-col">
      <JsonLd data={schemas} />
      <Header />
      
      <main className="grow py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Decorative Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none select-none z-0" />
        
        <div className="max-w-3xl mx-auto relative z-10 space-y-8 mt-8">
          <Breadcrumbs items={[{ label: page.title, href: canonicalPath }]} />
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {page.title}
            </h1>
            <p className="text-xs text-gray-500">
              Cập nhật lúc: {new Date(page.updatedAt).toLocaleString("vi-VN")}
            </p>
          </div>
          
          {/* Render policy html contents (generated via TipTap editor) */}
          <article 
            className="prose prose-invert prose-pink max-w-none text-gray-300 leading-relaxed text-sm sm:text-base space-y-6"
            dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(page.content) }}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
