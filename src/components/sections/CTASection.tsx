"use client";

import { Send, ShoppingBag } from "lucide-react";
import Button from "../ui/Button";

export default function CTASection() {
  return (
    <section className="py-16 relative overflow-hidden bg-[#030014]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="relative rounded-3xl overflow-hidden p-8 md:p-12 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 shadow-[0_4px_30px_rgba(236,72,153,0.3)]">
          {/* Subtle Grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none select-none opacity-20" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight">
                Bạn cần một website đẹp, tối ưu và chuyên nghiệp?
              </h2>
              <p className="text-sm md:text-base text-white/80 max-w-2xl">
                Hoặc bạn muốn sở hữu các bộ mã nguồn, source code được đóng gói sẵn để triển khai nhanh? Liên hệ ngay để được Cường tư vấn giải pháp chi tiết.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 shrink-0">
              <a href="#contact">
                <Button variant="secondary" className="bg-white text-purple-700 hover:bg-white/95 hover:scale-[1.02] flex items-center gap-2 border-none">
                  <Send className="w-4 h-4" />
                  <span>Liên hệ hợp tác</span>
                </Button>
              </a>
              <a href="#products">
                <Button variant="outline" className="border-white/30 hover:bg-white/10 hover:border-white/50 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  <span>Xem sản phẩm</span>
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
