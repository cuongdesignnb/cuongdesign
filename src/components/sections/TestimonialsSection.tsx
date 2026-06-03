"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { testimonials as staticTestimonials } from "@/data/testimonials";
import GlassCard from "../ui/GlassCard";
import AnimatedSectionHeading from "../motion/AnimatedSectionHeading";
import Stagger from "../motion/Stagger";
import { fadeUpVariants, hoverDepthVariants } from "@/lib/motion";

export default function TestimonialsSection({ initialTestimonials }: { initialTestimonials?: any[] }) {
  const testimonials = initialTestimonials || staticTestimonials;
  return (
    <section id="testimonials" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <AnimatedSectionHeading
          title="Đánh giá của khách hàng / Testimonials"
          subtitle="Những phản hồi chân thực từ các đối tác, khách hàng đã trực tiếp hợp tác cùng Cường."
        />

        <Stagger className="grid grid-cols-1 md:grid-cols-2 gap-8" stagger={0.12}>
          {testimonials.map((t) => (
            <motion.div key={t.id} variants={fadeUpVariants}>
              <motion.div
                initial="rest"
                whileHover="hover"
                variants={hoverDepthVariants}
                className="h-full"
              >
                <GlassCard
                  className="p-8 border-white/5 bg-[#0d0b21]/45 hover:border-pink-500/25 relative flex flex-col justify-between transition-colors duration-300 h-full"
                >
                  {/* Quote Icon Background */}
                  <Quote className="w-12 h-12 text-pink-500/5 absolute right-6 top-6 pointer-events-none select-none" />

                  <div className="space-y-4">
                    {/* Stars */}
                    <div className="flex space-x-1">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0, rotate: -30 }}
                          whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                          viewport={{ once: true }}
                          transition={{
                            delay: 0.3 + i * 0.08,
                            type: "spring",
                            stiffness: 300,
                            damping: 12,
                          }}
                        >
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        </motion.div>
                      ))}
                    </div>

                    {/* Quote */}
                    <p className="text-gray-300 text-sm md:text-base leading-relaxed italic">
                      &ldquo;{t.quoteVi || t.quote}&rdquo;
                    </p>
                  </div>

                  {/* Client Info */}
                  <div className="flex items-center space-x-4 pt-6 border-t border-white/5 mt-6">
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
              </motion.div>
            </motion.div>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
