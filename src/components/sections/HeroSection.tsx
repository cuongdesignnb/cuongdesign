"use client";

import { Terminal, Send, ShoppingBag, Eye, Code2 } from "lucide-react";
import Button from "../ui/Button";
import GradientText from "../ui/GradientText";
import GlassCard from "../ui/GlassCard";
import Badge from "../ui/Badge";

export default function HeroSection() {
  return (
    <section
      id="home"
      className="relative min-h-screen pt-32 pb-20 flex items-center justify-center overflow-hidden"
    >
      {/* Background Orbs */}
      <div
        className="glow-orb w-[400px] h-[400px] bg-pink-500/10 top-20 -left-10"
        style={{ filter: "blur(120px)" }}
      />
      <div
        className="glow-orb w-[500px] h-[500px] bg-purple-600/10 bottom-10 -right-20"
        style={{ filter: "blur(150px)" }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column Info */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-3 py-1 text-xs text-gray-300">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>Freelancer Developer</span>
              <span className="text-gray-600">•</span>
              <span className="text-pink-400">Available for work</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight">
              Freelancer Developer <br />
              tạo ra website đẹp, <br />
              nhanh, <GradientText>tối ưu chuyển đổi</GradientText>
            </h1>

            <p className="text-lg md:text-xl text-gray-300 font-medium max-w-xl">
              Modern websites, web apps and digital products that convert.
            </p>

            <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-xl">
              Tôi chuyên thiết kế UI/UX hiện đại và lập trình website, web app tối ưu hiệu năng, chuẩn SEO và mang lại trải nghiệm người dùng tuyệt vời. Nhận dự án theo yêu cầu &amp; bán source code chất lượng cao.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 pt-2">
              <a href="#projects">
                <Button variant="primary" className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>Xem dự án / View Projects</span>
                </Button>
              </a>
              <a href="#products">
                <Button variant="outline" className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  <span>Mua source code / Buy Source Code</span>
                </Button>
              </a>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/5 max-w-md">
              <div>
                <div className="text-2xl md:text-3xl font-bold text-white">50+</div>
                <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Dự án hoàn thành</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-white">100+</div>
                <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Khách hàng hài lòng</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-white">3+</div>
                <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Năm kinh nghiệm</div>
              </div>
            </div>
          </div>

          {/* Right Column Visual Mockup */}
          <div className="lg:col-span-5 flex justify-center w-full">
            <div className="relative w-full max-w-md animate-float">
              {/* Decorative Glow */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl blur-lg opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
              
              <GlassCard className="relative w-full overflow-hidden p-0 border border-white/10 shadow-2xl flex flex-col">
                {/* IDE Window Header */}
                <div className="bg-white/5 px-4 py-3 flex items-center justify-between border-b border-white/10">
                  <div className="flex space-x-2">
                    <span className="w-3 h-3 rounded-full bg-red-500/80" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <span className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="text-xs font-mono text-gray-500">developer.ts</div>
                  <Terminal className="w-4 h-4 text-gray-600" />
                </div>

                {/* IDE Code Content */}
                <div className="p-6 font-mono text-xs md:text-sm text-left overflow-x-auto space-y-4">
                  <div className="text-pink-400">
                    <span className="text-purple-400">const</span> developer <span className="text-white">=</span> <span className="text-yellow-400">{"{"}</span>
                  </div>
                  <div className="pl-4">
                    <span className="text-gray-400">name:</span> <span className="text-green-300">"Cường Design"</span>,
                  </div>
                  <div className="pl-4">
                    <span className="text-gray-400">passion:</span> <span className="text-green-300">"Clean Code"</span>,
                  </div>
                  <div className="pl-4">
                    <span className="text-gray-400">focus:</span> <span className="text-yellow-400">{"["}</span>
                    <span className="text-green-300">"UI/UX"</span>, <span className="text-green-300">"Performance"</span>, <span className="text-green-300">"SEO"</span>
                    <span className="text-yellow-400">{"]"}</span>,
                  </div>
                  <div className="pl-4">
                    <span className="text-gray-400">available:</span> <span className="text-amber-400">true</span>
                  </div>
                  <div className="text-yellow-400">{"};"}</div>
                  
                  <div className="text-purple-400 pt-2">
                    export default <span className="text-white">developer;</span>
                  </div>
                </div>

                {/* Lighthouse Score Graphic Panel */}
                <div className="mt-auto border-t border-white/10 bg-[#080718] p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full border-4 border-green-500 flex items-center justify-center font-bold text-green-400 text-xs shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                      98
                    </div>
                    <div>
                      <div className="text-xs text-white font-semibold">Lighthouse Performance</div>
                      <div className="text-[10px] text-gray-500">Core Web Vitals Optimized</div>
                    </div>
                  </div>
                  <Badge variant="primary" className="flex items-center gap-1 font-mono text-[10px]">
                    <Code2 className="w-3 h-3" />
                    <span>Next.js 15</span>
                  </Badge>
                </div>
              </GlassCard>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
