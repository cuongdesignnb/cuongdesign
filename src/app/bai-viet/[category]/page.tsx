import React from "react";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import GlassCard from "@/components/ui/GlassCard";
import { prisma } from "@/lib/db";
import { BookOpen, Calendar, ArrowRight, Clock, Layers } from "lucide-react";
import Link from "next/link";
import { createMetadata, JsonLd } from "@/lib/seo";
import type { Metadata } from "next";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: categorySlug } = await params;

  const category = await prisma.category.findUnique({
    where: { slug: categorySlug },
  });

  if (!category) return {};

  return createMetadata({
    title: `${category.name} — Blog Chuyên mục`,
    description: category.description || `Tổng hợp các bài viết thuộc chuyên mục ${category.name} — chia sẻ kiến thức và kinh nghiệm thực tiễn từ Cường Design.`,
    path: `/bai-viet/${category.slug}`,
    keywords: [category.name, "Blog", "Cường Design", "Chuyên mục"],
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: categorySlug } = await params;

  // Fetch current category
  const category = await prisma.category.findUnique({
    where: { slug: categorySlug },
  });

  if (!category) {
    notFound();
  }

  // Fetch all categories for navigation pills + posts for this category
  const [allCategories, posts] = await Promise.all([
    prisma.category.findMany({ orderBy: { order: "asc" } }),
    prisma.post.findMany({
      where: {
        categoryId: category.id,
        status: "PUBLISHED",
      },
      include: {
        category: {
          select: { name: true, slug: true, color: true },
        },
      },
      orderBy: { publishedAt: "desc" },
    }),
  ]);

  // Calculate reading time helper
  const getReadTime = (content: string | null) => {
    if (!content) return "1 phút đọc";
    const words = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
    const time = Math.ceil(words / 200);
    return `${time} phút đọc`;
  };

  // Schema.org CollectionPage structured data
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${category.name} — Chuyên mục Blog`,
    "description": category.description || `Tổng hợp các bài viết thuộc chuyên mục ${category.name}.`,
    "url": `https://cuongdesign.com/bai-viet/${category.slug}`,
    "isPartOf": {
      "@type": "Blog",
      "name": "Cường Design Blog",
      "url": "https://cuongdesign.com/bai-viet",
    },
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": posts.length,
      "itemListElement": posts.map((post, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "BlogPosting",
          "headline": post.title,
          "url": `https://cuongdesign.com/bai-viet/${category.slug}/${post.slug}`,
          "datePublished": post.publishedAt || post.createdAt,
          "dateModified": post.updatedAt,
          "author": {
            "@type": "Person",
            "name": "Cường Design",
          },
          "articleSection": category.name,
        },
      })),
    },
  };

  const accentColor = category.color || "#ec4899";

  return (
    <div className="min-h-screen bg-[#030014] text-gray-200 flex flex-col">
      <JsonLd data={collectionSchema} />

      <Header />

      <main className="grow pt-28 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Ambient Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none select-none z-0" />

        {/* Glow decorations — uses category color */}
        <div
          className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-[120px] pointer-events-none opacity-15"
          style={{ backgroundColor: accentColor }}
        />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 space-y-10">
          {/* Breadcrumbs */}
          <Breadcrumbs
            items={[
              { label: "Bài viết", href: "/bai-viet" },
              { label: category.name },
            ]}
          />

          {/* Hero Section */}
          <div className="relative rounded-2xl border border-white/5 bg-[#0a0822]/50 p-8 md:p-12 overflow-hidden">
            {/* Accent gradient bar at top */}
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{
                background: `linear-gradient(90deg, ${accentColor}, ${accentColor}66, transparent)`,
              }}
            />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <span
                    className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full"
                    style={{
                      backgroundColor: `${accentColor}15`,
                      color: accentColor,
                      border: `1px solid ${accentColor}30`,
                    }}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    Chuyên mục
                  </span>
                </div>

                <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-none">
                  {category.name}
                </h1>

                {category.description && (
                  <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-2xl">
                    {category.description}
                  </p>
                )}
              </div>

              {/* Post count badge */}
              <div className="flex items-center gap-3">
                <div
                  className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl border"
                  style={{
                    borderColor: `${accentColor}30`,
                    backgroundColor: `${accentColor}08`,
                  }}
                >
                  <span
                    className="text-2xl font-extrabold"
                    style={{ color: accentColor }}
                  >
                    {posts.length}
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium">bài viết</span>
                </div>
              </div>
            </div>
          </div>

          {/* Category Navigation Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/bai-viet"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20"
            >
              Tất cả
            </Link>

            {allCategories.map((cat) => {
              const isActive = cat.slug === categorySlug;
              const pillColor = cat.color || "#ec4899";
              return (
                <Link
                  key={cat.id}
                  href={`/bai-viet/${cat.slug}`}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "shadow-[0_0_12px_rgba(236,72,153,0.15)]"
                      : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20"
                  }`}
                  style={
                    isActive
                      ? {
                          backgroundColor: `${pillColor}15`,
                          color: pillColor,
                          borderWidth: "1px",
                          borderStyle: "solid",
                          borderColor: `${pillColor}30`,
                        }
                      : undefined
                  }
                >
                  {cat.color && (
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                  )}
                  {cat.name}
                </Link>
              );
            })}
          </div>

          {/* Posts Grid */}
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => {
                const postUrl = `/bai-viet/${category.slug}/${post.slug}`;
                return (
                  <GlassCard
                    key={post.id}
                    className="group flex flex-col h-full overflow-hidden p-0 border border-white/5 bg-[#0d0b21]/45 hover:border-pink-500/25"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-full aspect-video bg-gradient-to-br from-purple-950/20 to-pink-950/30 border-b border-white/5 flex items-center justify-center overflow-hidden">
                      {post.coverImage ? (
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-[70%] h-[70%] bg-gradient-to-br from-indigo-950/60 to-purple-900/50 border border-white/10 rounded-xl shadow-2xl p-4 flex flex-col items-center justify-center space-y-2 group-hover:scale-105 transition-transform duration-300">
                          <BookOpen className="w-8 h-8 text-pink-500/60" />
                          <span className="font-mono text-[9px] text-gray-500 select-none">
                            {post.slug}.md
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Post Info */}
                    <div className="p-6 flex flex-col grow space-y-4 text-left">
                      <div className="flex flex-col gap-2.5">
                        {post.category && (
                          <span
                            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full w-fit"
                            style={{
                              backgroundColor: `${post.category.color || "#ec4899"}15`,
                              color: post.category.color || "#ec4899",
                              border: `1px solid ${post.category.color || "#ec4899"}30`,
                            }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: post.category.color || "#ec4899" }}
                            />
                            {post.category.name}
                          </span>
                        )}
                        <div className="flex items-center space-x-4 text-[10px] text-gray-500 font-mono">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-pink-500" />
                            <span>
                              {post.publishedAt
                                ? new Date(post.publishedAt).toLocaleDateString("vi-VN")
                                : new Date(post.createdAt).toLocaleDateString("vi-VN")}
                            </span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-purple-500" />
                            <span>{getReadTime(post.content)}</span>
                          </span>
                        </div>
                      </div>

                      <div className="grow space-y-2">
                        <Link href={postUrl}>
                          <h3 className="text-lg font-bold text-white group-hover:text-pink-400 transition-colors duration-200 line-clamp-2">
                            {post.title}
                          </h3>
                        </Link>
                        <p className="text-gray-400 text-xs md:text-sm leading-relaxed line-clamp-3">
                          {post.excerpt || "Xem nội dung bài viết chi tiết để tìm hiểu thông tin và chia sẻ cụ thể của tác giả..."}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-white/5 mt-auto">
                        <Link
                          href={postUrl}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-400 hover:text-pink-300 transition-colors cursor-pointer"
                        >
                          <span>Đọc tiếp bài viết</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-[#0a0822]/40 rounded-2xl border border-white/5">
              <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 text-sm">
                Chưa có bài viết nào trong chuyên mục <strong className="text-gray-400">{category.name}</strong>. Hãy quay lại sau!
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
