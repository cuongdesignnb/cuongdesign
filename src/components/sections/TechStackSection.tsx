"use client";

import { useState, useMemo } from "react";
import { techStack } from "@/data/techStack";
import SectionHeading from "../ui/SectionHeading";
import GlassCard from "../ui/GlassCard";

export default function TechStackSection() {
  const [activeTab, setActiveTab] = useState<string>("All");

  const categories = ["All", "frontend", "backend", "database", "tools", "ai"];

  const filteredTech = useMemo(() => {
    if (activeTab === "All") return techStack;
    return techStack.filter((t) => t.category === activeTab);
  }, [activeTab]);

  return (
    <section id="skills" className="py-24 relative overflow-hidden bg-[#030014]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeading
          title="Công nghệ sử dụng / Tech Stack"
          subtitle="Hệ sinh thái công nghệ hiện đại được lựa chọn tối ưu hiệu năng."
        />

        {/* Endless Marquee Banner */}
        <div className="relative w-full overflow-hidden bg-white/3 border-y border-white/5 py-6 mb-16 rounded-2xl">
          <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#030014] to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#030014] to-transparent z-10 pointer-events-none" />
          
          <div className="animate-marquee flex items-center space-x-12 whitespace-nowrap">
            {/* Repeated twice for endless scroll */}
            {[...techStack, ...techStack].map((tech, idx) => (
              <span
                key={idx}
                className="text-gray-400 hover:text-white font-mono font-semibold tracking-wider text-sm cursor-default select-none transition-colors duration-200"
              >
                {tech.name}
              </span>
            ))}
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                activeTab === cat
                  ? "bg-white/10 text-pink-400 border border-pink-500/30"
                  : "bg-white/3 text-gray-400 border border-white/5 hover:text-white hover:bg-white/5"
              }`}
            >
              {cat === "All" ? "Tất cả" : cat}
            </button>
          ))}
        </div>

        {/* Grid Display */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredTech.map((tech) => (
            <GlassCard
              key={tech.name}
              className="p-4 flex items-center justify-center text-center border-white/5 hover:border-pink-500/20 hover:scale-105 duration-200"
            >
              <span className="text-white font-medium text-sm font-mono tracking-wide">{tech.name}</span>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
