import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Metadata } from "next";

interface PolicyPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PolicyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await prisma.page.findUnique({
    where: { slug },
  });

  if (!page || !page.isPublished) {
    return {};
  }

  const pageTitle = `${page.seoTitle || page.title} - CUONG DESIGN`;
  const pageDescription = page.seoDescription || page.title;

  return {
    title: pageTitle,
    description: pageDescription,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: `https://cuongdesign.com/${slug}`,
      siteName: "Cuong Design",
      locale: "vi_VN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function PolicyPage({ params }: PolicyPageProps) {
  const { slug } = await params;
  
  const page = await prisma.page.findUnique({
    where: { slug },
  });

  if (!page || !page.isPublished) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#030014] text-gray-200 flex flex-col">
      <Header />
      
      <main className="grow py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Decorative Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none select-none z-0" />
        
        <div className="max-w-3xl mx-auto relative z-10 space-y-8 mt-8">
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
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
