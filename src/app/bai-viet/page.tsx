import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import GlassCard from "@/components/ui/GlassCard";
import GradientText from "@/components/ui/GradientText";
import { prisma } from "@/lib/db";
import { BookOpen, Calendar, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { createMetadata, JsonLd } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Blog — Bài viết & Chia sẻ kiến thức",
  description: "Đọc các bài viết chia sẻ kinh nghiệm lập trình Next.js, React, Node.js, kiến thức thiết kế giao diện UI/UX Figma và tin tức xu hướng công nghệ mới từ Cường Design.",
  path: "/bai-viet",
  keywords: ["Blog lập trình", "Hướng dẫn Next.js", "Kinh nghiệm thiết kế UI/UX", "Tin tức công nghệ", "Cường Design Blog"],
});

export default async function BlogListPage() {
  // Fetch categories and published posts
  const [categories, dbPosts] = await Promise.all([
    prisma.category.findMany({ orderBy: { order: "asc" } }),
    prisma.post.findMany({
      where: { status: "PUBLISHED" },
      include: {
        category: {
          select: { name: true, slug: true, color: true },
        },
      },
      orderBy: { publishedAt: "desc" },
    }),
  ]);

  // Calculate reading time helper
  const getReadTime = (content: string) => {
    const words = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
    const time = Math.ceil(words / 200); // 200 words per minute average
    return `${time} phút đọc`;
  };

  // Schema.org Blog structured data metadata
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Cường Design Blog",
    "description": "Kênh chia sẻ kiến thức thiết kế UI/UX và lập trình Fullstack của Cường Design.",
    "publisher": {
      "@type": "Person",
      "name": "Nguyễn Văn Cường",
      "url": "https://cuongdesign.com"
    },
    "blogPost": dbPosts.map((post) => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "alternativeHeadline": post.excerpt || "",
      "genre": "Software Development & Design",
      "url": `https://cuongdesign.com/bai-viet/${post.category?.slug || "chua-phan-loai"}/${post.slug}`,
      "datePublished": post.publishedAt || post.createdAt,
      "dateModified": post.updatedAt,
      "author": {
        "@type": "Person",
        "name": "Cường Design"
      },
      ...(post.category?.name && { "articleSection": post.category.name }),
    }))
  };

  return (
    <div className="min-h-screen bg-[#030014] text-gray-200 flex flex-col">
      {/* Inject Structured Data */}
      <JsonLd data={blogSchema} />

      <Header />

      <main className="grow pt-28 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Ambient Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none select-none z-0" />
        
        {/* Glow decorations */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 space-y-10">
          <Breadcrumbs items={[{ label: "Bài viết & Blog", href: "/bai-viet" }]} />

          {/* Heading */}
          <div className="text-left space-y-4 max-w-3xl">
            <span className="text-[10px] text-pink-500 font-mono font-bold tracking-widest uppercase block">Tech Journal & Insights</span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-none">
              Bài viết & Chia sẻ <br className="hidden md:inline" />
              <GradientText>Kiến thức công nghệ</GradientText>
            </h1>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed">
              Các bài viết hướng dẫn lập trình, thiết kế UI/UX thực tiễn, kinh nghiệm tối ưu hiệu năng ứng dụng web và chia sẻ các xu hướng phát triển công nghệ mới nhất.
            </p>
          </div>

          {/* Category Filter Pills */}
          {categories.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {/* "Tất cả" pill — active on this page */}
              <Link
                href="/bai-viet"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 bg-pink-500/15 text-pink-400 border border-pink-500/30 shadow-[0_0_12px_rgba(236,72,153,0.15)]"
              >
                Tất cả
                <span className="ml-1 text-[10px] bg-pink-500/20 text-pink-300 px-1.5 py-0.5 rounded-full font-mono">
                  {dbPosts.length}
                </span>
              </Link>

              {categories.map((cat) => {
                const postCount = dbPosts.filter((p) => p.category?.slug === cat.slug).length;
                return (
                  <Link
                    key={cat.id}
                    href={`/bai-viet/${cat.slug}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20"
                  >
                    {cat.color && (
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                    )}
                    {cat.name}
                    {postCount > 0 && (
                      <span className="ml-1 text-[10px] bg-white/10 text-gray-500 px-1.5 py-0.5 rounded-full font-mono">
                        {postCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Posts Grid */}
          {dbPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {dbPosts.map((post) => {
                const postUrl = `/bai-viet/${post.category?.slug || "chua-phan-loai"}/${post.slug}`;
                return (
                  <GlassCard
                    key={post.id}
                    className="group flex flex-col h-full overflow-hidden p-0 border border-white/5 bg-[#0d0b21]/45 hover:border-pink-500/25"
                  >
                    {/* Article Thumbnail Representation */}
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

                    {/* Post Info Area */}
                    <div className="p-6 flex flex-col grow space-y-4 text-left">
                      
                      {/* Category badge + Date and Reading Time row */}
                      <div className="flex flex-col gap-2.5">
                        {post.category && (
                          <Link href={`/bai-viet/${post.category.slug}`}>
                            <span
                              className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full w-fit transition-opacity hover:opacity-80"
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
                          </Link>
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

                      {/* Action link */}
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
              <p className="text-gray-500 text-sm">Chưa có bài viết nào được xuất bản. Hãy quay lại sau!</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
