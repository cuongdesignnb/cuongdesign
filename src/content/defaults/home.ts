import { techStack } from "@/data/techStack";

export const homeContentDefaults = {
  hero: {
    badge: "Freelancer Developer",
    available: true,
    availableText: "Available for work",
    headlinePrefix: "Freelancer Developer tạo ra website đẹp, nhanh,",
    headlineHighlight: "tối ưu chuyển đổi",
    headlineSuffix: "",
    subtitle: "Modern websites, web apps and digital products that convert.",
    description:
      "<p>Tôi chuyên thiết kế UI/UX hiện đại và lập trình website, web app tối ưu hiệu năng, chuẩn SEO và mang lại trải nghiệm người dùng tuyệt vời. Nhận dự án theo yêu cầu và bán source code chất lượng cao.</p>",
    primaryCta: {
      label: "Xem dự án / View Projects",
      url: "#projects",
      iconKey: "Eye",
      enabled: true,
    },
    secondaryCta: {
      label: "Mua source code / Buy Source Code",
      url: "#products",
      iconKey: "ShoppingBag",
      enabled: true,
    },
    metrics: [
      { value: 50, suffix: "+", label: "Dự án hoàn thành" },
      { value: 100, suffix: "+", label: "Khách hàng hài lòng" },
      { value: 3, suffix: "+", label: "Năm kinh nghiệm" },
    ],
    developerCard: {
      filename: "developer.ts",
      name: "Cường Design",
      passion: "Clean Code",
      focus: "UI/UX, Performance, SEO",
      available: true,
    },
    lighthouseScore: 98,
    lighthouseLabel: "Lighthouse Performance",
    technologyBadge: "Next.js 16",
    heroMedia: "",
  },
  about: {
    title: "Về tôi / About Me",
    subtitle:
      "Hành trình sáng tạo giao diện và tối ưu hóa hệ thống mã nguồn kỹ thuật số.",
    profileMedia: "",
    name: "Cường Design",
    jobTitle: "Senior Fullstack Developer",
    signature: "Cường Design",
    content:
      "<p>Tôi là một Freelancer Developer đam mê công nghệ và thiết kế giao diện. Chất lượng, tốc độ và tối ưu chuyển đổi luôn là trọng tâm trong mỗi sản phẩm.</p><p>Mọi dự án đều tuân thủ nguyên tắc code sạch, chuẩn SEO, hiệu năng cao và responsive trên mọi thiết bị.</p>",
    statistics: [
      { value: 50, suffix: "+", label: "Projects Completed", description: "Dự án hoàn thành", iconKey: "Briefcase" },
      { value: 100, suffix: "+", label: "Happy Clients", description: "Khách hàng hài lòng", iconKey: "Users" },
      { value: 3, suffix: "+", label: "Years Experience", description: "Kinh nghiệm thực tế", iconKey: "Award" },
      { value: 20, suffix: "+", label: "Source Products", description: "Sản phẩm số đã bán", iconKey: "Code2" },
    ],
  },
  services: {
    title: "Dịch vụ của tôi / My Services",
    subtitle:
      "Các giải pháp thiết kế, phát triển và tối ưu hóa website chuyên sâu giúp thúc đẩy doanh số doanh nghiệp.",
    displayLimit: 6,
    selectedSlugs: [],
    ctaLabel: "Xem tất cả dịch vụ",
    ctaUrl: "/dich-vu",
  },
  projects: {
    title: "Dự án nổi bật / Featured Projects",
    subtitle: "Các sản phẩm đã được triển khai thực tế.",
    displayLimit: 6,
    ctaLabel: "Xem tất cả dự án",
    ctaUrl: "/du-an",
    emptyState: "Chưa có dự án nào được xuất bản.",
  },
  products: {
    title: "Sản phẩm số / Digital Products",
    subtitle: "Source code và template sẵn sàng triển khai.",
    displayLimit: 6,
    priceLabel: "Giá",
    ctaLabel: "Xem tất cả sản phẩm",
    ctaUrl: "/san-pham",
    emptyState: "Chưa có sản phẩm nào được xuất bản.",
  },
  process: {
    title: "Quy trình làm việc / Work Process",
    subtitle:
      "Các bước làm việc minh bạch giúp rút ngắn thời gian và đảm bảo chất lượng.",
    steps: [
      { number: "01", titleVi: "Tiếp nhận yêu cầu", titleEn: "Requirements Gathering", description: "Trao đổi chi tiết về ý tưởng dự án và tư vấn giải pháp kỹ thuật tối ưu.", iconKey: "" },
      { number: "02", titleVi: "Phân tích & Wireframe", titleEn: "Analysis & Wireframes", description: "Phân tích yêu cầu, xây dựng wireframe và lập kế hoạch chi tiết.", iconKey: "" },
      { number: "03", titleVi: "Thiết kế & Lập trình", titleEn: "Design & Development", description: "Thiết kế UI/UX và lập trình tối ưu tốc độ, tích hợp chức năng.", iconKey: "" },
      { number: "04", titleVi: "Bàn giao & Hỗ trợ", titleEn: "Deployment & Support", description: "Bàn giao source code, triển khai thực tế và hỗ trợ bảo trì.", iconKey: "" },
    ],
  },
  techStack: {
    title: "Công nghệ sử dụng / Tech Stack",
    subtitle: "Hệ sinh thái công nghệ hiện đại được lựa chọn để tối ưu hiệu năng.",
    categories: ["frontend", "backend", "database", "tools", "ai"],
    technologies: techStack.map((item, order) => ({
      name: item.name,
      category: item.category,
      iconKey: "",
      iconMedia: "",
      order,
      visible: true,
    })),
  },
  testimonials: {
    title: "Đánh giá của khách hàng / Testimonials",
    subtitle: "Những phản hồi chân thực từ các đối tác và khách hàng.",
    displayLimit: 4,
    ctaLabel: "Xem tất cả đánh giá",
    ctaUrl: "/danh-gia",
  },
  cta: {
    enabled: true,
    title: "Bạn cần một website đẹp, tối ưu và chuyên nghiệp?",
    content:
      "<p>Liên hệ ngay để được tư vấn giải pháp phù hợp hoặc lựa chọn source code sẵn sàng triển khai.</p>",
    backgroundMedia: "",
    primaryCta: { label: "Liên hệ hợp tác", url: "#contact", enabled: true },
    secondaryCta: { label: "Xem sản phẩm", url: "#products", enabled: true },
  },
  contact: {
    title: "Liên hệ / Contact",
    subtitle: "Cùng trao đổi về dự án tiếp theo của bạn.",
    intro: "Hãy để lại thông tin, tôi sẽ phản hồi sớm nhất.",
    labels: {
      name: "Họ và tên",
      email: "Email",
      phone: "Số điện thoại",
      subject: "Chủ đề",
      message: "Nội dung",
    },
    placeholders: {
      name: "Nhập họ và tên",
      email: "you@example.com",
      phone: "Số điện thoại",
      subject: "Bạn cần hỗ trợ gì?",
      message: "Mô tả ngắn về dự án",
    },
    submitLabel: "Gửi liên hệ",
    loadingLabel: "Đang gửi...",
    successMessage: "Cảm ơn bạn. Thông tin đã được gửi thành công.",
    errorMessage: "Không thể gửi liên hệ. Vui lòng thử lại.",
  },
};

export type HomeContent = typeof homeContentDefaults;
