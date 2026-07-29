"use client";

import { motion } from "framer-motion";
import { Send, ShoppingBag } from "lucide-react";
import Button from "../ui/Button";
import Reveal from "../motion/Reveal";
import MagneticButton from "../motion/MagneticButton";
import { homeContentDefaults, type HomeContent } from "@/content/defaults/home";

export default function CTASection({
  content = homeContentDefaults.cta,
}: {
  content?: HomeContent["cta"];
}) {
  if (!content.enabled) return null;
  return (
    <section className="py-16 relative overflow-hidden bg-[#030014]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <Reveal direction="scale">
          <motion.div
            className="relative rounded-3xl overflow-hidden p-8 md:p-12 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 shadow-[0_4px_30px_rgba(236,72,153,0.3)]"
            whileHover={{ boxShadow: "0 8px 50px rgba(236,72,153,0.4)" }}
            transition={{ duration: 0.4 }}
          >
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none select-none opacity-20" />
            <motion.div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" animate={{ x: [0, 30, 0], y: [0, -20, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
            <motion.div className="absolute -bottom-20 -left-20 w-40 h-40 bg-indigo-300/10 rounded-full blur-3xl" animate={{ x: [0, -20, 0], y: [0, 15, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} />

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
              <div className="space-y-4">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight">{content.title}</h2>
                <div className="text-sm md:text-base text-white/80 max-w-2xl" dangerouslySetInnerHTML={{ __html: content.content }} />
              </div>
              <div className="flex flex-wrap justify-center gap-4 shrink-0">
                {content.primaryCta.enabled && (
                  <MagneticButton>
                    <a href={content.primaryCta.url}>
                      <Button variant="secondary" className="bg-white text-purple-700 hover:bg-white/95 hover:scale-[1.02] flex items-center gap-2 border-none">
                        <Send className="w-4 h-4" /><span>{content.primaryCta.label}</span>
                      </Button>
                    </a>
                  </MagneticButton>
                )}
                {content.secondaryCta.enabled && (
                  <MagneticButton>
                    <a href={content.secondaryCta.url}>
                      <Button variant="outline" className="border-white/30 hover:bg-white/10 hover:border-white/50 flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4" /><span>{content.secondaryCta.label}</span>
                      </Button>
                    </a>
                  </MagneticButton>
                )}
              </div>
            </div>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}
