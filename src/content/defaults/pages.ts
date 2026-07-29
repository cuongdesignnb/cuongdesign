const seo = (title: string, description: string) => ({
  title,
  description,
  keywords: "",
  canonical: "",
  ogTitle: title,
  ogDescription: description,
  ogMedia: "",
  robotsIndex: true,
  robotsFollow: true,
});

export const aboutContentDefaults = {
  metadata: seo("Giới thiệu", "Thông tin về Cường Design."),
  hero: { breadcrumb: "Giới thiệu", badge: "About me", prefix: "Xin chào, tôi là", highlight: "Cường Design", suffix: "", avatarMedia: "" },
  profile: { name: "Nguyễn Văn Cường", jobTitle: "Freelancer Developer & UI/UX Designer", biography: "<p>Tôi thiết kế và phát triển những sản phẩm số tập trung vào hiệu năng và trải nghiệm người dùng.</p>", ctaLabel: "Liên hệ hợp tác", ctaUrl: "/lien-he" },
  skills: [],
  timeline: [],
  certificates: [],
  achievements: [],
};

export const servicesContentDefaults = {
  metadata: seo("Dịch vụ", "Dịch vụ thiết kế UI/UX và lập trình website chuyên nghiệp."),
  hero: { breadcrumb: "Dịch vụ của tôi", badge: "My Services & Packages", title: "Dịch vụ thiết kế & Lập trình web chuyên nghiệp", intro: "Các giải pháp tối ưu chuyển đổi số, thiết kế và phát triển website cao cấp." },
  labels: { features: "Tính năng cốt lõi", price: "Chi phí ước tính", duration: "Thời gian bàn giao", technology: "Công nghệ & Công cụ chính", detail: "Xem chi tiết", quote: "Báo giá ngay" },
  cta: { title: "Bạn cần giải pháp thiết kế riêng biệt?", content: "<p>Gửi mô tả dự án để nhận tư vấn và đề xuất giải pháp phù hợp.</p>", label: "Khởi động dự án", url: "/lien-he" },
};

export const processContentDefaults = {
  metadata: seo("Quy trình làm việc", "Quy trình triển khai dự án rõ ràng và minh bạch."),
  hero: { title: "Quy trình làm việc", intro: "Một quy trình rõ ràng giúp dự án đi đúng mục tiêu." },
  steps: [],
  principles: [],
  illustrationMedia: "",
  cta: { title: "Bắt đầu dự án", content: "<p>Trao đổi cùng tôi về mục tiêu của bạn.</p>", label: "Liên hệ", url: "/lien-he" },
};

export const skillsContentDefaults = {
  metadata: seo("Kỹ năng & Công nghệ", "Kỹ năng, công nghệ và công cụ Cường Design sử dụng."),
  hero: { title: "Kỹ năng & Công nghệ", intro: "Nền tảng kỹ thuật cho những sản phẩm số bền vững." },
  categories: [],
  technologies: [],
  certificates: [],
  tools: [],
  cta: { title: "Cần một kỹ năng cụ thể?", label: "Trao đổi ngay", url: "/lien-he" },
};

export const projectsContentDefaults = {
  metadata: seo("Dự án", "Các dự án thiết kế và lập trình đã triển khai."),
  hero: { breadcrumb: "Dự án", title: "Dự án thực tế", intro: "<p>Một số dự án tiêu biểu đã được triển khai.</p>" },
  filters: { all: "Tất cả", searchPlaceholder: "Tìm dự án" },
  emptyState: "Chưa tìm thấy dự án phù hợp.",
  detailLabels: { overview: "Tổng quan", technologies: "Công nghệ", demo: "Xem demo", source: "Mã nguồn" },
  cta: { title: "Bạn có dự án tương tự?", label: "Liên hệ", url: "/lien-he" },
};

export const productsContentDefaults = {
  metadata: seo("Sản phẩm số", "Source code, template và sản phẩm số."),
  hero: { breadcrumb: "Sản phẩm", title: "Sản phẩm số", intro: "<p>Các sản phẩm sẵn sàng để triển khai nhanh.</p>" },
  filters: { all: "Tất cả", searchPlaceholder: "Tìm sản phẩm" },
  labels: { price: "Giá", sale: "Giá ưu đãi", free: "Liên hệ", buy: "Mua ngay" },
  emptyState: "Chưa tìm thấy sản phẩm phù hợp.",
  purchaseSupport: "<p>Cần hỗ trợ cài đặt? Hãy liên hệ với chúng tôi.</p>",
  checkoutMessages: { processing: "Đang xử lý thanh toán...", error: "Thanh toán chưa thành công.", success: "Thanh toán thành công." },
  cta: { title: "Cần sản phẩm tùy chỉnh?", label: "Liên hệ", url: "/lien-he" },
};

