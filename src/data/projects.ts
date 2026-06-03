export interface ProjectItem {
  id: string;
  title: string;
  slug: string;
  descriptionVi: string;
  descriptionEn: string;
  coverImage: string;
  techStack: string[];
  category: string;
  demoUrl?: string;
  githubUrl?: string;
}

export const projects: ProjectItem[] = [
  {
    id: "saigoncare",
    title: "SaigonCare Web App",
    slug: "saigoncare-web-app",
    descriptionVi: "Web ứng dụng chăm sóc sức khỏe trực tuyến & quản lý phòng khám chuyên nghiệp.",
    descriptionEn: "Online healthcare app & clinic management platform with calendar scheduling.",
    coverImage: "/images/projects/saigoncare.jpg",
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "Prisma", "PostgreSQL"],
    category: "Web Application",
    demoUrl: "https://demo.saigoncare.vn",
  },
  {
    id: "minhstore",
    title: "Minh Store",
    slug: "minh-store",
    descriptionVi: "Website bán hàng thời trang hiện đại, tối ưu SEO, tích hợp cổng thanh toán.",
    descriptionEn: "Modern fashion e-commerce storefront with SEO optimization and payment gateways.",
    coverImage: "/images/projects/minhstore.jpg",
    techStack: ["Laravel", "MySQL", "Bootstrap", "jQuery"],
    category: "E-commerce",
    demoUrl: "https://demo.minhstore.vn",
  },
  {
    id: "technova",
    title: "TechNova Solutions",
    slug: "technova-solutions",
    descriptionVi: "Website giới thiệu công ty công nghệ, chuẩn SEO, thiết kế layout sang trọng.",
    descriptionEn: "Corporate website for a tech solutions firm with sleek animations and on-page SEO.",
    coverImage: "/images/projects/technova.jpg",
    techStack: ["Next.js", "Tailwind CSS", "Framer Motion"],
    category: "Corporate Website",
    demoUrl: "https://demo.technova.vn",
  },
  {
    id: "sales-dashboard",
    title: "Sales Dashboard Pro",
    slug: "sales-dashboard-pro",
    descriptionVi: "Dashboard doanh thu & phân tích dữ liệu kinh doanh trực quan, thời gian thực.",
    descriptionEn: "Advanced analytics workspace featuring real-time transaction graphs and reports.",
    coverImage: "/images/projects/dashboard.jpg",
    techStack: ["React", "Recharts", "Tailwind CSS"],
    category: "Dashboard / Admin System",
    demoUrl: "https://demo.dashboard.vn",
  },
  {
    id: "crypto-landing",
    title: "Crypto ICO Landing",
    slug: "crypto-ico-landing",
    descriptionVi: "Landing page kêu gọi ICO tiền điện tử với hiệu ứng 3D & cuộn trang mượt mà.",
    descriptionEn: "Immersive landing page for a web3 project with interactive scrolling effects.",
    coverImage: "/images/projects/crypto.jpg",
    techStack: ["Next.js", "Tailwind CSS", "GSAP", "Lenis"],
    category: "Landing Page",
    demoUrl: "https://demo.cryptolander.vn",
  },
  {
    id: "eduhub",
    title: "EduHub Platform",
    slug: "eduhub-platform",
    descriptionVi: "Nền tảng đào tạo trực tuyến, tích hợp video học tập, bài tập & thi cử tự động.",
    descriptionEn: "Comprehensive LMS containing course video streaming, quiz system, and certification.",
    coverImage: "/images/projects/eduhub.jpg",
    techStack: ["Vue.js", "Laravel", "MySQL", "Tailwind CSS"],
    category: "Web Application",
    demoUrl: "https://demo.eduhub.vn",
  },
];
