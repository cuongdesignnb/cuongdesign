"use client";

import { Award, Briefcase, Users, Code2 } from "lucide-react";
import GlassCard from "../ui/GlassCard";
import SectionHeading from "../ui/SectionHeading";

export default function AboutSection() {
  const stats = [
    {
      id: "projects",
      title: "50+",
      label: "Projects Completed",
      desc: "Dự án hoàn thành",
      icon: Briefcase,
    },
    {
      id: "clients",
      title: "100+",
      label: "Happy Clients",
      desc: "Khách hàng hài lòng",
      icon: Users,
    },
    {
      id: "experience",
      title: "3+",
      label: "Years Experience",
      desc: "Kinh nghiệm thực tế",
      icon: Award,
    },
    {
      id: "products",
      title: "20+",
      label: "Source Products",
      desc: "Sản phẩm số đã bán",
      icon: Code2,
    },
  ];

  return (
    <section id="about" className="py-24 relative overflow-hidden bg-[#030014]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeading
          title="Về tôi / About Me"
          subtitle="Hành trình sáng tạo giao diện và tối ưu hóa hệ thống mã nguồn kỹ thuật số."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Side Profile Image */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative group w-64 h-64 md:w-80 md:h-80 rounded-3xl overflow-hidden border border-white/10 p-2 bg-[#0c0a21]">
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-3xl blur opacity-30 group-hover:opacity-75 transition duration-500" />
              
              {/* Dummy avatar representation using a stylized gradient icon panel */}
              <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-purple-900/60 to-pink-900/40 border border-white/5 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
                <div className="text-white text-center p-6 space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-4xl shadow-inner animate-pulse">
                    👨‍💻
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Cường Design</h3>
                    <p className="text-xs text-pink-400 font-mono mt-1">Senior Fullstack Developer</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Handwritten style signature */}
            <div className="mt-6 text-center">
              <span className="font-mono text-2xl text-pink-500 italic font-semibold tracking-wider block">
                Cuong Design
              </span>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 block">Chữ ký nhà phát triển</span>
            </div>
          </div>

          {/* Right Side Bio & Stats Grid */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4 text-gray-300 text-sm md:text-base leading-relaxed">
              <p>
                Tôi là một Freelancer Developer đam mê công nghệ và thiết kế giao diện. Với tôn chỉ làm việc lấy **chất lượng, tốc độ và tối ưu chuyển đổi** làm trọng tâm, tôi cam kết đồng hành cùng bạn hiện thực hóa ý tưởng thành sản phẩm phần mềm hoàn thiện.
              </p>
              <p>
                Mọi dự án tôi bàn giao đều tuân thủ nguyên tắc: viết Code sạch, chuẩn SEO tối ưu On-Page, hiệu năng tải trang đạt điểm tối đa trên Lighthouse và hiển thị responsive mượt mà trên mọi kích cỡ màn hình thiết bị di động.
              </p>
            </div>

            {/* Metrics Cards Grid */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <GlassCard key={stat.id} className="p-5 flex flex-col space-y-2 hover:scale-[1.02] border-white/5 hover:border-pink-500/20">
                    <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{stat.title}</div>
                      <div className="text-xs font-semibold text-gray-300 mt-0.5">{stat.label}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{stat.desc}</div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
