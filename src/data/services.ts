import { Layout, Globe, Target, ShoppingBag, BarChart3, Zap, Code } from "lucide-react";

export interface ServiceItem {
  id: string;
  titleVi: string;
  titleEn: string;
  descVi: string;
  descEn: string;
  icon: any;
}

export const services: ServiceItem[] = [
  {
    id: "ui-ux",
    titleVi: "Thiết kế UI/UX Website",
    titleEn: "UI/UX Design",
    descVi: "Thiết kế giao diện hiện đại, đẹp mắt, tối ưu trải nghiệm người dùng tối đa.",
    descEn: "Modern, stunning interface design optimized for maximum user experience.",
    icon: Layout,
  },
  {
    id: "web-corp",
    titleVi: "Lập trình Website Doanh nghiệp",
    titleEn: "Corporate Website Development",
    descVi: "Website chuẩn SEO, bảo mật, hiệu năng cao, dễ dàng quản trị nội dung.",
    descEn: "SEO-friendly, secure, high-performance website with easy content management.",
    icon: Globe,
  },
  {
    id: "landing-page",
    titleVi: "Landing Page Chuyển đổi cao",
    titleEn: "High-Converting Landing Page",
    descVi: "Thiết kế landing page tối ưu tỷ lệ chuyển đổi và mang lại doanh số hiệu quả.",
    descEn: "Optimize conversion rates and drive revenue effectively with premium landers.",
    icon: Target,
  },
  {
    id: "ecommerce",
    titleVi: "Website TMĐT E-commerce",
    titleEn: "E-commerce System",
    descVi: "Xây dựng website bán hàng chuyên nghiệp, đầy đủ tính năng thanh toán, giỏ hàng.",
    descEn: "Build professional e-commerce websites with full cart and checkout flows.",
    icon: ShoppingBag,
  },
  {
    id: "dashboard",
    titleVi: "Dashboard / Admin System",
    titleEn: "Admin & Dashboard Systems",
    descVi: "Hệ thống quản trị mạnh mẽ, dễ sử dụng, thiết kế trực quan và chi tiết.",
    descEn: "Powerful management panel, intuitive layout, and extensive data tracking.",
    icon: BarChart3,
  },
  {
    id: "seo-speed",
    titleVi: "Tối ưu SEO / Performance",
    titleEn: "SEO & Speed Optimization",
    descVi: "Tối ưu tốc độ, SEO onpage, Core Web Vitals, đạt điểm tối đa trên Lighthouse.",
    descEn: "Optimize loading speed, Core Web Vitals, and onpage SEO for maximum Lighthouse score.",
    icon: Zap,
  },
  {
    id: "templates",
    titleVi: "Bán source code / Template",
    titleEn: "Source Code & Templates Shop",
    descVi: "Source code chất lượng cao, dễ tùy biến, cập nhật liên tục các công nghệ mới.",
    descEn: "High-quality, customizable codebases and themes using modern technologies.",
    icon: Code,
  },
];
