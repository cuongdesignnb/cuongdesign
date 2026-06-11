import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import GlassCard from "@/components/ui/GlassCard";
import GradientText from "@/components/ui/GradientText";
import TestimonialForm from "@/components/ui/TestimonialForm";
import { prisma } from "@/lib/db";
import { testimonials as staticTestimonials } from "@/data/testimonials";
import { Star, Quote, MessageSquare } from "lucide-react";
import { createMetadata, JsonLd, buildProfessionalServiceSchema } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Đánh giá & Nhận xét từ khách hàng",
  description: "Đọc các nhận xét, phản hồi thực tế từ các đối tác, khách hàng đã hợp tác thiết kế UI/UX và lập trình website cùng Cường Design. Gửi đánh giá của riêng bạn.",
  path: "/danh-gia",
  keywords: ["Đánh giá Cường Design", "Nhận xét khách hàng", "Testimonials freelancer", "Thiết kế website uy tín"],
});

export default async function TestimonialsListPage() {
  // Fetch only published testimonials from database
  let dbTestimonials: any[] = [];
  try {
    dbTestimonials = await prisma.testimonial.findMany({
      where: { isPublished: true },
      orderBy: { order: "asc" }
    });
  } catch (error) {
    console.warn("Database connection failed during build for testimonials page.");
  }

  // Unified testimonials list mapping to avoid type mismatches between DB schema and static mock data structures
  const testimonials = (dbTestimonials.length > 0 ? dbTestimonials : staticTestimonials).map((t) => ({
    id: t.id,
    name: t.name,
    role: t.role,
    company: t.company || null,
    rating: t.rating,
    avatar: t.avatar || "",
    quote: "quote" in t ? (t as any).quote : (t as any).quoteVi,
  }));

  // Calculate average rating for schema
  const avgRating = testimonials.reduce((acc, curr) => acc + curr.rating, 0) / testimonials.length;

  // Schema.org ProfessionalService with AggregateRating metadata
  const ratingSchema = {
    "@context": "https://schema.org",
    ...buildProfessionalServiceSchema({
      aggregateRating: {
        "@type": "AggregateRating",
        "ratingValue": avgRating.toFixed(1),
        "reviewCount": testimonials.length,
        "bestRating": "5",
        "worstRating": "1"
      },
      review: testimonials.map((t) => ({
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": t.name
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": t.rating
        },
        "reviewBody": t.quote
      }))
    })
  };

  return (
    <div className="min-h-screen bg-[#030014] text-gray-200 flex flex-col">
      {/* Inject Structured Data */}
      <JsonLd data={ratingSchema} />

      <Header />

      <main className="grow pt-28 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Ambient Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none select-none z-0" />
        
        {/* Glow decorations */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 space-y-10">
          <Breadcrumbs items={[{ label: "Đánh giá của đối tác", href: "/danh-gia" }]} />

          {/* Heading */}
          <div className="text-left space-y-4 max-w-3xl">
            <span className="text-[10px] text-pink-500 font-mono font-bold tracking-widest uppercase block">Testimonials & Feedback</span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-none">
              Khách hàng nói gì về <br className="hidden md:inline" />
              <GradientText>Cường Design</GradientText>?
            </h1>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed">
              Những nhận xét, phản hồi thực tế từ các doanh nghiệp, lập trình viên và đối tác đã trực tiếp làm việc, mua sản phẩm số hoặc hợp tác dự án cùng Cường.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Testimonial cards list (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 text-left pb-2 border-b border-white/5">
                <MessageSquare className="w-5 h-5 text-pink-400" />
                <span>Nhận xét gần đây ({testimonials.length})</span>
              </h2>

              <div className="grid grid-cols-1 gap-6">
                {testimonials.map((t) => (
                  <GlassCard 
                    key={t.id} 
                    className="p-6 md:p-8 border-white/5 bg-[#0a0822]/60 hover:border-pink-500/25 relative flex flex-col justify-between"
                  >
                    {/* Background Quote Mark */}
                    <Quote className="w-12 h-12 text-pink-500/5 absolute right-6 top-6 pointer-events-none select-none" />
                    
                    <div className="space-y-4 text-left">
                      {/* Rating stars indicator */}
                      <div className="flex space-x-1">
                        {Array.from({ length: t.rating }).map((_, i) => (
                          <Star key={i} className="w-4.5 h-4.5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>

                      <p className="text-gray-300 text-sm md:text-base leading-relaxed italic">
                        "{t.quote}"
                      </p>
                    </div>

                    <div className="flex items-center space-x-4 pt-4 border-t border-white/5 mt-6 text-left">
                      {/* Avatar initial text representation to match footer layout */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs select-none shadow-md">
                        {t.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{t.name}</h4>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          {t.role} {t.company ? `@ ${t.company}` : ""}
                        </p>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>

            {/* Right Column: Form submission card (5 cols) */}
            <div className="lg:col-span-5 lg:sticky lg:top-24">
              <TestimonialForm />
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
