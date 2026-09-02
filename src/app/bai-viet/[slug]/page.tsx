import React from "react";
import { notFound, permanentRedirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { sanitizeRichHtml } from "@/lib/content/sanitize";
import { markdownToHtml } from "@/lib/content/markdown";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import GlassCard from "@/components/ui/GlassCard";
import {
  buildArticleSchema,
  createMetadataFromSeoFields,
  JsonLd,
  resolveCanonicalPath,
} from "@/lib/seo";
import { Clock, Calendar, User, ArrowLeft, ArrowRight, Tag, BookOpen, Layers } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { getCategoryBySlug, getPostBySlug } from "@/lib/seo/queries";
import { resolveSeoRedirect } from "@/lib/seo/resolve-redirect";
import { siteConfig } from "@/data/site";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) return { robots: { index: false, follow: false } };

  return createMetadataFromSeoFields({
    seo: {
      title: post.seoTitle || undefined,
      description: post.seoDescription || undefined,
      keywords: post.seoKeywords,
      canonicalPath: post.canonicalPath || undefined,
      ogTitle: post.ogTitle || undefined,
      ogDescription: post.ogDescription || undefined,
      ogImage: post.ogImage || undefined,
      robotsIndex: post.robotsIndex,
      robotsFollow: post.robotsFollow,
    },
    fallback: {
      title: `${post.title} — Bài viết`,
      description: post.excerpt || post.title,
      image: post.coverImage || undefined,
    },
    path: `/bai-viet/${post.slug}`,
    type: "article",
    publishedTime: post.publishedAt?.toISOString(),
    modifiedTime: post.updatedAt.toISOString(),
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    const category = await getCategoryBySlug(slug);
    if (category) permanentRedirect(`/bai-viet/chuyen-muc/${category.slug}`);
    await resolveSeoRedirect(`/bai-viet/${slug}`);
    notFound();
  }

  const canonicalPath = resolveCanonicalPath(
    post.canonicalPath,
    `/bai-viet/${post.slug}`,
  );

  // Calculate reading time
  const getReadTime = (content: string | null) => {
    if (!content) return "1 phút đọc";
    const words = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
    const time = Math.ceil(words / 200);
    return `${time} phút đọc`;
  };

  const readingTime = getReadTime(post.content);
  // Fetch related posts from same category (exclude current)
  const relatedPosts = post.categoryId
    ? await prisma.post.findMany({
        where: {
          categoryId: post.categoryId,
          status: "PUBLISHED",
          id: { not: post.id },
        },
        include: {
          category: { select: { name: true, slug: true, color: true } },
        },
        orderBy: { publishedAt: "desc" },
        take: 3,
      })
    : [];

  // Schema.org BlogPosting structured data
  const blogPostingSchema = buildArticleSchema({
    slug: post.slug,
    path: canonicalPath,
    headline: post.title,
    description: post.excerpt || post.seoDescription || post.title,
    image: post.coverImage || siteConfig.ogImage,
    publishedAt: post.publishedAt || post.createdAt,
    updatedAt: post.updatedAt,
    section: post.category?.name,
    keywords: post.seoKeywords,
    content: post.content,
  });

  const accentColor = post.category?.color || "#ec4899";
  const articleHtml = /<\/?[a-z][^>]*>/i.test(post.content || "")
    ? sanitizeRichHtml(post.content)
    : sanitizeRichHtml(markdownToHtml(post.content || ""));

  return (
    <div className="min-h-screen bg-[#030014] text-gray-200 flex flex-col">
      <JsonLd data={blogPostingSchema} />

      <Header />

      <main className="grow py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Decorative Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none select-none z-0" />

        <div className="max-w-4xl mx-auto relative z-10 space-y-8 mt-8">
          {/* Breadcrumbs: Trang chủ > Bài viết > [Category] > [Post title] */}
          <Breadcrumbs
            items={[
              { label: "Bài viết", href: "/bai-viet" },
              ...(post.category
                ? [
                    {
                      label: post.category.name,
                      href: `/bai-viet/chuyen-muc/${post.category.slug}`,
                    },
                  ]
                : []),
              { label: post.title, href: canonicalPath },
            ]}
          />

          {/* Heading block */}
          <div className="space-y-4 text-left">
            {/* Category badge */}
            {post.category && (
              <Link href={`/bai-viet/chuyen-muc/${post.category.slug}`}>
                <span
                  className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full transition-opacity hover:opacity-80"
                  style={{
                    backgroundColor: `${accentColor}15`,
                    color: accentColor,
                    border: `1px solid ${accentColor}30`,
                  }}
                >
                  <Layers className="w-3 h-3" />
                  {post.category.name}
                </span>
              </Link>
            )}

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-gray-400 border-b border-white/5 pb-4">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4 text-pink-500" />
                <span>
                  Người viết: <strong>Cường Design</strong>
                </span>
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-purple-500" />
                <span>
                  {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString("vi-VN", {
                        dateStyle: "long",
                      })
                    : new Date(post.createdAt).toLocaleDateString("vi-VN", {
                        dateStyle: "long",
                      })}
                </span>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-pink-500" />
                <span>Thời gian: {readingTime}</span>
              </span>
            </div>
          </div>

          {/* Cover image */}
          {post.coverImage && (
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-white/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.coverImage}
                alt={post.coverImageAlt || post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Article content parsed */}
          <article
            className="article-content max-w-none text-gray-300 text-sm sm:text-base text-left"
            dangerouslySetInnerHTML={{ __html: articleHtml }}
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

          {/* Back to blog */}
          <div className="border-t border-white/5 pt-6">
            <Link
              href={post.category ? `/bai-viet/chuyen-muc/${post.category.slug}` : "/bai-viet"}
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-pink-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>
                {post.category
                  ? `Quay lại chuyên mục ${post.category.name}`
                  : "Quay lại danh sách bài viết"}
              </span>
            </Link>
          </div>

          {/* Related Posts Section */}
          {relatedPosts.length > 0 && (
            <section className="space-y-6 pt-4">
              <h2 className="text-xl font-bold text-white text-left">
                Bài viết cùng chuyên mục
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((related) => {
                  const relatedUrl = `/bai-viet/${related.slug}`;
                  return (
                    <GlassCard
                      key={related.id}
                      className="group flex flex-col h-full overflow-hidden p-0 border border-white/5 bg-[#0d0b21]/45 hover:border-pink-500/25"
                    >
                      {/* Thumbnail */}
                      <div className="relative w-full aspect-video bg-gradient-to-br from-purple-950/20 to-pink-950/30 border-b border-white/5 flex items-center justify-center overflow-hidden">
                        {related.coverImage ? (
                          <img
                            src={related.coverImage}
                            alt={related.coverImageAlt || related.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-[60%] h-[60%] bg-gradient-to-br from-indigo-950/60 to-purple-900/50 border border-white/10 rounded-xl p-3 flex flex-col items-center justify-center space-y-1 group-hover:scale-105 transition-transform duration-300">
                            <BookOpen className="w-6 h-6 text-pink-500/60" />
                            <span className="font-mono text-[8px] text-gray-500 select-none">
                              {related.slug}.md
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-4 flex flex-col grow space-y-3 text-left">
                        <div className="flex items-center text-[10px] text-gray-500 font-mono gap-2">
                          <Calendar className="w-3 h-3 text-pink-500" />
                          <span>
                            {related.publishedAt
                              ? new Date(related.publishedAt).toLocaleDateString("vi-VN")
                              : new Date(related.createdAt).toLocaleDateString("vi-VN")}
                          </span>
                        </div>

                        <Link href={relatedUrl}>
                          <h3 className="text-sm font-bold text-white group-hover:text-pink-400 transition-colors duration-200 line-clamp-2">
                            {related.title}
                          </h3>
                        </Link>

                        <div className="pt-2 border-t border-white/5 mt-auto">
                          <Link
                            href={relatedUrl}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-pink-400 hover:text-pink-300 transition-colors"
                          >
                            <span>Đọc tiếp</span>
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
