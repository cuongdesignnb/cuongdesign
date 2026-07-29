"use client";

import { motion } from "framer-motion";
import { Award, Briefcase, Users, Code2 } from "lucide-react";
import GlassCard from "../ui/GlassCard";
import AnimatedSectionHeading from "../motion/AnimatedSectionHeading";
import Reveal from "../motion/Reveal";
import Stagger from "../motion/Stagger";
import CountUp from "../motion/CountUp";
import { fadeUpVariants, hoverDepthVariants } from "@/lib/motion";
import { homeContentDefaults, type HomeContent } from "@/content/defaults/home";

const statIcons = { Briefcase, Users, Award, Code2 };

export default function AboutSection({
  content = homeContentDefaults.about,
}: {
  content?: HomeContent["about"];
}) {
  return (
    <section id="about" className="py-24 relative overflow-hidden bg-[#030014]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <AnimatedSectionHeading
          title={content.title}
          subtitle={content.subtitle}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Side Profile Image */}
          <Reveal direction="left" className="lg:col-span-5 flex flex-col items-center">
            <div className="relative group w-64 h-64 md:w-80 md:h-80 rounded-3xl overflow-hidden border border-white/10 p-2 bg-[#0c0a21]">
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-3xl blur opacity-30 group-hover:opacity-75 transition duration-500" />
              
              <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-purple-900/60 to-pink-900/40 border border-white/5 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
                <div className="text-white text-center p-6 space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-4xl shadow-inner animate-pulse">
                    👨‍💻
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{content.name}</h3>
                    <p className="text-xs text-pink-400 font-mono mt-1">{content.jobTitle}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <span className="font-mono text-2xl text-pink-500 italic font-semibold tracking-wider block">
                {content.signature}
              </span>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 block">Chữ ký nhà phát triển</span>
            </div>
          </Reveal>

          {/* Right Side Bio & Stats Grid */}
          <Reveal direction="right" className="lg:col-span-7 space-y-8">
            <div className="space-y-4 text-gray-300 text-sm md:text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: content.content }} />

            {/* Metrics Cards Grid */}
            <Stagger className="grid grid-cols-2 gap-4" stagger={0.12}>
              {content.statistics.map((stat) => {
                const Icon = statIcons[stat.iconKey as keyof typeof statIcons] || Briefcase;
                return (
                  <motion.div key={stat.label} variants={fadeUpVariants}>
                    <motion.div
                      initial="rest"
                      whileHover="hover"
                      variants={hoverDepthVariants}
                    >
                      <GlassCard className="p-5 flex flex-col space-y-2 border-white/5 hover:border-pink-500/20 transition-colors duration-300">
                        <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-white">
                            <CountUp to={stat.value} suffix={stat.suffix} />
                          </div>
                          <div className="text-xs font-semibold text-gray-300 mt-0.5">{stat.label}</div>
                          <div className="text-[10px] text-gray-500 mt-0.5">{stat.description}</div>
                        </div>
                      </GlassCard>
                    </motion.div>
                  </motion.div>
                );
              })}
            </Stagger>
          </Reveal>
        </div>

      </div>
    </section>
  );
}
