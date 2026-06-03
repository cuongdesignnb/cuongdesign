export interface ProductItem {
  id: string;
  title: string;
  slug: string;
  descriptionVi: string;
  descriptionEn: string;
  price: number; // 0 means Free / Contact Form
  salePrice?: number;
  coverImage: string;
  techStack: string[];
  type: "SOURCE_CODE" | "TEMPLATE" | "UI_KIT" | "SERVICE";
  demoUrl?: string;
}

export const products: ProductItem[] = [
  {
    id: "shopbase-ecommerce",
    title: "ShopBase - E-commerce",
    slug: "shopbase-ecommerce",
    descriptionVi: "Website bán hàng chuyên nghiệp đầy đủ tính năng giỏ hàng, thanh toán, quản trị sản phẩm.",
    descriptionEn: "Professional online store with full cart, checkout, and admin panel management.",
    price: 1490000,
    coverImage: "/images/products/shopbase.jpg",
    techStack: ["Laravel", "MySQL", "Tailwind CSS"],
    type: "SOURCE_CODE",
    demoUrl: "https://shopbase.cuongdesign.com",
  },
  {
    id: "landing-page-template",
    title: "Landing Page Template",
    slug: "landing-page-template",
    descriptionVi: "Template landing page giới thiệu sản phẩm, dịch vụ tối ưu chuyển đổi, tốc độ load cực nhanh.",
    descriptionEn: "Highly optimized landing page template for converting leads and running ads.",
    price: 490000,
    coverImage: "/images/products/landingpage.jpg",
    techStack: ["Next.js", "Tailwind CSS"],
    type: "TEMPLATE",
    demoUrl: "https://landing.cuongdesign.com",
  },
  {
    id: "admin-dashboard-pro",
    title: "Admin Dashboard Pro",
    slug: "admin-dashboard-pro",
    descriptionVi: "Hệ thống quản trị doanh nghiệp đa tính năng, thống kê doanh thu, phân tích đơn hàng.",
    descriptionEn: "Comprehensive analytics portal featuring revenue tracking and user management.",
    price: 1190000,
    coverImage: "/images/products/dashboard.jpg",
    techStack: ["React", "Tailwind CSS", "Recharts"],
    type: "SOURCE_CODE",
    demoUrl: "https://admin.cuongdesign.com",
  },
  {
    id: "corporate-website",
    title: "Corporate Website Premium",
    slug: "corporate-website-premium",
    descriptionVi: "Website giới thiệu doanh nghiệp cao cấp, chuẩn SEO, hỗ trợ đa ngôn ngữ, load nhanh.",
    descriptionEn: "Multilingual premium company presentation template optimized for Core Web Vitals.",
    price: 990000,
    coverImage: "/images/products/corporate.jpg",
    techStack: ["Next.js", "Tailwind CSS"],
    type: "TEMPLATE",
    demoUrl: "https://corp.cuongdesign.com",
  },
  {
    id: "laravel-source-pack",
    title: "Laravel Source Pack",
    slug: "laravel-source-pack",
    descriptionVi: "Bộ mã nguồn mẫu Laravel chuẩn cấu trúc, cài đặt sẵn auth, roles, API utilities.",
    descriptionEn: "Solid Laravel base repository with configured authentication, roles, and API tools.",
    price: 390000,
    coverImage: "/images/products/laravel-pack.jpg",
    techStack: ["Laravel", "PHP", "MySQL"],
    type: "SOURCE_CODE",
    demoUrl: "https://github.com/cuongdesign/laravel-pack",
  },
  {
    id: "react-ui-kit-pro",
    title: "React UI Kit Pro",
    slug: "react-ui-kit-pro",
    descriptionVi: "Bộ component React cao cấp xây dựng bằng Tailwind, sẵn sàng copy-paste cho dự án.",
    descriptionEn: "Premium pre-styled React Tailwind components ready for copy-paste development.",
    price: 0, // Free - Requires contact form registration!
    coverImage: "/images/products/uikit.jpg",
    techStack: ["React", "Tailwind CSS", "Framer Motion"],
    type: "UI_KIT",
    demoUrl: "https://uikit.cuongdesign.com",
  },
];
