import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import GlassCard from "@/components/ui/GlassCard";
import GradientText from "@/components/ui/GradientText";
import Button from "@/components/ui/Button";
import { Cpu, Layout, Server, Database, Settings, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Năng lực công nghệ & Kỹ năng lập trình | Cường Design",
  description: "Xem chi tiết hệ sinh thái kỹ năng lập trình Fullstack (Next.js, React, TypeScript, Node.js, Prisma, PostgreSQL), thiết kế UI/UX Figma và tối ưu hóa hệ thống Web App của Cường Design.",
  keywords: ["Kỹ năng lập trình", "Chuyên gia Next.js", "Lập trình viên Fullstack", "Thiết kế Figma UI/UX", "Cường Design"],
};

export default function SkillsPage() {
  const skillGroups = [
    {
      category: "Frontend Engineering",
      icon: Layout,
      color: "from-pink-500 to-rose-500",
      desc: "Xây dựng giao diện web phản hồi nhanh, hiệu năng cao, tối ưu SEO onpage và có tương tác sinh động.",
      skills: [
        { name: "Next.js (App Router, ISR/SSR)", level: 95, exp: "4 năm", desc: "Sử dụng chính trong việc triển khai web app, blog SEO." },
        { name: "ReactJS (Hooks, Context, State)", level: 95, exp: "6 năm", desc: "Nền tảng cốt lõi xây dựng giao diện Single-Page và Component." },
        { name: "Tailwind CSS (v3 / v4 Tokens)", level: 92, exp: "5 năm", desc: "Tối ưu hóa tốc độ code UI, thiết lập cấu trúc Design System." },
        { name: "TypeScript (Type-Safe Coding)", level: 90, exp: "4 năm", desc: "Viết mã nguồn an toàn kiểu dữ liệu, dễ dàng bảo trì mở rộng." },
        { name: "Framer Motion / GSAP (Micro-Animations)", level: 88, exp: "3 năm", desc: "Tạo các hiệu ứng cuộn trang, di chuột tinh tế, nâng tầm UX." }
      ]
    },
    {
      category: "Backend & APIs",
      icon: Server,
      color: "from-purple-500 to-indigo-500",
      desc: "Xây dựng kiến trúc API bảo mật, luồng xử lý bất đồng bộ mạnh mẽ và tích hợp bên thứ ba.",
      skills: [
        { name: "Node.js (Express / NestJS)", level: 85, exp: "5 năm", desc: "Phát triển server-side logic, phân tích nghiệp vụ phức tạp." },
        { name: "Auth.js (NextAuth v5 Beta)", level: 90, exp: "2 năm", desc: "Triển khai xác thực đa tầng bảo mật (Credentials, OAuth)." },
        { name: "Nodemailer (SMTP Mailer)", level: 90, exp: "4 năm", desc: "Tự động gửi email đối soát giao dịch và gửi link download." },
        { name: "RESTful API Development", level: 92, exp: "6 năm", desc: "Thiết kế API chuẩn hóa, phản hồi nhanh, bảo mật phân quyền." }
      ]
    },
    {
      category: "Database & ORMs",
      icon: Database,
      color: "from-blue-500 to-cyan-500",
      desc: "Thiết kế mô hình dữ liệu quan hệ tối ưu hóa tốc độ truy vấn lớn và quản lý giao dịch.",
      skills: [
        { name: "PostgreSQL", level: 88, exp: "4 năm", desc: "Cơ sở dữ liệu chính lưu trữ dự án, đơn hàng, người dùng." },
        { name: "Prisma ORM", level: 92, exp: "3 năm", desc: "Đồng bộ hóa schema tự động, viết câu lệnh query type-safe." },
        { name: "MySQL", level: 85, exp: "5 năm", desc: "Sử dụng cho các dự án thương mại vừa và nhỏ." },
        { name: "Database Indexing & Optimization", level: 80, exp: "3 năm", desc: "Tối ưu hóa chỉ mục, truy vấn phức tạp tăng tốc DB." }
      ]
    },
    {
      category: "Cloud, DevOps & Tools",
      icon: Settings,
      color: "from-teal-500 to-emerald-500",
      desc: "Đóng gói mã nguồn ứng dụng độc lập, cấu hình máy chủ Nginx và CI/CD tự động.",
      skills: [
        { name: "Docker & Docker Compose", level: 82, exp: "3 năm", desc: "Đóng gói database, backend và frontend chạy cô lập ổn định." },
        { name: "Vercel / Netlify Deployment", level: 95, exp: "4 năm", desc: "Cài đặt chạy website Next.js với Edge Network tối ưu." },
        { name: "Git / GitHub Version Control", level: 90, exp: "6 năm", desc: "Quản lý nhánh code, kiểm soát phiên bản và cộng tác nhóm." },
        { name: "VPS Administration (Ubuntu, Nginx)", level: 78, exp: "3 năm", desc: "Cấu hình tên miền SSL, proxy ngược và bảo trì server." }
      ]
    },
    {
      category: "UI/UX Figma Design",
      icon: Cpu,
      color: "from-amber-500 to-orange-500",
      desc: "Nghiên cứu hành trình người dùng và thiết kế giao diện đồ họa độc bản chuẩn tương tác.",
      skills: [
        { name: "Figma UI/UX Design", level: 92, exp: "5 năm", desc: "Thiết kế wireframes, components và prototypes có tương tác." },
        { name: "Design System Architecture", level: 88, exp: "3 năm", desc: "Quản lý bảng màu sắc, kích thước chữ, khoảng cách đồng bộ." },
        { name: "User Persona & Wireframing", level: 85, exp: "4 năm", desc: "Khảo sát và phác thảo sơ đồ bố cục trang tối ưu trải nghiệm." }
      ]
    },
    {
      category: "AI Integrations & SEO Audit",
      icon: Sparkles,
      color: "from-cyan-500 to-sky-500",
      desc: "Tích hợp trí tuệ nhân tạo và kiểm định tiêu chuẩn hiển thị tìm kiếm của Google.",
      skills: [
        { name: "OpenAI API Integration", level: 88, exp: "2 năm", desc: "Lập trình Chatbot tư vấn khách hàng và tự sinh bài viết chuẩn SEO." },
        { name: "Lighthouse Performance Audit", level: 92, exp: "4 năm", desc: "Kiểm tra tối ưu Core Web Vitals của Next.js đạt điểm xanh." },
        { name: "Google Structured Schema (JSON-LD)", level: 90, exp: "4 năm", desc: "Cấu trúc dữ liệu giúp Google hiển thị Rich Snippets sao xếp hạng." }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#030014] text-gray-200 flex flex-col">
      <Header />

      <main className="grow pt-28 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Ambient Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none select-none z-0" />
        
        {/* Glow decorations */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 space-y-10">
          <Breadcrumbs items={[{ label: "Năng lực công nghệ", href: "/ky-nang" }]} />

          {/* Heading */}
          <div className="text-left space-y-4 max-w-3xl">
            <span className="text-[10px] text-pink-500 font-mono font-bold tracking-widest uppercase block">Technical Expertise</span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-none">
              Năng lực công nghệ & <br className="hidden md:inline" />
              <GradientText>Kỹ năng lập trình chuyên sâu</GradientText>
            </h1>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed">
              Tổng hợp bộ kỹ năng, kinh nghiệm thực chiến và mức độ làm chủ công nghệ được chia chi tiết theo từng mảng chuyên môn trong quy trình phát triển sản phẩm số.
            </p>
          </div>

          {/* Skills detailed groups */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {skillGroups.map((group, gIdx) => {
              const Icon = group.icon;
              return (
                <GlassCard 
                  key={gIdx} 
                  className="p-6 md:p-8 border-white/5 bg-[#0a0822]/60 hover:border-pink-500/25 transition-all duration-300 rounded-2xl flex flex-col justify-between space-y-6"
                >
                  <div className="space-y-4 text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-white leading-tight">
                          {group.category}
                        </h2>
                      </div>
                    </div>

                    <p className="text-gray-400 text-xs md:text-sm leading-relaxed border-b border-white/5 pb-4">
                      {group.desc}
                    </p>

                    {/* Skill progress bars list */}
                    <div className="space-y-4">
                      {group.skills.map((skill, sIdx) => (
                        <div key={sIdx} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-white flex items-center gap-1.5">
                              <span>{skill.name}</span>
                              <span className="text-[9px] text-gray-500 font-normal font-mono">({skill.exp})</span>
                            </span>
                            <span className="text-pink-400">{skill.level}%</span>
                          </div>
                          
                          {/* Progress bar */}
                          <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                            <div 
                              className="h-full bg-gradient-to-r from-pink-500 to-purple-600 rounded-full"
                              style={{ width: `${skill.level}%` }}
                            />
                          </div>

                          <p className="text-[10px] text-gray-500 leading-normal">
                            {skill.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>

          {/* Verification Box */}
          <GlassCard className="p-8 border-white/5 bg-[#0a0822]/60 text-left md:flex justify-between items-center gap-8 rounded-2xl border border-pink-500/10">
            <div className="space-y-2 max-w-xl">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-400" />
                <span>Năng lực thực chiến được kiểm chứng</span>
              </h3>
              <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
                Mọi công nghệ và mức độ kỹ năng nêu trên đều được phản ánh trực tiếp qua các sản phẩm mã nguồn số tôi đang bán và các dự án thiết kế hoàn thiện.
              </p>
            </div>
            <div className="mt-4 md:mt-0 shrink-0">
              <Link href="/du-an">
                <Button className="bg-pink-600 hover:bg-pink-500 font-bold flex items-center gap-2">
                  <span>Kiểm chứng qua các dự án</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </GlassCard>
        </div>
      </main>

      <Footer />
    </div>
  );
}
