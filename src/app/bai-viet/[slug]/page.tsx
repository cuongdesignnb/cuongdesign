import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Metadata } from "next";
import { Clock, Calendar, User, ArrowLeft, Tag } from "lucide-react";
import Link from "next/link";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  const post = await prisma.post.findFirst({
    where: {
      OR: [
        { slug },
        { id: slug }
      ]
    },
  });

  if (!post) {
    return {};
  }

  return {
    title: `${post.seoTitle || post.title} - Bài viết | CUONG DESIGN`,
    description: post.seoDescription || post.excerpt || post.title,
    keywords: post.seoKeywords,
    openGraph: {
      title: post.title,
      description: post.excerpt || "",
      images: post.coverImage ? [{ url: post.coverImage }] : [],
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;

  // Fetch post
  const post = await prisma.post.findFirst({
    where: {
      OR: [
        { slug },
        { id: slug }
      ]
    },
  });

  if (!post) {
    notFound();
  }

  // Schema.org Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://cuongdesign.com/bai-viet/${post.slug}`,
    },
    "headline": post.title,
    "description": post.excerpt || post.seoDescription || post.title,
    "image": post.coverImage ? `https://cuongdesign.com${post.coverImage}` : "https://cuongdesign.com/images/og-image.jpg",
    "author": {
      "@type": "Person",
      "name": "Cường Design",
      "url": "https://cuongdesign.com",
    },
    "publisher": {
      "@type": "Organization",
      "name": "CUONG DESIGN",
      "logo": {
        "@type": "ImageObject",
        "url": "https://cuongdesign.com/favicon.ico",
      },
    },
    "datePublished": post.publishedAt?.toISOString() || post.createdAt.toISOString(),
    "dateModified": post.updatedAt.toISOString(),
  };

  return (
    <div className="min-h-screen bg-[#030014] text-gray-200 flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <Header />
      
      <main className="grow py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Decorative Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none select-none z-0" />
        
        <div className="max-w-4xl mx-auto relative z-10 space-y-8 mt-8">
          
          {/* Breadcrumbs */}
          <Breadcrumbs
            items={[
              { label: "Tin tức", href: "/#blog" }, // Anchor to blog section if needed
              { label: post.title }
            ]}
          />

          {/* Heading block */}
          <div className="space-y-4 text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-gray-400 border-b border-white/5 pb-4">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4 text-pink-500" />
                <span>Người viết: <strong>Cường Design</strong></span>
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-purple-500" />
                <span>
                  {post.publishedAt 
                    ? new Date(post.publishedAt).toLocaleDateString("vi-VN", { dateStyle: "long" })
                    : new Date(post.createdAt).toLocaleDateString("vi-VN", { dateStyle: "long" })
                  }
                </span>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-pink-500" />
                <span>Thời gian: 5 phút đọc</span>
              </span>
            </div>
          </div>

          {/* Cover image */}
          {post.coverImage && (
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-white/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Article content parsed */}
          <article 
            className="prose prose-invert prose-pink max-w-none text-gray-300 leading-relaxed text-sm sm:text-base space-y-6 text-left"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          {post.seoKeywords && post.seoKeywords.length > 0 && (
            <div className="border-t border-white/5 pt-6 flex flex-wrap gap-2 text-left">
              {post.seoKeywords.map((tag) => (
                <span 
                  key={tag}
                  className="text-xs bg-white/5 border border-white/5 text-gray-400 rounded-lg px-2.5 py-1 font-medium font-mono"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
