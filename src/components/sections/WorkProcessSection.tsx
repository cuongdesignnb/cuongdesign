"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import GlassCard from "../ui/GlassCard";
import AnimatedSectionHeading from "../motion/AnimatedSectionHeading";
import Stagger from "../motion/Stagger";
import { fadeUpVariants, hoverDepthVariants, motionTokens } from "@/lib/motion";

export default function WorkProcessSection() {
  const lineRef = useRef<HTMLDivElement>(null);
  const isLineInView = useInView(lineRef, { once: true, amount: 0.3 });

  const steps = [
    {
      id: "01",
      titleVi: "Tiếp nhận yêu cầu",
      titleEn: "Requirements Gathering",
      descVi: "Trao đổi chi tiết về ý tưởng dự án, tư vấn các giải pháp kỹ thuật tối ưu nhất.",
      descEn: "Discuss project details and brainstorm optimal technical approaches.",
    },
    {
      id: "02",
      titleVi: "Phân tích & Wireframe",
      titleEn: "Analysis & Wireframes",
      descVi: "Phân tích yêu cầu, xây dựng wireframe bố cục giao diện và lập kế hoạch chi tiết.",
      descEn: "Outline user flows, map site layouts, and draw roadmap specifications.",
    },
    {
      id: "03",
      titleVi: "Thiết kế & Lập trình",
      titleEn: "Design & Development",
      descVi: "Thiết kế UI/UX độc quyền, lập trình tối ưu tốc độ load và tích hợp chức năng.",
      descEn: "Create responsive UI views and write clean, performant source code.",
    },
    {
      id: "04",
      titleVi: "Bàn giao & Hỗ trợ",
      titleEn: "Deployment & Support",
      descVi: "Bàn giao source code, hỗ trợ cài đặt chạy thực tế và bảo trì lỗi phát sinh.",
      descEn: "Deploy database systems, release live links, and support queries.",
    },
  ];

  return (
    <section id="process" className="py-24 relative overflow-hidden bg-[#030014]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <AnimatedSectionHeading
          title="Quy trình làm việc / Work Process"
          subtitle="Các bước làm việc minh bạch giúp rút ngắn thời gian và đảm bảo sản phẩm đạt chất lượng cao nhất."
        />

        {/* Timeline Layout */}
        <div className="relative" ref={lineRef}>
          {/* Animated Connecting Line */}
          <motion.div
            className="hidden lg:block absolute top-1/2 left-4 right-4 h-0.5 bg-gradient-to-r from-pink-500/40 via-purple-500/40 to-indigo-500/40 -translate-y-1/2 z-0 origin-left"
            initial={{ scaleX: 0 }}
            animate={isLineInView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{
              duration: 1.2,
              ease: motionTokens.ease.out,
              delay: 0.3,
            }}
          />

          <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10" stagger={0.15}>
            {steps.map((step, idx) => (
              <motion.div key={step.id} variants={fadeUpVariants}>
                <motion.div
                  initial="rest"
                  whileHover="hover"
                  variants={hoverDepthVariants}
                  className="h-full"
                >
                  <GlassCard
                    className="p-8 relative flex flex-col items-center text-center border-white/5 bg-[#0d0b21]/45 hover:border-pink-500/20 transition-colors duration-300 h-full"
                  >
                    {/* Animated Number Circle Badge */}
                    <motion.div
                      className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-[0_0_15px_rgba(236,72,153,0.3)] mb-6 select-none"
                      whileHover={{
                        scale: 1.15,
                        boxShadow: "0 0 25px rgba(236,72,153,0.5)",
                      }}
                      transition={motionTokens.spring.stiff}
                    >
                      {step.id}
                    </motion.div>

                    {/* Step Title */}
                    <h3 className="text-lg font-bold text-white mb-2">
                      {step.titleVi}
                    </h3>
                    <span className="text-[10px] text-pink-400 font-mono tracking-wider block uppercase mb-4">
                      {step.titleEn}
                    </span>

                    {/* Step Description */}
                    <p className="text-gray-400 text-xs md:text-sm leading-relaxed grow">
                      {step.descVi}
                    </p>
                  </GlassCard>
                </motion.div>
              </motion.div>
            ))}
          </Stagger>
        </div>

      </div>
    </section>
  );
}
