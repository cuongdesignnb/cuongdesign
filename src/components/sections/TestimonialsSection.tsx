"use client";

import { Star, Quote } from "lucide-react";
import { testimonials as staticTestimonials } from "@/data/testimonials";
import GlassCard from "../ui/GlassCard";
import SectionHeading from "../ui/SectionHeading";

export default function TestimonialsSection({ initialTestimonials }: { initialTestimonials?: any[] }) {
  const testimonials = initialTestimonials || staticTestimonials;
  return (
    <section id="testimonials" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeading
          title="Đánh giá của khách hàng / Testimonials"
          subtitle="Những phản hồi chân thực từ các đối tác, khách hàng đã trực tiếp hợp tác cùng Cường."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((t) => (
            <GlassCard
              key={t.id}
              className="p-8 border-white/5 bg-[#0d0b21]/45 hover:border-pink-500/25 relative flex flex-col justify-between"
            >
              {/* Quote Icon Background */}
              <Quote className="w-12 h-12 text-pink-500/5 absolute right-6 top-6 pointer-events-none select-none" />

              <div className="space-y-4">
                {/* Stars */}
                <div className="flex space-x-1">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-gray-300 text-sm md:text-base leading-relaxed italic">
                  "{t.quoteVi || t.quote}"
                </p>
              </div>

              {/* Client Info Info */}
              <div className="flex items-center space-x-4 pt-6 border-t border-white/5 mt-6">
                {/* Stylized text placeholder for avatar to bypass missing files */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs select-none">
                  {t.name[0]}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{t.name}</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {t.role} {t.company && `@ ${t.company}`}
                  </p>
                </div>
              </div>

            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
