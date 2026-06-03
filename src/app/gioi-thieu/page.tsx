import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import GlassCard from "@/components/ui/GlassCard";
import GradientText from "@/components/ui/GradientText";
import Button from "@/components/ui/Button";
import { User, Calendar, Briefcase, Award, ArrowRight, ShieldCheck, Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Giới thiệu bản thân - Cường Design | Senior Solution Architect & Fullstack Web Developer",
  description: "Tìm hiểu tiểu sử, kỹ năng, kinh nghiệm và hành trình lập trình của Cường Design. Chuyên thiết kế UI/UX Figma và lập trình web Next.js, React, Node.js.",
  keywords: ["Giới thiệu Cường Design", "Hồ sơ Cường Design", "Kỹ năng lập trình", "Senior Fullstack Developer Việt Nam"],
};

export default function AboutPage() {
  // Schema.org Person & AboutPage Structured Metadata
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "mainEntity": {
      "@type": "Person",
      "name": "Nguyễn Văn Cường",
      "alternateName": "Cường Design / Cuong Design",
      "jobTitle": "Senior Fullstack Web Developer & UI/UX Architect",
      "worksFor": {
        "@type": "Organization",
        "name": "Freelancer",
      },
      "url": "https://cuongdesign.com",
      "sameAs": [
        "https://github.com/cuongdesign",
        "https://linkedin.com/in/cuongdesign"
      ],
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Hà Nội",
        "addressCountry": "Việt Nam",
      },
      "knowsAbout": [
        "ReactJS", "NextJS", "NodeJS", "UI/UX Design", "Figma", "Prisma ORM", "Docker", "SEO Optimization"
      ],
    }
  };

  const careerTimeline = [
    {
      period: "2024 - Hiện tại",
      role: "Freelance Solution Architect & Fullstack Engineer",
      company: "Tự do (Thương hiệu cá nhân Cuong Design)",
      desc: "Chuyên tư vấn kiến trúc công nghệ, lập trình web landing page premium, dashboard e-commerce phức tạp và tích hợp tự động hóa thanh toán cho đối tác trong và ngoài nước.",
    },
    {
      period: "2022 - 2024",
      role: "Lead Front-end Developer",
      company: "Tech Solution Corp",
      desc: "Dẫn dắt đội ngũ 6 lập trình viên phát triển nền tảng quản trị thông minh, tối ưu hiệu năng tốc độ tải trang Core Web Vitals của Next.js tăng 40%, áp dụng Tailwind CSS thiết lập Design Tokens toàn hệ thống.",
    },
    {
      period: "2020 - 2022",
      role: "Fullstack Web Developer",
      company: "Global Software Outsource",
      desc: "Xây dựng các RESTful API bảo mật bằng Node.js (Express/NestJS) kết hợp PostgreSQL, quản lý cơ sở dữ liệu và triển khai CI/CD hệ thống qua Docker container.",
    },
    {
      period: "2018 - 2020",
      role: "UI/UX Designer & Frontend Engineer",
      company: "Creative Digital Agency",
      desc: "Thiết kế wireframes và prototypes độ trung thực cao trên Figma, đồng thời chuyển đổi trực tiếp các thiết kế pixel-perfect thành mã nguồn HTML/JS responsive.",
    },
  ];

  const skillCategories = [
    {
      title: "Frontend Engineering",
      skills: [
        { name: "React / Next.js (App Router)", level: 95 },
        { name: "Tailwind CSS v4 / Vanilla CSS", level: 92 },
        { name: "TypeScript / JavaScript ES6", level: 90 },
        { name: "Framer Motion / GSAP (Animations)", level: 88 },
      ],
    },
    {
      title: "Backend & Systems",
      skills: [
        { name: "Node.js (Express, NestJS)", level: 85 },
        { name: "Prisma ORM / PostgreSQL / MySQL", level: 88 },
        { name: "Restful API / Graphql REST APIs", level: 90 },
        { name: "Docker / Nginx / Docker Compose", level: 80 },
      ],
    },
    {
      title: "UI/UX & Product Design",
      skills: [
        { name: "Figma (Wireframing, Prototyping)", level: 92 },
        { name: "Design System Architecture", level: 88 },
        { name: "SEO / Semantic HTML Audit", level: 90 },
        { name: "User Research & Usability Testing", level: 82 },
      ],
    },
  ];

  const credentials = [
    { title: "Chứng chỉ AWS Certified Solutions Architect", organization: "Amazon Web Services (AWS)", date: "2024" },
    { title: "Advanced User Experience Design", organization: "Interaction Design Foundation (IxDF)", date: "2023" },
    { title: "Chứng nhận Fullstack Web Master", organization: "FPT Aptech Vietnam", date: "2020" },
  ];

  return (
    <div className="min-h-screen bg-[#030014] text-gray-200 flex flex-col">
      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />

      <Header />

      <main className="grow py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Ambient grids */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none select-none z-0" />
        
        {/* Glow decorations */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10 space-y-10 mt-8">
          {/* Breadcrumb Trail */}
          <Breadcrumbs items={[{ label: "Giới thiệu bản thân", href: "/gioi-thieu" }]} />

          {/* Profile Header section */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Bio Card - Left (4 cols) */}
            <div className="md:col-span-4 flex flex-col items-center">
              <GlassCard className="p-6 border-white/5 bg-[#0a0822]/80 text-center space-y-4 w-full">
                <div className="relative w-32 h-32 rounded-full mx-auto border-2 border-pink-500/30 p-1 bg-black/40 overflow-hidden">
                  <div className="w-full h-full rounded-full bg-gradient-to-tr from-pink-500/20 to-purple-600/30 flex items-center justify-center font-bold text-pink-400 text-3xl font-mono">
                    CD
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Cường Design</h2>
                  <span className="text-[10px] text-gray-500 font-mono tracking-widest block uppercase mt-0.5">Solution Architect</span>
                </div>
                
                <div className="space-y-2 border-t border-white/5 pt-4 text-left text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                    <span className="truncate">contact@cuongdesign.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    <span>+84 987 654 321</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                    <span>Hà Nội, Việt Nam</span>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Biography details - Right (8 cols) */}
            <div className="md:col-span-8 space-y-4 text-left">
              <span className="text-[10px] text-pink-500 font-mono font-bold tracking-widest uppercase block">Chào mừng bạn đến với hồ sơ của tôi</span>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-none">
                Tôi kiến tạo <GradientText>sản phẩm số</GradientText> hiệu năng vượt trội.
              </h1>
              
              <div className="text-sm md:text-base text-gray-400 space-y-4 leading-relaxed font-sans">
                <p>
                  Tôi tên đầy đủ là <strong>Nguyễn Văn Cường</strong>, được cộng đồng biết đến nhiều hơn dưới nghệ danh <strong>Cường Design</strong> hoặc <strong>Cường Design</strong>. 
                  Với hơn 6 năm tích lũy kinh nghiệm trong lĩnh vực thiết kế giao diện UI/UX và lập trình Fullstack, mục tiêu của tôi là xóa nhòa ranh giới giữa bản vẽ thiết kế Figma và mã nguồn chạy thực tế.
                </p>
                <p>
                  Tôi tin rằng một website xuất sắc không chỉ nằm ở vẻ ngoài lộng lẫy (Premium visual aesthetics) mà còn phải cực kỳ tối ưu về mặt trải nghiệm mượt mà, cấu trúc SEO chuẩn chỉnh và khả năng tự động hóa thanh toán. 
                  Mọi dự án tôi làm đều được áp dụng quy trình kiểm soát nghiêm ngặt, sử dụng những công nghệ hiện đại nhất như Next.js, React, Node.js, Prisma, PostgreSQL và Docker.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap gap-3">
                <Link href="/#contact">
                  <Button className="bg-pink-600 hover:bg-pink-500 text-white font-bold flex items-center gap-1.5 px-6">
                    <span>Liên hệ hợp tác</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/#products">
                  <Button variant="outline" className="px-6 font-semibold">
                    Xem source code của tôi
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* Skill matrices (Radar alternate: Grid of indicators) */}
          <section className="space-y-6">
            <div className="text-left">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-pink-500" />
                <span>Năng lực cốt lõi (Skill Matrix)</span>
              </h3>
              <p className="text-xs text-gray-500 mt-1">Đánh giá độ thành thạo và chuyên sâu trên thang điểm 100%.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {skillCategories.map((category, idx) => (
                <GlassCard key={idx} className="p-6 border-white/5 bg-[#0a0822]/60 space-y-4 text-left">
                  <h4 className="text-sm font-extrabold text-pink-400 tracking-wider font-mono border-b border-white/5 pb-2">
                    {category.title}
                  </h4>
                  <div className="space-y-4">
                    {category.skills.map((skill, sIdx) => (
                      <div key={sIdx} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-white">{skill.name}</span>
                          <span className="text-pink-400">{skill.level}%</span>
                        </div>
                        {/* Custom Bar progress indicator */}
                        <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                          <div 
                            className="h-full bg-gradient-to-r from-pink-500 to-purple-600 rounded-full"
                            style={{ width: `${skill.level}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              ))}
            </div>
          </section>

          {/* Career Journey Timeline */}
          <section className="space-y-6">
            <div className="text-left">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-purple-500" />
                <span>Hành trình sự nghiệp (Timeline)</span>
              </h3>
              <p className="text-xs text-gray-500 mt-1">Các cột mốc quan trọng trong quá trình học hỏi và cống hiến.</p>
            </div>

            <GlassCard className="p-6 md:p-8 border-white/5 bg-[#0a0822]/60 text-left relative">
              <div className="absolute left-6 md:left-[172px] top-8 bottom-8 w-[1px] bg-white/5 pointer-events-none" />
              <div className="space-y-8">
                {careerTimeline.map((item, idx) => (
                  <div key={idx} className="relative flex flex-col md:flex-row gap-2 md:gap-8 pl-8 md:pl-0">
                    {/* Time dot & year */}
                    <div className="md:w-36 flex items-center md:justify-end text-left md:text-right shrink-0">
                      <span className="text-xs font-bold font-mono text-pink-400">{item.period}</span>
                    </div>

                    {/* Glowing point indicator */}
                    <div className="absolute left-[3px] md:left-[169px] top-1.5 w-2 h-2 rounded-full bg-pink-500 ring-4 ring-pink-500/20 z-10 shrink-0" />

                    {/* Role description */}
                    <div className="grow space-y-1">
                      <h4 className="text-sm md:text-base font-bold text-white leading-snug">{item.role}</h4>
                      <span className="text-[10px] text-gray-500 font-medium block uppercase tracking-wide">{item.company}</span>
                      <p className="text-xs md:text-sm text-gray-400 leading-normal mt-2">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </section>

          {/* Certificates and accomplishments */}
          <section className="space-y-6">
            <div className="text-left">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-pink-500" />
                <span>Chứng chỉ & Thành tựu</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {credentials.map((cred, idx) => (
                <GlassCard key={idx} className="p-5 border-white/5 bg-[#0a0822]/60 flex gap-4 text-left items-start">
                  <div className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Award className="w-4.5 h-4.5 text-pink-400" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-white leading-normal">{cred.title}</h4>
                    <span className="text-[10px] text-gray-500 font-medium block">{cred.organization}</span>
                    <span className="text-[9px] text-gray-600 block mt-1">Năm hoàn tất: {cred.date}</span>
                  </div>
                </GlassCard>
              ))}
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
