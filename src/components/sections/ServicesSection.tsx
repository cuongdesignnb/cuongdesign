"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BarChart3,
  Code2,
  Cpu,
  Globe,
  Layout,
  ShoppingBag,
  Target,
  Zap,
} from "lucide-react";
import GlassCard from "../ui/GlassCard";
import AnimatedSectionHeading from "../motion/AnimatedSectionHeading";
import Stagger from "../motion/Stagger";
import { fadeUpVariants, hoverDepthVariants } from "@/lib/motion";
import { homeContentDefaults, type HomeContent } from "@/content/defaults/home";
import Link from "next/link";

interface PublicService {
  id?: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  shortDescription: string;
  iconKey?: string | null;
}

const serviceIcons = { Layout, Globe, Target, ShoppingBag, BarChart3, Zap, Cpu, Code2 };

export default function ServicesSection({
  content = homeContentDefaults.services,
  initialServices = [],
}: {
  content?: HomeContent["services"];
  initialServices?: PublicService[];
}) {
  const selected = content.selectedSlugs as readonly string[];
  const services = initialServices
    .filter((service) => selected.length === 0 || selected.includes(service.slug))
    .slice(0, content.displayLimit);

  return (
    <section id="services" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <AnimatedSectionHeading title={content.title} subtitle={content.subtitle} />

        <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" stagger={0.1}>
          {services.map((service) => {
            const Icon = serviceIcons[service.iconKey as keyof typeof serviceIcons] || Code2;
            return (
              <motion.div key={service.id || service.slug} variants={fadeUpVariants}>
                <motion.div initial="rest" whileHover="hover" variants={hoverDepthVariants} className="h-full">
                  <Link href={`/dich-vu/${service.slug}`} className="block h-full">
                    <GlassCard className="group p-8 relative flex flex-col h-full border border-white/5 hover:border-pink-500/30 hover:shadow-[0_0_30px_rgba(236,72,153,0.1)] transition-colors duration-300 rounded-2xl bg-[#0d0b21]/45">
                      <div className="absolute top-6 right-6 text-gray-500 group-hover:text-pink-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300">
                        <ArrowUpRight className="w-5 h-5" />
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2 flex items-baseline gap-2 flex-wrap">
                        <span>{service.title}</span>
                        {service.subtitle && <><span className="text-gray-600 text-xs font-normal">/</span><span className="text-pink-400/80 text-xs font-mono font-normal tracking-wide">{service.subtitle}</span></>}
                      </h3>
                      <p className="text-gray-400 text-sm leading-relaxed mt-2 grow">{service.shortDescription}</p>
                    </GlassCard>
                  </Link>
                </motion.div>
              </motion.div>
            );
          })}
        </Stagger>

        {content.ctaLabel && (
          <div className="mt-8 text-center">
            <Link href={content.ctaUrl} className="text-sm font-medium text-pink-400 hover:text-pink-300">{content.ctaLabel}</Link>
          </div>
        )}
      </div>
    </section>
  );
}
