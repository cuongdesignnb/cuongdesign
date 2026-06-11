import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import { Folder, Globe, Code, Tag, Calendar, User, ArrowLeft, Layers } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await prisma.project.findUnique({
    where: { slug },
  });

  if (!project) {
    return {};
  }

  return {
    title: `${project.title} - Chi tiết dự án | Cường Design`,
    description: project.description,
    keywords: project.techStack,
    openGraph: {
      title: project.title,
      description: project.description,
      images: [{ url: project.coverImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.title} - Chi tiết dự án | Cường Design`,
      description: project.description,
      images: [project.coverImage],
    },
    alternates: {
      canonical: `https://cuongdesign.com/du-an/${slug}`,
    },
  };
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params;

  const project = await prisma.project.findUnique({
    where: { slug },
  });

  if (!project) {
    notFound();
  }

  // Schema.org Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    "name": project.title,
    "description": project.description,
    "codeRepository": project.githubUrl || undefined,
    "programmingLanguage": project.techStack,
    "runtimePlatform": project.techStack.join(", "),
    "author": {
      "@type": "Person",
      "name": "Cường Design",
    },
    "creativeWorkStatus": "Completed",
    "image": project.coverImage,
  };

  return (
    <div className="min-h-screen bg-[#030014] text-gray-200 flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header />

      <main className="grow py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none select-none z-0" />
        
        <div className="max-w-5xl mx-auto relative z-10 space-y-8 mt-8">
          {/* Breadcrumbs */}
          <Breadcrumbs
            items={[
              { label: "Dự án đã làm", href: "/#projects" },
              { label: project.title },
            ]}
          />

          {/* Heading */}
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-pink-500/10 text-pink-400 border border-pink-500/20 font-semibold uppercase">
                {project.category}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {project.title}
            </h1>
            <p className="text-sm text-gray-400 max-w-3xl leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* Main Visual: Big Image + Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-white/5 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={project.coverImage}
                alt={project.title}
                className="w-full h-full object-cover object-top transition-all duration-[3s] ease-in-out group-hover:duration-[8s] group-hover:object-bottom"
              />
            </div>

            {project.images && project.images.length > 1 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {project.images.map((imgUrl, idx) => (
                  <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-white/5 bg-white/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imgUrl}
                      alt={`${project.title} screenshot ${idx + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Split Detail Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Rich Text Content (8 cols) */}
            <div className="lg:col-span-8 space-y-6 text-left">
              <GlassCard className="p-6 md:p-8 border-white/5 bg-[#0a0822]/60">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-pink-500" />
                  <span>Chi tiết triển khai dự án</span>
                </h3>
                
                {/* Parse HTML description */}
                <article
                  className="prose prose-invert prose-pink max-w-none text-gray-300 leading-relaxed text-xs sm:text-sm md:text-base space-y-6"
                  dangerouslySetInnerHTML={{ __html: project.content }}
                />
              </GlassCard>
            </div>

            {/* Right Column: Spec/Link Cards (4 cols) */}
            <div className="lg:col-span-4 space-y-6 text-left">
              
              {/* Specs Info */}
              <GlassCard className="p-6 border-white/5 bg-[#0a0822]/80 space-y-4">
                <h4 className="text-sm font-bold text-white border-b border-white/5 pb-2">Thông tin kỹ thuật</h4>
                
                <div className="space-y-3.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      <span>Nhà phát triển:</span>
                    </span>
                    <span className="font-semibold text-white">Cường Design</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Thời gian cập nhật:</span>
                    </span>
                    <span className="font-semibold text-white">
                      {new Date(project.updatedAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold block mb-1">
                    Công nghệ sử dụng (Stack)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {project.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="text-[10px] bg-white/5 border border-white/5 rounded-md px-2 py-0.5 text-gray-300 font-mono"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </GlassCard>

              {/* Action Buttons */}
              <div className="space-y-3">
                {project.demoUrl && (
                  <Link href={`/preview/${project.slug}`} target="_blank" className="block">
                    <Button className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-3.5 flex items-center justify-center gap-2 rounded-xl text-sm">
                      <Globe className="w-4 h-4" />
                      <span>Trải nghiệm Live Demo</span>
                    </Button>
                  </Link>
                )}

                {project.githubUrl && (
                  <a href={project.githubUrl} target="_blank" rel="noreferrer" className="block">
                    <Button variant="outline" className="w-full font-semibold py-3.5 flex items-center justify-center gap-2 rounded-xl text-sm">
                      <Code className="w-4 h-4" />
                      <span>Xem GitHub Repository</span>
                    </Button>
                  </a>
                )}
              </div>

            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
