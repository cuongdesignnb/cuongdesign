"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import GlassCard from "../ui/GlassCard";
import AnimatedSectionHeading from "../motion/AnimatedSectionHeading";
import Stagger from "../motion/Stagger";
import { fadeUpVariants, hoverDepthVariants, motionTokens } from "@/lib/motion";
import { homeContentDefaults, type HomeContent } from "@/content/defaults/home";

export default function WorkProcessSection({
  content = homeContentDefaults.process,
}: {
  content?: HomeContent["process"];
}) {
  const lineRef = useRef<HTMLDivElement>(null);
  const isLineInView = useInView(lineRef, { once: true, amount: 0.3 });

  return (
    <section id="process" className="py-24 relative overflow-hidden bg-[#030014]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <AnimatedSectionHeading title={content.title} subtitle={content.subtitle} />

        <div className="relative" ref={lineRef}>
          <motion.div
            className="hidden lg:block absolute top-1/2 left-4 right-4 h-0.5 bg-gradient-to-r from-pink-500/40 via-purple-500/40 to-indigo-500/40 -translate-y-1/2 z-0 origin-left"
            initial={{ scaleX: 0 }}
            animate={isLineInView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 1.2, ease: motionTokens.ease.out, delay: 0.3 }}
          />

          <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10" stagger={0.15}>
            {content.steps.map((step) => (
              <motion.div key={step.number} variants={fadeUpVariants}>
                <motion.div initial="rest" whileHover="hover" variants={hoverDepthVariants} className="h-full">
                  <GlassCard className="p-8 relative flex flex-col items-center text-center border-white/5 bg-[#0d0b21]/45 hover:border-pink-500/20 transition-colors duration-300 h-full">
                    <motion.div
                      className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-[0_0_15px_rgba(236,72,153,0.3)] mb-6 select-none"
                      whileHover={{ scale: 1.15, boxShadow: "0 0 25px rgba(236,72,153,0.5)" }}
                      transition={motionTokens.spring.stiff}
                    >
                      {step.number}
                    </motion.div>
                    <h3 className="text-lg font-bold text-white mb-2">{step.titleVi}</h3>
                    <span className="text-[10px] text-pink-400 font-mono tracking-wider block uppercase mb-4">{step.titleEn}</span>
                    <p className="text-gray-400 text-xs md:text-sm leading-relaxed grow">{step.description}</p>
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
