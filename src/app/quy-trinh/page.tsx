import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import GlassCard from "@/components/ui/GlassCard";
import GradientText from "@/components/ui/GradientText";
import Button from "@/components/ui/Button";
import { MessageSquare, Layout, Paintbrush, Cpu, CheckCircle2, ShieldAlert, ArrowRight } from "lucide-react";
import Link from "next/link";
import { createMetadata, JsonLd } from "@/lib/seo";
import { siteConfig } from "@/data/site";

export const metadata = createMetadata({
  title: "Quy trình làm việc chuyên nghiệp",
  description: "Khám phá quy trình làm việc chuẩn 6 bước tại Cường Design giúp tối giản hóa thời gian triển khai dự án, nâng cao hiệu suất SEO, bảo mật cơ sở dữ liệu và đảm bảo bàn giao sản phẩm pixel-perfect.",
  path: "/quy-trinh",
  keywords: ["Quy trình thiết kế website", "Lập trình web freelancer", "Bàn giao source code", "Quy trình thiết kế Figma"],
});

export default function ProcessPage() {
  const steps = [
    {
      id: "01",
      title: "Tiếp nhận & Nghiên cứu",
      subtitle: "Research & Discovery",
      icon: MessageSquare,
      color: "from-pink-500 to-rose-500",
      desc: "Chúng ta sẽ cùng trao đổi chi tiết về ý tưởng dự án, đối tượng khách hàng mục tiêu, các trang web đối thủ cạnh tranh và yêu cầu chức năng cụ thể của bạn. Từ đó phân tích đưa ra giải pháp kỹ thuật tốt nhất.",
      deliverables: ["Tài liệu đặc tả yêu cầu dự án (SRS)", "Bảng đề xuất giải pháp công nghệ", "Báo giá chi tiết & Kế hoạch tiến độ"],
      time: "1 - 2 ngày"
    },
    {
      id: "02",
      title: "Cấu trúc & Wireframing",
      subtitle: "Wireframes & UX Architecture",
      icon: Layout,
      color: "from-purple-500 to-indigo-500",
      desc: "Xây dựng sơ đồ trang (Sitemap) chuẩn SEO, phác thảo cấu trúc bố cục đen trắng (UX Wireframes) của các trang quan trọng để phân tích luồng hành vi người dùng, vị trí đặt nút kêu gọi hành động (CTA) hợp lý.",
      deliverables: ["UX Sitemap (Sơ đồ cấu trúc liên kết trang)", "Bản phác thảo UX Wireframes (Desktop & Mobile)", "Phân tích luồng chuyển đổi (User Flow)"],
      time: "2 - 3 ngày"
    },
    {
      id: "03",
      title: "Thiết kế UI/UX Figma",
      subtitle: "Visual Design & Prototyping",
      icon: Paintbrush,
      color: "from-blue-500 to-cyan-500",
      desc: "Tô màu cho bản vẽ, thiết kế giao diện Pixel-Perfect độc bản trên Figma. Xây dựng Design System (phong cách typography, bảng màu sắc HSL, các component nút bấm, form nhập liệu) đảm bảo tính đồng bộ nhận diện thương hiệu.",
      deliverables: ["Bản vẽ giao diện đồ họa UI hoàn chỉnh trên Figma", "Interactive Prototype (Bản demo bấm click trực quan)", "Bộ Design Token bàn giao cho lập trình viên"],
      time: "3 - 7 ngày"
    },
    {
      id: "04",
      title: "Lập trình & Phát triển",
      subtitle: "Frontend & Backend Coding",
      icon: Cpu,
      color: "from-teal-500 to-emerald-500",
      desc: "Chuyển đổi trực tiếp thiết kế Figma thành mã nguồn thực tế. Lập trình Front-end với Next.js & Tailwind CSS v4 tối ưu hiệu năng. Xây dựng các API backend, tích hợp cơ sở dữ liệu PostgreSQL qua Prisma ORM bảo mật.",
      deliverables: ["Mã nguồn website Next.js/React sạch sẽ (Clean Code)", "Hệ thống quản trị admin dashboard dễ dùng", "Cơ sở dữ liệu PostgreSQL đã được chuẩn hóa"],
      time: "7 - 15 ngày"
    },
    {
      id: "05",
      title: "Kiểm thử & Tối ưu SEO",
      subtitle: "Quality Assurance & SEO Audit",
      icon: CheckCircle2,
      color: "from-amber-500 to-orange-500",
      desc: "Chạy các bài kiểm thử lỗi, kiểm tra khả năng tương thích hiển thị Responsive trên mọi thiết bị và trình duyệt. Thực hiện tối ưu hóa SEO on-page, nén dung lượng tài nguyên và cấu hình dữ liệu cấu trúc Schema.",
      deliverables: ["Điểm số tối ưu Google Lighthouse 95+ (Core Web Vitals)", "Sơ đồ XML Sitemap & cấu hình robots.txt", "Tích hợp hoàn thiện mã Schema JSON-LD"],
      time: "2 - 3 ngày"
    },
    {
      id: "06",
      title: "Bàn giao & Hướng dẫn",
      subtitle: "Deployment & Training",
      icon: ShieldAlert,
      color: "from-rose-500 to-pink-500",
      desc: "Triển khai cài đặt website chạy chính thức trên server Cloud (Vercel, Netlify hoặc VPS Docker). Bàn giao toàn bộ mã nguồn dạng file zip. Hướng dẫn sử dụng chi tiết qua video/tài liệu.",
      deliverables: ["Website hoạt động trực tuyến chính thức", "Bàn giao mã nguồn zip đóng gói bảo mật", "Video hướng dẫn quản trị trang chi tiết"],
      time: "1 - 2 ngày"
    }
  ];

  // HowTo JSON-LD schema with steps from work process
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "Quy trình thiết kế & lập trình website chuyên nghiệp",
    "description": "Quy trình 6 bước phát triển phần mềm và thiết kế giao diện chuẩn hóa tại Cuong Design.",
    "url": `${siteConfig.url}/quy-trinh`,
    "totalTime": "P30D",
    "step": steps.map((step) => ({
      "@type": "HowToStep",
      "name": step.title,
      "text": step.desc,
      "url": `${siteConfig.url}/quy-trinh#step-${step.id}`
    }))
  };

  return (
    <div className="min-h-screen bg-[#030014] text-gray-200 flex flex-col">
      <JsonLd data={howToSchema} />
      <Header />

      <main className="grow pt-28 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none select-none z-0" />
        
        {/* Glow decorations */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10 space-y-10">
          <Breadcrumbs items={[{ label: "Quy trình làm việc", href: "/quy-trinh" }]} />

          {/* Heading */}
          <div className="text-left space-y-4 max-w-3xl">
            <span className="text-[10px] text-pink-500 font-mono font-bold tracking-widest uppercase block">Development Lifecycle</span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-none">
              Quy trình làm việc <br className="hidden md:inline" />
              <GradientText>Minh bạch & Hiệu quả</GradientText>
            </h1>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed">
              Các bước phát triển phần mềm và thiết kế giao diện được chuẩn hóa nghiêm ngặt giúp dự án của bạn hoàn thành đúng tiến độ, tiết kiệm chi phí và đạt chất lượng cao nhất.
            </p>
          </div>

          {/* Timeline steps */}
          <div className="relative border-l border-white/5 ml-4 md:ml-6 pl-8 md:pl-10 space-y-12 py-4">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="relative group text-left">
                  
                  {/* Step point indicator icon */}
                  <div className="absolute -left-[54px] md:-left-[62px] top-0.5 w-10 h-10 rounded-full bg-[#0a0822] border border-white/10 flex items-center justify-center text-pink-400 group-hover:border-pink-500/40 group-hover:scale-115 transition-all duration-300 shadow-[0_0_15px_rgba(236,72,153,0.05)]">
                    <span className="font-mono text-xs font-bold text-gray-400 group-hover:text-pink-400">
                      {step.id}
                    </span>
                  </div>

                  {/* Glass Content Card */}
                  <GlassCard className="p-6 md:p-8 border-white/5 bg-[#0a0822]/60 hover:border-pink-500/25 transition-all duration-300 rounded-2xl">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2.5 pb-4 border-b border-white/5 mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                          <Icon className="w-5 h-5 text-pink-400" />
                          <span>{step.title}</span>
                        </h2>
                        <span className="text-[10px] text-gray-500 font-mono tracking-wider uppercase block mt-0.5">
                          {step.subtitle}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs font-mono">
                        <div className="bg-white/5 border border-white/10 px-3 py-1 rounded-lg">
                          <span className="text-gray-500">Thời gian:</span> <span className="text-pink-400 font-bold">{step.time}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                      {step.desc}
                    </p>

                    {/* Step outputs (deliverables) */}
                    <div className="mt-5 pt-4 border-t border-white/5 space-y-2">
                      <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block">Sản phẩm bàn giao sau bước này / Deliverables:</span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                        {step.deliverables.map((item, dIdx) => (
                          <div key={dIdx} className="bg-black/20 border border-white/5 px-3 py-2 rounded-lg flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-pink-500 shrink-0" />
                            <span className="text-[11px] text-gray-300 leading-tight">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </GlassCard>
                </div>
              );
            })}
          </div>

          {/* Contact Box */}
          <GlassCard className="p-8 border-white/5 bg-[#0a0822]/60 text-center space-y-6 max-w-3xl mx-auto rounded-2xl border border-pink-500/10">
            <h3 className="text-xl md:text-2xl font-bold text-white">Bắt đầu thảo luận dự án của bạn</h3>
            <p className="text-gray-400 text-sm max-w-lg mx-auto">
              Tôi sẵn sàng lắng nghe mọi ý tưởng và giải quyết các bài toán công nghệ phức tạp của bạn. Quy trình làm việc sẽ bắt đầu ngay sau khi nhận được yêu cầu của bạn.
            </p>
            <div>
              <Link href="/lien-he">
                <Button className="bg-pink-600 hover:bg-pink-500 px-8 font-bold flex items-center gap-2 mx-auto">
                  <span>Liên hệ ngay với tôi</span>
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