export const blogContentDefaults = {
  metadata: seo("Bài viết", "Kiến thức về thiết kế, lập trình và SEO."),
  hero: { breadcrumb: "Bài viết", title: "Blog & Chia sẻ", intro: "Kiến thức và kinh nghiệm thực tế." },
  filters: { all: "Tất cả", searchPlaceholder: "Tìm bài viết" },
  emptyState: "Chưa tìm thấy bài viết phù hợp.",
  sidebar: { categories: "Chuyên mục", recent: "Bài viết mới", newsletter: "Nhận bài viết mới" },
  newsletter: { title: "Đăng ký nhận tin", description: "Nội dung mới được gửi thẳng đến email.", placeholder: "Email của bạn", buttonLabel: "Đăng ký" },
  articleCta: { title: "Nội dung này hữu ích?", content: "<p>Chia sẻ bài viết hoặc liên hệ để trao đổi sâu hơn.</p>", label: "Liên hệ", url: "/lien-he" },
};

export const reviewsContentDefaults = {
  metadata: seo("Đánh giá", "Phản hồi từ khách hàng và đối tác."),
  hero: { title: "Đánh giá khách hàng", intro: "Những phản hồi từ các dự án thực tế." },
  statistics: { projects: "Dự án", clients: "Khách hàng", rating: "Điểm đánh giá" },
  introduction: "<p>Sự hài lòng của khách hàng là thước đo quan trọng nhất.</p>",
  emptyState: "Chưa có đánh giá được xuất bản.",
  cta: { title: "Cùng tạo nên một dự án đáng nhớ", label: "Liên hệ", url: "/lien-he" },
};

export const contactContentDefaults = {
  metadata: seo("Liên hệ", "Liên hệ Cường Design để trao đổi về dự án."),
  hero: { title: "Liên hệ & FAQ", intro: "Hãy chia sẻ nhu cầu của bạn." },
  introduction: {
    title: "Thông tin liên lạc",
    content: "Bạn có thể gửi yêu cầu trực tiếp qua form hoặc liên hệ qua email, số điện thoại Zalo. Tôi sẽ phản hồi trong thời gian sớm nhất.",
  },
  cards: { email: "Email", phone: "Zalo / SĐT", address: "Vị trí", social: "Mạng xã hội" },
  form: {
    nameLabel: "Họ và tên *",
    namePlaceholder: "Nguyễn Văn A",
    emailLabel: "Email liên hệ *",
    emailPlaceholder: "client@example.com",
    phoneLabel: "Số điện thoại / Zalo",
    phonePlaceholder: "0912345678",
    subjectLabel: "Chủ đề cần tư vấn *",
    subjectPlaceholder: "Tư vấn lập trình Next.js...",
    messageLabel: "Nội dung yêu cầu chi tiết *",
    messagePlaceholder: "Mô tả tóm tắt ý tưởng, yêu cầu tính năng hoặc câu hỏi của bạn...",
    submitLabel: "Gửi thông tin liên hệ",
    loadingLabel: "Đang gửi thông tin...",
    successTitle: "Gửi liên hệ thành công!",
    successMessage: "Cảm ơn bạn đã nhắn tin. Tôi sẽ xem xét yêu cầu và phản hồi sớm nhất.",
    resetLabel: "Gửi tin nhắn khác",
    errorMessage: "Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại hoặc liên hệ trực tiếp qua Zalo/Email.",
  },
  faqHeading: "Câu hỏi thường gặp (FAQ)",
  faqIntro: "Giải đáp nhanh các thắc mắc phổ biến của khách hàng về dịch vụ và cài đặt mã nguồn.",
  faqs: [],
  mapMedia: "",
  backgroundMedia: "",
  cta: { title: "Sẵn sàng bắt đầu?", content: "<p>Tôi sẽ phản hồi trong thời gian sớm nhất.</p>", label: "Gửi yêu cầu", url: "#contact-form" },
};

export const footerContentDefaults = {
  logoMedia: "",
  description: "Thiết kế UI/UX và lập trình website hiện đại, chuẩn SEO.",
  columnTitles: { navigation: "Liên kết", services: "Dịch vụ", contact: "Liên hệ" },
  customLinks: [],
  newsletter: { enabled: true, title: "Nhận bản tin", description: "Cập nhật bài viết và sản phẩm mới.", placeholder: "Email của bạn", buttonLabel: "Đăng ký" },
  copyright: "© {year} Cuong Design. All rights reserved.",
  credit: "Designed & developed by Cuong Design.",
};

export const systemCopyDefaults = {
  notFound: { title: "Không tìm thấy trang", description: "Trang bạn tìm kiếm không tồn tại.", actionLabel: "Về trang chủ" },
  noResults: "Không tìm thấy kết quả phù hợp.",
  loadError: "Không thể tải dữ liệu. Vui lòng thử lại.",
  loading: "Đang xử lý...",
  formError: "Không thể gửi biểu mẫu. Vui lòng thử lại.",
  paymentError: "Không thể hoàn tất thanh toán.",
  maintenance: "Website đang được bảo trì. Vui lòng quay lại sau.",
  defaultCta: { label: "Liên hệ ngay", url: "/lien-he" },
};
