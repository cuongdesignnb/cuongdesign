"use client";

import { ArrowUpRight } from "lucide-react";
import { services } from "@/data/services";
import GlassCard from "../ui/GlassCard";
import SectionHeading from "../ui/SectionHeading";

export default function ServicesSection() {
  return (
    <section id="services" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeading
          title="Dịch vụ của tôi / My Services"
          subtitle="Các giải pháp thiết kế, phát triển và tối ưu hóa website chuyên sâu giúp thúc đẩy doanh số doanh nghiệp."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <GlassCard
                key={service.id}
                className="group p-8 relative flex flex-col h-full border border-white/5 hover:border-pink-500/30 hover:shadow-[0_0_30px_rgba(236,72,153,0.1)] transition-all duration-300 rounded-2xl bg-[#0d0b21]/45"
              >
                {/* Arrow Link Icon Top-Right */}
                <div className="absolute top-6 right-6 text-gray-500 group-hover:text-pink-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300">
                  <ArrowUpRight className="w-5 h-5" />
                </div>

                {/* Service Icon */}
                <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                  <Icon className="w-6 h-6" />
                </div>

                {/* Titles */}
                <h3 className="text-xl font-bold text-white mb-2 flex items-baseline gap-2 flex-wrap">
                  <span>{service.titleVi}</span>
                  <span className="text-gray-600 text-xs font-normal">/</span>
                  <span className="text-pink-400/80 text-xs font-mono font-normal tracking-wide">
                    {service.titleEn}
                  </span>
                </h3>

                {/* Description */}
                <p className="text-gray-400 text-sm leading-relaxed mt-2 grow">
                  {service.descVi}
                </p>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
