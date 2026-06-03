import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import GlassCard from "@/components/ui/GlassCard";
import GradientText from "@/components/ui/GradientText";
import Button from "@/components/ui/Button";
import { Layout, Globe, Target, ShoppingBag, BarChart3, Zap, Code, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { createMetadata, JsonLd } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Dịch vụ thiết kế UI/UX & lập trình website",
  description: "Cung cấp giải pháp trọn gói thiết kế giao diện Figma chuyên sâu, lập trình website doanh nghiệp Next.js, xây dựng hệ thống e-commerce, admin dashboard và tối ưu Core Web Vitals chuẩn SEO.",
  path: "/dich-vu",
  keywords: ["dịch vụ thiết kế website", "lập trình web", "UI/UX design", "Dịch vụ thiết kế UI/UX", "Lập trình web Next.js", "Thiết kế Landing Page", "Dịch vụ tối ưu SEO"],
});

export default function ServicesPage() {
  const serviceDetails = [
    {
      id: "ui-ux",
      title: "Thiết kế UI/UX Chuyên Sâu",
      subtitle: "UI/UX Design & Prototyping",
      icon: Layout,
      color: "from-pink-500 to-rose-500",
      desc: "Xây dựng các bản vẽ giao diện tinh tế, hiện đại từ Wireframe, Mockup đến Prototype có tương tác cao. Tập trung tối ưu trải nghiệm chạm, vuốt và luồng hành vi của khách hàng mục tiêu.",
      features: [
        "Thiết kế giao diện Pixel-Perfect trên Figma",
        "Xây dựng Design System & Component Tokens đồng bộ",
        "Thiết kế Responsive chuẩn thiết bị Mobile, Tablet, Desktop",
        "Nghiên cứu hành vi người dùng (User Persona & Journey Map)"
      ],
      techs: ["Figma", "Adobe CC", "Principle", "Framer"],
      price: "Từ 5.000.000 VNĐ",
      duration: "5 - 10 ngày làm việc"
    },
    {
      id: "web-corp",
      title: "Lập trình Website Doanh nghiệp",
      subtitle: "Corporate Website Development",
      icon: Globe,
      color: "from-blue-500 to-indigo-500",
      desc: "Xây dựng trang web giới thiệu công ty, dịch vụ chuyên nghiệp, chuẩn SEO, bảo mật cao. Giao diện sang trọng, tốc độ phản hồi tức thì, hỗ trợ quản trị nội dung (CMS) dễ dàng.",
      features: [
        "Lập trình Next.js App Router hiệu năng cực đỉnh",
        "Tích hợp công cụ quản trị (Prisma + PostgreSQL / Strapi)",
        "Tối ưu SEO On-page chuyên sâu (Meta tags, Sitemaps, JSON-LD)",
        "Đồng bộ liên hệ với Telegram Bot / Email thông báo tự động"
      ],
      techs: ["Next.js 16", "React 19", "Tailwind CSS v4", "PostgreSQL"],
      price: "Từ 15.000.000 VNĐ",
      duration: "10 - 20 ngày làm việc"
    },
    {
      id: "landing-page",
      title: "Landing Page Tối Ưu Chuyển Đổi",
      subtitle: "High-Converting Landing Page",
      icon: Target,
      color: "from-emerald-500 to-teal-500",
      desc: "Thiết kế và lập trình các trang đích quảng cáo sản phẩm, dịch vụ chuyên nghiệp. Áp dụng các quy tắc tâm lý học UX, nút kêu gọi hành động (CTA) kích thích chuyển đổi tối đa.",
      features: [
        "Giao diện Landing Page độc bản thu hút từ cái nhìn đầu tiên",
        "Tích hợp Form thu thập leads và giỏ hàng thanh toán nhanh",
        "Tốc độ tải trang siêu tốc < 1 giây tăng hiệu quả Ads",
        "Kết nối tự động với Google Sheets, Gmail, CRM quản trị"
      ],
      techs: ["HTML5 / CSS3", "Tailwind CSS v4", "Next.js", "Framer Motion"],
      price: "Từ 6.000.000 VNĐ",
      duration: "3 - 7 ngày làm việc"
    },
    {
      id: "ecommerce",
      title: "Hệ thống TMĐT & Bán Hàng Số",
      subtitle: "E-commerce System",
      icon: ShoppingBag,
      color: "from-purple-500 to-pink-500",
      desc: "Thiết kế website bán hàng cao cấp, hệ thống phân phối mã nguồn/tài liệu tự động. Tích hợp thanh toán QR Code tự động nhận diện giao dịch ngân hàng thời gian thực.",
      features: [
        "Giỏ hàng, trang thanh toán tối giản, bảo mật SSL",
        "Hệ thống SePay Webhook đối soát tự động khớp mã VietQR",
        "Hệ thống phân phối link tải file tự động sau khi thanh toán",
        "Dashboard thống kê doanh thu, đơn hàng, biểu đồ tăng trưởng"
      ],
      techs: ["Next.js", "NextAuth v5", "Prisma", "SePay Webhook"],
      price: "Từ 25.000.000 VNĐ",
      duration: "20 - 45 ngày làm việc"
    },
    {
      id: "dashboard",
      title: "Dashboard & Phần mềm Quản trị",
      subtitle: "Admin Panel & SaaS Systems",
      icon: BarChart3,
      color: "from-amber-500 to-orange-500",
      desc: "Xây dựng hệ thống quản trị dữ liệu lớn, bảng phân tích số liệu đồ họa, quản lý khách hàng, công việc và hệ thống chat trực tuyến.",
      features: [
        "Quản lý phân quyền người dùng nâng cao (RBAC - Admin/User)",
        "Biểu đồ thống kê dữ liệu trực quan bằng Recharts / ChartJS",
        "Hệ thống Chat trực tiếp kết nối với khách hàng thời gian thực",
        "Công cụ AI tự sinh bài viết SEO và xếp lịch bài viết tự động"
      ],
      techs: ["Next.js 16", "Socket.io / WebSocket", "Recharts", "OpenAI API"],
      price: "Liên hệ tư vấn",
      duration: "30 - 60 ngày làm việc"
    },
    {
      id: "seo-speed",
      title: "Tối ưu SEO & Tăng Tốc Website",
      subtitle: "SEO & Speed Audit & Optimization",
      icon: Zap,
      color: "from-cyan-500 to-sky-500",
      desc: "Nhận tối ưu hóa mã nguồn hiện có, cấu trúc lại sitemap, robots, schema markup và cải thiện điểm số Core Web Vitals trên Google Lighthouse đạt chuẩn xanh.",
      features: [
        "Nén ảnh tự động WebP/AVIF và cấu trúc lại tài nguyên chặn render",
        "Cài đặt JSON-LD Rich Snippet (Product, Breadcrumb, FAQ)",
        "Xóa bỏ các mã JavaScript thừa, tối ưu CSS Tailwind v4",
        "Đạt điểm số 95+ trên Google PageSpeed Insights"
      ],
      techs: ["Lighthouse", "Web Vitals Audit", "Sharp Image Optimizer"],
      price: "Từ 4.000.000 VNĐ",
      duration: "3 - 5 ngày làm việc"
    }
  ];

  // Schema.org Services list metadata
  const servicesSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "numberOfItems": serviceDetails.length,
    "itemListElement": serviceDetails.map((service, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Service",
        "name": service.title,
        "description": service.desc,
        "provider": {
          "@type": "Person",
          "name": "Nguyễn Văn Cường",
          "url": "https://cuongdesign.com"
        }
      }
    }))
  };

  return (
    <div className="min-h-screen bg-[#030014] text-gray-200 flex flex-col">
      {/* Inject Structured Data */}
      <JsonLd data={servicesSchema} />

      <Header />

      <main className="grow pt-28 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Ambient Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none select-none z-0" />
        
        {/* Glow decorations */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 space-y-10">
          <Breadcrumbs items={[{ label: "Dịch vụ của tôi", href: "/dich-vu" }]} />

          {/* Heading */}
          <div className="text-left space-y-4 max-w-3xl">
            <span className="text-[10px] text-pink-500 font-mono font-bold tracking-widest uppercase block">My Services & Packages</span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-none">
              Dịch vụ thiết kế & <br className="hidden md:inline" />
              <GradientText>Lập trình web chuyên nghiệp</GradientText>
            </h1>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed">
              Các giải pháp tối ưu chuyển đổi số, thiết kế và phát triển trang web cao cấp giúp doanh nghiệp hoặc thương hiệu cá nhân của bạn nổi bật và phát triển vượt bậc trên môi trường Internet.
            </p>
          </div>

          {/* Detailed Services list */}
          <div className="grid grid-cols-1 gap-10">
            {serviceDetails.map((service, index) => {
              const Icon = service.icon;
              return (
                <GlassCard 
                  key={service.id} 
                  className="p-8 md:p-10 border-white/5 bg-[#0a0822]/60 hover:border-pink-500/25 transition-all duration-300 rounded-2xl relative overflow-hidden"
                >
                  {/* Decorative background glow per card */}
                  <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-pink-500/5 to-transparent rounded-full blur-3xl pointer-events-none`} />

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
                    
                    {/* Left content: Title & Icon (7 cols) */}
                    <div className="lg:col-span-7 space-y-4 text-left">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 shrink-0 shadow-inner">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h2 className="text-xl md:text-2xl font-bold text-white leading-tight">
                            {service.title}
                          </h2>
                          <span className="text-[10px] text-gray-500 font-mono tracking-wider block uppercase mt-0.5">
                            {service.subtitle}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-400 text-sm md:text-base leading-relaxed pt-2">
                        {service.desc}
                      </p>

                      {/* Key features checklist */}
                      <div className="pt-4 space-y-2.5">
                        <h4 className="text-xs font-extrabold text-white tracking-widest uppercase text-gray-400 mb-3">Tính năng cốt lõi / Core features</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {service.features.map((feat, fIdx) => (
                            <div key={fIdx} className="flex items-start gap-2.5 text-xs text-gray-300">
                              <CheckCircle2 className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right content: Pricing, Timeline, Techs (5 cols) */}
                    <div className="lg:col-span-5 bg-[#07051a]/60 border border-white/5 p-6 rounded-xl flex flex-col justify-between space-y-6 text-left">
                      <div className="space-y-4">
                        {/* Price box */}
                        <div className="flex justify-between items-baseline">
                          <span className="text-xs text-gray-500 font-mono uppercase">Chi phí ước tính / Price:</span>
                          <span className="text-lg font-bold text-pink-400">{service.price}</span>
                        </div>
                        {/* Duration box */}
                        <div className="flex justify-between items-baseline border-t border-white/5 pt-3">
                          <span className="text-xs text-gray-500 font-mono uppercase">Thời gian bàn giao / Time:</span>
                          <span className="text-xs font-semibold text-white">{service.duration}</span>
                        </div>
                        {/* Technologies badges */}
                        <div className="border-t border-white/5 pt-3 space-y-2">
                          <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block">Công nghệ & Công cụ chính / Tech Stack:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {service.techs.map((tech) => (
                              <span key={tech} className="text-[10px] bg-white/5 border border-white/10 rounded-md px-2 py-0.5 text-gray-300 font-mono">
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/5">
                        <Link href="/lien-he">
                          <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold flex items-center justify-center gap-2">
                            <span>Yêu cầu báo giá dịch vụ</span>
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>

                  </div>
                </GlassCard>
              );
            })}
          </div>

          {/* Bottom Call to Action */}
          <GlassCard className="p-8 border-white/5 bg-[#0a0822]/60 text-center space-y-6 max-w-3xl mx-auto rounded-2xl border border-pink-500/10">
            <h3 className="text-xl md:text-2xl font-bold text-white">Bạn cần giải pháp thiết kế riêng biệt?</h3>
            <p className="text-gray-400 text-sm max-w-lg mx-auto">
              Hãy gửi cho tôi mô tả dự án và mục tiêu doanh nghiệp của bạn. Tôi sẽ liên hệ tư vấn trực tiếp và đề xuất giải pháp công nghệ phù hợp nhất.
            </p>
            <div>
              <Link href="/lien-he">
                <Button className="bg-pink-600 hover:bg-pink-500 px-8 font-bold">
                  Khởi động dự án của bạn ngay
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
