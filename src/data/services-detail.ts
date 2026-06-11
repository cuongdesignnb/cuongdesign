export interface ServiceDetail {
  slug: string;
  title: string; // H1 title
  metaTitle: string; // for <title> tag
  description: string; // meta description
  keywords: string[];
  heroDescription: string; // longer intro paragraph
  features: { title: string; description: string }[];
  process: { step: number; title: string; description: string }[];
  faqs: { question: string; answer: string }[];
  ctaText: string;
}

export const servicesDetail: ServiceDetail[] = [
  {
    slug: "thiet-ke-ui-ux",
    title: "Thiết kế UI/UX Website chuyên nghiệp",
    metaTitle:
      "Thiết kế UI/UX Website chuyên nghiệp — Figma, Prototype & Design System",
    description:
      "Dịch vụ thiết kế UI/UX Website chuyên sâu từ Wireframe, Mockup đến Prototype tương tác cao. Xây dựng Design System chuẩn, tối ưu trải nghiệm người dùng và tăng tỷ lệ chuyển đổi.",
    keywords: [
      "thiết kế UI/UX",
      "thiết kế giao diện website",
      "UI/UX design",
      "dịch vụ thiết kế Figma",
      "thiết kế trải nghiệm người dùng",
      "wireframe mockup prototype",
      "design system",
      "thiết kế responsive",
    ],
    heroDescription:
      "Tôi cung cấp dịch vụ thiết kế UI/UX chuyên sâu, từ nghiên cứu hành vi người dùng (User Research) đến xây dựng bản vẽ giao diện hoàn chỉnh trên Figma. Mỗi thiết kế đều được tối ưu cho từng thiết bị — Mobile, Tablet, Desktop — đảm bảo trải nghiệm đồng nhất và mượt mà. Với quy trình bài bản từ Wireframe → Mockup → Prototype có tương tác, bạn sẽ thấy rõ sản phẩm trước khi bắt đầu lập trình.",
    features: [
      {
        title: "Thiết kế Pixel-Perfect trên Figma",
        description:
          "Giao diện được thiết kế tỉ mỉ đến từng pixel, sử dụng Auto Layout và Component Variants đảm bảo tính nhất quán trên mọi trang.",
      },
      {
        title: "Design System & Component Tokens",
        description:
          "Xây dựng hệ thống thiết kế có cấu trúc với Color Tokens, Typography Scale, Spacing Grid giúp dễ dàng mở rộng và bảo trì sau này.",
      },
      {
        title: "Responsive Multi-Device",
        description:
          "Thiết kế Responsive chuẩn cho Mobile-first, Tablet và Desktop. Đảm bảo giao diện hiển thị đẹp và hoạt động tốt trên mọi kích thước màn hình.",
      },
      {
        title: "Prototype tương tác cao",
        description:
          "Tạo Prototype có hiệu ứng chuyển trang, hover, micro-interaction để bạn trải nghiệm sản phẩm thực tế trước khi code.",
      },
      {
        title: "User Research & Persona",
        description:
          "Nghiên cứu đối tượng mục tiêu, xây dựng User Persona và Journey Map để thiết kế phù hợp nhất với hành vi người dùng thực tế.",
      },
    ],
    process: [
      {
        step: 1,
        title: "Tìm hiểu & Phân tích yêu cầu",
        description:
          "Trao đổi chi tiết về mục tiêu dự án, đối tượng khách hàng, đối thủ cạnh tranh và phong cách thiết kế mong muốn.",
      },
      {
        step: 2,
        title: "Wireframe & Cấu trúc trang",
        description:
          "Phác thảo cấu trúc bố cục (Wireframe) cho tất cả các trang chính, xác nhận luồng người dùng trước khi bắt đầu thiết kế chi tiết.",
      },
      {
        step: 3,
        title: "Thiết kế Mockup chi tiết",
        description:
          "Thiết kế giao diện hoàn chỉnh với màu sắc, typography, hình ảnh và nội dung thực tế. Bàn giao tối đa 2 phương án để lựa chọn.",
      },
      {
        step: 4,
        title: "Prototype & Chỉnh sửa",
        description:
          "Xây dựng Prototype tương tác, thu thập phản hồi và chỉnh sửa theo ý kiến khách hàng (hỗ trợ tối đa 3 lần chỉnh sửa lớn).",
      },
      {
        step: 5,
        title: "Bàn giao & Hướng dẫn",
        description:
          "Bàn giao toàn bộ file Figma có cấu trúc rõ ràng, tài liệu Design System và hỗ trợ developer trong quá trình code.",
      },
    ],
    faqs: [
      {
        question: "Thời gian thiết kế UI/UX một website mất bao lâu?",
        answer:
          "Tùy thuộc vào quy mô dự án, thông thường từ 5-10 ngày làm việc cho website 5-10 trang. Dự án lớn hơn (20+ trang) có thể mất 2-4 tuần. Tôi luôn cam kết timeline cụ thể trước khi bắt đầu.",
      },
      {
        question: "Tôi có nhận được file nguồn Figma không?",
        answer:
          "Có. Sau khi hoàn thành, bạn sẽ nhận toàn bộ file Figma gốc với cấu trúc layer rõ ràng, Component Library và bản Design System để sử dụng lâu dài.",
      },
      {
        question: "Thiết kế có bao gồm responsive cho mobile không?",
        answer:
          "Tất cả thiết kế của tôi đều bao gồm bản responsive cho ít nhất 3 breakpoint: Mobile (375px), Tablet (768px) và Desktop (1440px). Giá đã bao gồm responsive đầy đủ.",
      },
      {
        question:
          "Nếu tôi chưa có nội dung và hình ảnh thì sao?",
        answer:
          "Tôi sẽ hỗ trợ biên tập nội dung sơ bộ và sử dụng hình ảnh stock chất lượng cao phù hợp với lĩnh vực của bạn trong quá trình thiết kế. Bạn có thể thay thế nội dung chính thức sau.",
      },
    ],
    ctaText: "Bắt đầu thiết kế giao diện cho dự án của bạn",
  },
  {
    slug: "website-doanh-nghiep",
    title: "Thiết kế Website doanh nghiệp chuyên nghiệp",
    metaTitle:
      "Thiết kế Website doanh nghiệp chuẩn SEO — Next.js & React",
    description:
      "Dịch vụ thiết kế và lập trình website doanh nghiệp chuyên nghiệp bằng Next.js. Chuẩn SEO, bảo mật cao, tốc độ nhanh, tích hợp CMS quản trị nội dung dễ dàng.",
    keywords: [
      "website doanh nghiệp",
      "thiết kế website công ty",
      "lập trình website Next.js",
      "website giới thiệu doanh nghiệp",
      "website chuẩn SEO",
      "web doanh nghiệp chuyên nghiệp",
      "thiết kế web công ty",
    ],
    heroDescription:
      "Website doanh nghiệp là bộ mặt trực tuyến đại diện cho thương hiệu của bạn. Tôi xây dựng website giới thiệu công ty bằng Next.js — framework hàng đầu thế giới về hiệu năng và SEO — kết hợp giao diện thiết kế cao cấp, chuẩn mobile-first và hệ thống quản trị nội dung CMS giúp bạn tự cập nhật thông tin mà không cần kiến thức lập trình.",
    features: [
      {
        title: "Lập trình Next.js App Router",
        description:
          "Sử dụng Next.js với App Router và Server Components, đảm bảo hiệu năng tải trang cực nhanh và SEO thân thiện với Google.",
      },
      {
        title: "Hệ thống CMS quản trị nội dung",
        description:
          "Tích hợp hệ thống quản trị (Prisma + PostgreSQL) giúp bạn tự thêm/sửa/xóa trang, bài viết, dự án mà không cần lập trình viên.",
      },
      {
        title: "SEO On-page chuyên sâu",
        description:
          "Cài đặt đầy đủ Meta Tags, Open Graph, JSON-LD Schema, Sitemap, Robots.txt và tối ưu Core Web Vitals cho thứ hạng Google tốt nhất.",
      },
      {
        title: "Bảo mật & Hiệu năng cao",
        description:
          "Triển khai trên Vercel/VPS với SSL, CSP Headers, Rate Limiting. Tối ưu hình ảnh tự động WebP/AVIF, lazy loading và code splitting.",
      },
      {
        title: "Tích hợp liên hệ thông minh",
        description:
          "Form liên hệ tự động gửi thông báo qua Email và Telegram Bot. Tích hợp Zalo Chat Widget, Google Maps và các kênh liên lạc khác.",
      },
      {
        title: "Đa ngôn ngữ & Analytics",
        description:
          "Hỗ trợ đa ngôn ngữ (i18n), tích hợp Google Analytics 4, Facebook Pixel và các công cụ tracking chuyên nghiệp.",
      },
    ],
    process: [
      {
        step: 1,
        title: "Khảo sát & Lên kế hoạch",
        description:
          "Thu thập thông tin doanh nghiệp, mục tiêu kinh doanh, đối thủ cạnh tranh. Lên sitemap và danh sách tính năng chi tiết.",
      },
      {
        step: 2,
        title: "Thiết kế giao diện UI/UX",
        description:
          "Thiết kế mockup hoàn chỉnh trên Figma, xác nhận phong cách, bố cục và trải nghiệm người dùng trước khi code.",
      },
      {
        step: 3,
        title: "Lập trình & Tích hợp",
        description:
          "Code giao diện Next.js, cài đặt hệ thống CMS, tích hợp form liên hệ, SEO và các tính năng theo yêu cầu.",
      },
      {
        step: 4,
        title: "Kiểm thử & Tối ưu",
        description:
          "Test chức năng trên mọi thiết bị, tối ưu tốc độ, kiểm tra SEO, bảo mật và sửa bug trước khi go-live.",
      },
      {
        step: 5,
        title: "Triển khai & Bảo trì",
        description:
          "Deploy lên server, cấu hình domain, SSL. Hỗ trợ bảo trì, hướng dẫn sử dụng CMS và hỗ trợ kỹ thuật sau bàn giao.",
      },
    ],
    faqs: [
      {
        question: "Chi phí làm website doanh nghiệp là bao nhiêu?",
        answer:
          "Chi phí dao động từ 15.000.000 - 40.000.000 VNĐ tùy theo số trang, tính năng và mức độ phức tạp. Website 5-7 trang cơ bản khoảng 15 triệu, website có CMS quản trị đầy đủ từ 20 triệu trở lên.",
      },
      {
        question: "Website có thể tự cập nhật nội dung được không?",
        answer:
          "Có. Tôi tích hợp hệ thống quản trị (CMS) với giao diện trực quan. Bạn có thể tự thêm bài viết, cập nhật hình ảnh, chỉnh sửa nội dung trang mà không cần biết code.",
      },
      {
        question: "Thời gian hoàn thành website bao lâu?",
        answer:
          "Website doanh nghiệp cơ bản thường mất 10-20 ngày làm việc. Dự án phức tạp hơn (có blog, đa ngôn ngữ, tích hợp CRM) có thể mất 3-6 tuần. Tôi cam kết deadline rõ ràng.",
      },
      {
        question: "Website có tối ưu SEO để lên Google không?",
        answer:
          "Tất nhiên. Tôi cài đặt đầy đủ SEO kỹ thuật: Meta tags, Open Graph, JSON-LD Schema Markup, sitemap.xml, robots.txt, canonical URL và tối ưu Core Web Vitals để website thân thiện với Google.",
      },
    ],
    ctaText: "Khởi tạo website doanh nghiệp ngay hôm nay",
  },
  {
    slug: "landing-page",
    title: "Thiết kế Landing Page chuyển đổi cao",
    metaTitle:
      "Thiết kế Landing Page chuyển đổi cao — Tối ưu quảng cáo & Leads",
    description:
      "Dịch vụ thiết kế và lập trình Landing Page chuyển đổi cao, tốc độ tải siêu nhanh, tối ưu cho Google Ads và Facebook Ads. Thu thập leads hiệu quả, tăng doanh số tức thì.",
    keywords: [
      "landing page",
      "thiết kế landing page",
      "landing page chuyển đổi cao",
      "trang đích quảng cáo",
      "landing page bán hàng",
      "landing page thu leads",
      "thiết kế trang đích",
      "landing page tối ưu ads",
    ],
    heroDescription:
      "Landing Page là vũ khí bí mật giúp chiến dịch quảng cáo của bạn đạt hiệu quả tối đa. Tôi thiết kế và lập trình trang đích với tốc độ tải dưới 1 giây, bố cục tối ưu theo nguyên tắc tâm lý học UX (Social Proof, Scarcity, Authority), kết hợp nút CTA chiến lược để biến mỗi lượt truy cập thành khách hàng tiềm năng.",
    features: [
      {
        title: "Thiết kế tối ưu chuyển đổi",
        description:
          "Áp dụng các nguyên tắc CRO (Conversion Rate Optimization): bố cục AIDA, Social Proof, Urgency, nút CTA nổi bật để tối đa hóa tỷ lệ chuyển đổi.",
      },
      {
        title: "Tốc độ tải siêu nhanh",
        description:
          "Landing page được tối ưu để tải dưới 1 giây, giảm tỷ lệ thoát trang và tăng điểm Quality Score cho quảng cáo Google Ads.",
      },
      {
        title: "Form thu thập Leads thông minh",
        description:
          "Tích hợp form đăng ký với validation, auto-save, tự động gửi data vào Google Sheets, Email hoặc CRM để quản lý leads hiệu quả.",
      },
      {
        title: "Tích hợp Tracking & Analytics",
        description:
          "Cài đặt Google Analytics 4, Facebook Pixel, Google Tag Manager và các event tracking để đo lường chính xác hiệu quả quảng cáo.",
      },
      {
        title: "Hiệu ứng cuộn mượt mà",
        description:
          "Animation scroll-reveal tinh tế với Framer Motion, tạo ấn tượng chuyên nghiệp và giữ chân người dùng cuộn đến cuối trang.",
      },
    ],
    process: [
      {
        step: 1,
        title: "Brief & Phân tích chiến dịch",
        description:
          "Tìm hiểu sản phẩm/dịch vụ, đối tượng mục tiêu, mục tiêu chuyển đổi và kênh quảng cáo sẽ sử dụng (Google Ads, Facebook, TikTok...).",
      },
      {
        step: 2,
        title: "Thiết kế giao diện Landing Page",
        description:
          "Thiết kế mockup theo cấu trúc AIDA (Attention → Interest → Desire → Action) với focus vào CTA chính và Social Proof.",
      },
      {
        step: 3,
        title: "Lập trình & Tối ưu tốc độ",
        description:
          "Code landing page bằng Next.js, tối ưu hình ảnh, lazy loading, và đảm bảo Lighthouse Performance đạt 95+ điểm.",
      },
      {
        step: 4,
        title: "Tích hợp & Go-live",
        description:
          "Kết nối form, cài tracking pixels, kiểm tra trên mọi thiết bị và launch. Hỗ trợ tối ưu liên tục dựa trên dữ liệu thực tế.",
      },
    ],
    faqs: [
      {
        question: "Landing Page khác gì so với website thông thường?",
        answer:
          "Landing Page là trang đích đơn trang, tập trung vào một mục tiêu chuyển đổi duy nhất (mua hàng, đăng ký, liên hệ). Không có menu phức tạp hay nhiều trang con. Mọi yếu tố trên trang đều hướng người dùng đến hành động cụ thể.",
      },
      {
        question: "Chi phí làm Landing Page là bao nhiêu?",
        answer:
          "Chi phí từ 6.000.000 - 15.000.000 VNĐ tùy độ phức tạp. Landing page đơn giản (1 section sản phẩm + form) khoảng 6 triệu. Landing page phức tạp có nhiều section, animation, A/B testing từ 10 triệu trở lên.",
      },
      {
        question: "Làm Landing Page mất bao lâu?",
        answer:
          "Thông thường 3-7 ngày làm việc. Nếu cần gấp, tôi có thể hoàn thành trong 2-3 ngày với phụ phí fast-track. Bao gồm cả thiết kế, code và cài đặt tracking.",
      },
      {
        question: "Landing Page có hỗ trợ chạy quảng cáo không?",
        answer:
          "Có. Tôi cài đặt đầy đủ Facebook Pixel, Google Analytics 4, Google Tag Manager và các conversion event. Landing page được tối ưu Quality Score cho Google Ads và Relevance Score cho Facebook Ads.",
      },
    ],
    ctaText: "Tạo Landing Page chuyển đổi cao cho bạn",
  },
  {
    slug: "e-commerce",
    title: "Thiết kế Website bán hàng / E-commerce",
    metaTitle:
      "Thiết kế Website bán hàng E-commerce — Thanh toán tự động & Quản lý đơn hàng",
    description:
      "Dịch vụ thiết kế và lập trình website bán hàng E-commerce chuyên nghiệp. Tích hợp thanh toán QR Code tự động, giỏ hàng thông minh, dashboard quản lý đơn hàng và phân phối sản phẩm số.",
    keywords: [
      "website bán hàng",
      "website e-commerce",
      "thiết kế web bán hàng",
      "website thương mại điện tử",
      "lập trình website TMĐT",
      "website bán hàng online",
      "thanh toán QR code",
      "giỏ hàng online",
    ],
    heroDescription:
      "Tôi xây dựng hệ thống bán hàng trực tuyến hoàn chỉnh — từ giao diện trưng bày sản phẩm chuyên nghiệp, giỏ hàng thông minh, đến hệ thống thanh toán QR Code tự động đối soát giao dịch ngân hàng real-time qua SePay Webhook. Đặc biệt hỗ trợ bán sản phẩm số (source code, template, tài liệu) với hệ thống phân phối link tải tự động sau thanh toán.",
    features: [
      {
        title: "Giỏ hàng & Thanh toán chuyên nghiệp",
        description:
          "Hệ thống giỏ hàng tối ưu UX, trang checkout đơn giản. Tích hợp thanh toán QR Code VietQR với đối soát tự động qua SePay Webhook.",
      },
      {
        title: "Dashboard quản lý đơn hàng",
        description:
          "Bảng điều khiển trực quan theo dõi đơn hàng, doanh thu, biểu đồ tăng trưởng. Quản lý sản phẩm, danh mục, khuyến mãi dễ dàng.",
      },
      {
        title: "Phân phối sản phẩm số tự động",
        description:
          "Hệ thống tự động gửi link tải file sau khi thanh toán thành công. Bảo vệ file bằng signed URL với thời hạn giới hạn.",
      },
      {
        title: "SEO sản phẩm & Rich Snippets",
        description:
          "Mỗi trang sản phẩm được tối ưu SEO với Product Schema, đánh giá sao, giá tiền hiển thị trực tiếp trên Google Search Results.",
      },
      {
        title: "Hệ thống đánh giá & Xác thực",
        description:
          "Tích hợp hệ thống đánh giá sản phẩm từ khách hàng đã mua. Xác thực người dùng qua NextAuth (Google, GitHub, Email OTP).",
      },
      {
        title: "Email thông báo tự động",
        description:
          "Gửi email xác nhận đơn hàng, thông báo thanh toán thành công và link tải sản phẩm tự động qua hệ thống SMTP/Resend.",
      },
    ],
    process: [
      {
        step: 1,
        title: "Phân tích mô hình kinh doanh",
        description:
          "Tìm hiểu sản phẩm, quy trình bán hàng, phương thức thanh toán và yêu cầu quản lý cụ thể của doanh nghiệp.",
      },
      {
        step: 2,
        title: "Thiết kế UX/UI cửa hàng",
        description:
          "Thiết kế giao diện trưng bày sản phẩm, trang chi tiết, giỏ hàng và checkout tối ưu trải nghiệm mua sắm.",
      },
      {
        step: 3,
        title: "Lập trình hệ thống backend",
        description:
          "Xây dựng database, API, hệ thống thanh toán, quản lý đơn hàng và tích hợp các dịch vụ bên thứ ba.",
      },
      {
        step: 4,
        title: "Tích hợp thanh toán & Testing",
        description:
          "Kết nối SePay/VNPay, kiểm thử luồng mua hàng end-to-end, stress test và bảo mật toàn diện.",
      },
      {
        step: 5,
        title: "Go-live & Đào tạo vận hành",
        description:
          "Triển khai production, hướng dẫn quản trị cửa hàng, theo dõi hoạt động và hỗ trợ kỹ thuật liên tục.",
      },
    ],
    faqs: [
      {
        question: "Website bán hàng có hỗ trợ thanh toán tự động không?",
        answer:
          "Có. Tôi tích hợp hệ thống thanh toán QR Code VietQR kết hợp SePay Webhook để tự động xác nhận giao dịch ngân hàng real-time. Khách hàng quét mã QR → chuyển khoản → hệ thống tự động xác nhận và giao hàng (sản phẩm số).",
      },
      {
        question: "Chi phí xây dựng website E-commerce là bao nhiêu?",
        answer:
          "Chi phí từ 25.000.000 - 60.000.000 VNĐ tùy quy mô. Website bán hàng cơ bản (giỏ hàng + thanh toán + quản lý đơn hàng) khoảng 25 triệu. Hệ thống lớn với multi-vendor, loyalty program từ 40 triệu trở lên.",
      },
      {
        question:
          "Có thể bán sản phẩm số (source code, ebook) được không?",
        answer:
          "Hoàn toàn được. Tôi có kinh nghiệm xây dựng hệ thống phân phối sản phẩm số với link tải tự động, bảo vệ file bằng signed URL, giới hạn số lần tải và quản lý license key.",
      },
    ],
    ctaText: "Xây dựng cửa hàng online cho bạn ngay",
  },
  {
    slug: "dashboard-saas",
    title: "Thiết kế Dashboard & SaaS Application",
    metaTitle:
      "Thiết kế Dashboard & SaaS Application — Admin Panel & Hệ thống quản trị",
    description:
      "Dịch vụ thiết kế và lập trình Dashboard, Admin Panel và ứng dụng SaaS chuyên nghiệp. Biểu đồ trực quan, quản lý phân quyền RBAC, chat real-time và tích hợp AI.",
    keywords: [
      "dashboard admin",
      "admin panel",
      "SaaS application",
      "hệ thống quản trị",
      "thiết kế dashboard",
      "phần mềm quản lý",
      "web application",
      "ứng dụng SaaS",
    ],
    heroDescription:
      "Tôi xây dựng các hệ thống quản trị nội bộ và ứng dụng SaaS với giao diện trực quan, khả năng mở rộng cao và bảo mật enterprise-grade. Từ dashboard phân tích dữ liệu với biểu đồ real-time, hệ thống quản lý khách hàng (CRM), đến nền tảng SaaS multi-tenant — tất cả được thiết kế theo chuẩn UX dành cho enterprise và tối ưu cho hiệu suất làm việc.",
    features: [
      {
        title: "Phân quyền RBAC nâng cao",
        description:
          "Hệ thống quản lý phân quyền Role-Based Access Control linh hoạt. Phân cấp Admin, Manager, Editor, User với quyền truy cập chi tiết từng module.",
      },
      {
        title: "Biểu đồ & Thống kê trực quan",
        description:
          "Dashboard với biểu đồ dữ liệu real-time bằng Recharts/Chart.js. Hỗ trợ line chart, bar chart, pie chart, heatmap và nhiều loại visualization khác.",
      },
      {
        title: "Chat & Thông báo real-time",
        description:
          "Hệ thống chat trực tiếp với khách hàng qua WebSocket/Socket.io. Push notification, email alert và thông báo trong app khi có sự kiện quan trọng.",
      },
      {
        title: "Tích hợp AI & Automation",
        description:
          "Công cụ AI tự động sinh nội dung SEO, tóm tắt dữ liệu, chatbot hỗ trợ khách hàng. Tích hợp OpenAI API và các workflow tự động hóa.",
      },
      {
        title: "Export & Báo cáo",
        description:
          "Xuất báo cáo dạng PDF, Excel, CSV. Tự động gửi báo cáo định kỳ qua email. Lên lịch chạy report tự động theo ngày/tuần/tháng.",
      },
    ],
    process: [
      {
        step: 1,
        title: "Phân tích nghiệp vụ & Kiến trúc",
        description:
          "Tìm hiểu quy trình vận hành, luồng dữ liệu, đối tượng sử dụng. Thiết kế kiến trúc hệ thống và database schema.",
      },
      {
        step: 2,
        title: "Thiết kế UI Dashboard",
        description:
          "Thiết kế giao diện quản trị trực quan, tối ưu cho workflow của từng role. Ưu tiên usability và hiệu quả thao tác.",
      },
      {
        step: 3,
        title: "Phát triển MVP",
        description:
          "Lập trình các tính năng cốt lõi theo phương pháp Agile. Bàn giao từng module, demo định kỳ để nhận phản hồi sớm.",
      },
      {
        step: 4,
        title: "Testing & Security Audit",
        description:
          "Kiểm thử bảo mật, penetration test, load test. Đảm bảo hệ thống ổn định với hàng nghìn concurrent users.",
      },
      {
        step: 5,
        title: "Deploy & Monitoring",
        description:
          "Triển khai production với CI/CD pipeline. Cài đặt monitoring, logging, error tracking và hỗ trợ vận hành dài hạn.",
      },
    ],
    faqs: [
      {
        question: "Dashboard có thể tích hợp với hệ thống hiện có không?",
        answer:
          "Có. Tôi xây dựng dashboard với API-first approach, có thể kết nối với bất kỳ hệ thống nào qua REST API hoặc GraphQL. Hỗ trợ tích hợp với ERP, CRM, hệ thống kế toán và các phần mềm bên thứ ba.",
      },
      {
        question: "Chi phí và thời gian phát triển Dashboard/SaaS?",
        answer:
          "Chi phí từ 30.000.000 VNĐ trở lên tùy quy mô. Dashboard quản trị cơ bản (CRUD + biểu đồ) khoảng 30-50 triệu. Ứng dụng SaaS hoàn chỉnh có thể từ 50-150 triệu. Thời gian từ 1-3 tháng tùy tính năng.",
      },
      {
        question: "Hệ thống có hỗ trợ đa người dùng và phân quyền không?",
        answer:
          "Tất nhiên. Tôi triển khai hệ thống phân quyền RBAC đầy đủ với khả năng tùy chỉnh quyền truy cập chi tiết đến từng module, tính năng. Hỗ trợ multi-tenant cho ứng dụng SaaS phục vụ nhiều khách hàng cùng lúc.",
      },
      {
        question: "Sau khi bàn giao, tôi có tự vận hành được không?",
        answer:
          "Có. Tôi bàn giao kèm tài liệu kỹ thuật, hướng dẫn sử dụng chi tiết và video demo. Ngoài ra, tôi cung cấp gói bảo trì hàng tháng với support 24/7 qua Zalo/Telegram.",
      },
    ],
    ctaText: "Bắt đầu xây dựng hệ thống quản trị",
  },
  {
    slug: "seo-toi-uu-toc-do",
    title: "SEO & Tối ưu tốc độ Website",
    metaTitle:
      "SEO & Tối ưu tốc độ Website — Core Web Vitals & Google Lighthouse 95+",
    description:
      "Dịch vụ tối ưu SEO kỹ thuật và tăng tốc website. Cải thiện Core Web Vitals, đạt điểm Google Lighthouse 95+, cài đặt Schema Markup, sitemap và cấu trúc SEO chuẩn Google.",
    keywords: [
      "SEO website",
      "tối ưu tốc độ website",
      "Core Web Vitals",
      "Google Lighthouse",
      "SEO kỹ thuật",
      "tối ưu hiệu năng web",
      "SEO on-page",
      "tăng tốc website",
      "schema markup",
    ],
    heroDescription:
      "Website tải chậm mất 53% lượng truy cập mobile và rớt hạng trên Google. Tôi chuyên tối ưu SEO kỹ thuật và hiệu năng website — từ nén hình ảnh WebP/AVIF, loại bỏ JavaScript thừa, đến cài đặt Schema Markup và cấu trúc dữ liệu chuẩn Google. Mục tiêu: đạt điểm Lighthouse 95+ trên cả Performance, Accessibility, Best Practices và SEO.",
    features: [
      {
        title: "Tối ưu Core Web Vitals",
        description:
          "Cải thiện 3 chỉ số cốt lõi LCP, INP và CLS đạt chuẩn xanh Google. Giảm thời gian First Contentful Paint và Time to Interactive.",
      },
      {
        title: "Nén ảnh tự động WebP/AVIF",
        description:
          "Chuyển đổi và nén tất cả hình ảnh sang định dạng WebP/AVIF với chất lượng tối ưu. Cài đặt responsive images và lazy loading thông minh.",
      },
      {
        title: "Schema Markup & Rich Snippets",
        description:
          "Cài đặt JSON-LD cho Organization, Product, FAQ, Breadcrumb, Article. Giúp website hiển thị Rich Snippets nổi bật trên Google Search.",
      },
      {
        title: "Tối ưu CSS & JavaScript",
        description:
          "Loại bỏ unused CSS/JS, code splitting, tree shaking. Tối ưu Critical Rendering Path để trang hiển thị nội dung chính trong < 1 giây.",
      },
      {
        title: "Cấu trúc SEO On-page",
        description:
          "Tối ưu Meta Tags, heading hierarchy (H1-H6), internal linking, canonical URL, hreflang, sitemap.xml và robots.txt chuẩn Google.",
      },
      {
        title: "Audit & Báo cáo chi tiết",
        description:
          "Cung cấp báo cáo trước/sau tối ưu với số liệu cụ thể từ Google Lighthouse, PageSpeed Insights và Search Console.",
      },
    ],
    process: [
      {
        step: 1,
        title: "Audit & Đánh giá hiện trạng",
        description:
          "Phân tích website bằng Google Lighthouse, PageSpeed Insights, GTmetrix. Xác định các vấn đề ảnh hưởng đến tốc độ và SEO.",
      },
      {
        step: 2,
        title: "Lập kế hoạch tối ưu",
        description:
          "Ưu tiên các vấn đề theo mức độ ảnh hưởng (Impact vs Effort). Lên roadmap tối ưu chi tiết từng hạng mục.",
      },
      {
        step: 3,
        title: "Triển khai tối ưu",
        description:
          "Thực hiện tối ưu hình ảnh, CSS/JS, cài đặt Schema Markup, cấu hình cache, CDN và các cải thiện kỹ thuật khác.",
      },
      {
        step: 4,
        title: "Kiểm tra & Báo cáo kết quả",
        description:
          "Đo lường lại các chỉ số trước/sau, bàn giao báo cáo chi tiết và hướng dẫn maintain để giữ điểm số ổn định lâu dài.",
      },
    ],
    faqs: [
      {
        question: "Tối ưu tốc độ website mất bao lâu?",
        answer:
          "Thông thường 3-5 ngày làm việc cho một website trung bình. Website lớn hoặc phức tạp (e-commerce, SPA) có thể mất 1-2 tuần. Tôi sẽ đánh giá cụ thể sau khi audit website của bạn.",
      },
      {
        question: "Có đảm bảo đạt điểm Lighthouse bao nhiêu không?",
        answer:
          "Tôi cam kết đạt tối thiểu 90+ điểm trên cả 4 chỉ số Lighthouse (Performance, Accessibility, Best Practices, SEO). Hầu hết dự án tôi thực hiện đều đạt 95-100 điểm.",
      },
      {
        question: "Tối ưu SEO có giúp website lên top Google không?",
        answer:
          "Tôi tập trung vào SEO kỹ thuật (Technical SEO) — nền tảng để website có thể xếp hạng tốt. Kết hợp với nội dung chất lượng và backlink chiến lược, website sẽ có cơ hội xếp hạng cao hơn đáng kể.",
      },
      {
        question: "Chi phí tối ưu SEO và tốc độ bao nhiêu?",
        answer:
          "Chi phí từ 4.000.000 - 15.000.000 VNĐ tùy quy mô website. Audit + tối ưu cơ bản khoảng 4-6 triệu. Tối ưu toàn diện (SEO + Speed + Schema + Content Structure) từ 8 triệu trở lên.",
      },
    ],
    ctaText: "Tối ưu SEO & tốc độ website ngay",
  },
  {
    slug: "automation-doanh-nghiep",
    title: "Tự động hóa Quy trình Doanh nghiệp (Enterprise Automation)",
    metaTitle:
      "Tự động hóa Quy trình Doanh nghiệp — Giải pháp RPA, CRM & Tool Tối ưu Vận hành",
    description:
      "Dịch vụ thiết kế và lập trình hệ thống tự động hóa quy trình (RPA), liên kết dữ liệu CRM, ERP, Auto-bot Telegram/Email giúp doanh nghiệp giảm 80% tác vụ thủ công.",
    keywords: [
      "tự động hóa doanh nghiệp",
      "workflow automation",
      "rpa cho doanh nghiệp",
      "tự động hóa quy trình",
      "tích hợp crm erp",
      "automation developer",
      "tự động hóa quy trình nghiệp vụ",
      "Telegram bot báo cáo",
    ],
    heroDescription:
      "Tối ưu hóa nguồn lực và loại bỏ các sai sót thủ công bằng hệ thống tự động hóa quy trình doanh nghiệp. Tôi phát triển các giải pháp kết nối dữ liệu tự động giữa các nền tảng (CRM, ERP, Google Sheets, Telegram, Email), tự động hóa các tác vụ lặp đi lặp lại và xây dựng các bot báo cáo dữ liệu thông minh theo thời gian thực.",
    features: [
      {
        title: "Tích hợp API đa nền tảng",
        description:
          "Kết nối liền mạch các công cụ doanh nghiệp của bạn (CRM, ERP, Google Sheets, Gmail, Facebook Lead Ads, Zalo) để đồng bộ dữ liệu tự động.",
      },
      {
        title: "Tự động hóa Quy trình (RPA)",
        description:
          "Thiết kế và triển khai robot phần mềm (RPA) mô phỏng hành vi con người để xử lý các tác vụ lặp đi lặp lại như nhập liệu, kiểm tra đối chiếu.",
      },
      {
        title: "Telegram / Email Alert Bot",
        description:
          "Xây dựng các bot tự động gửi thông báo real-time khi phát sinh lỗi, đơn hàng mới, hoặc báo cáo doanh thu định kỳ theo ngày/tuần/tháng.",
      },
      {
        title: "Quản lý luồng công việc",
        description:
          "Thiết lập chuỗi hành động tự động hóa dựa trên điều kiện (Ví dụ: Khách điền form -> Tự tạo lead trên CRM -> Gửi mail cảm ơn -> Nhắn Telegram cho sale).",
      },
      {
        title: "Xây dựng tool/script tùy chỉnh",
        description:
          "Viết các script tự động (Python, Node.js) chạy định kỳ hoặc theo sự kiện để cào dữ liệu, xử lý file Excel/PDF lớn hoặc đồng bộ hóa database.",
      },
    ],
    process: [
      {
        step: 1,
        title: "Khảo sát & Phân tích quy trình",
        description:
          "Tìm hiểu kỹ luồng công việc hiện tại của doanh nghiệp, xác định các nút thắt cổ chai và đánh giá khả năng tự động hóa.",
      },
      {
        step: 2,
        title: "Lên giải pháp & Thiết kế sơ đồ luồng",
        description:
          "Vẽ sơ đồ luồng dữ liệu (workflow diagram), lựa chọn công cụ phù hợp (Make, Zapier, Custom Script) để tối ưu chi phí và tính ổn định.",
      },
      {
        step: 3,
        title: "Lập trình & Kết nối các API",
        description:
          "Thực hiện lập trình, cấu hình các webhook, kết nối API và viết kịch bản tự động hóa cho các công cụ hoạt động nhịp nhàng.",
      },
      {
        step: 4,
        title: "Kiểm thử kịch bản & Xử lý ngoại lệ",
        description:
          "Chạy thử nghiệm trên môi trường sandbox, giả định mọi trường hợp lỗi (mất mạng, dữ liệu sai định dạng) để thiết lập cơ chế tự động báo lỗi.",
      },
      {
        step: 5,
        title: "Bàn giao & Hướng dẫn vận hành",
        description:
          "Bàn giao tài liệu hướng dẫn, cấu hình tài khoản, bàn giao mã nguồn (nếu code custom) và bảo hành, bảo trì luồng tự động hóa.",
      },
    ],
    faqs: [
      {
        question: "Nên chọn nền tảng như Make/Zapier hay viết Code custom?",
        answer:
          "Tùy vào nhu cầu của bạn. Nền tảng no-code/low-code (Make, Zapier) giúp triển khai cực kỳ nhanh và dễ chỉnh sửa luồng sau này, phù hợp với các tác vụ kết nối phổ biến. Viết code custom (Node.js/Python) thì tối ưu chi phí vận hành hàng tháng (không mất phí theo tác vụ) và xử lý được các logic cực kỳ phức tạp hoặc bảo mật nội bộ. Tôi sẽ tư vấn phương án tối ưu nhất sau khi khảo sát.",
      },
      {
        question: "Hệ thống tự động hóa có an toàn bảo mật không?",
        answer:
          "Hoàn toàn an toàn. Tôi sử dụng các chuẩn bảo mật API Key, OAuth 2.0, mã hóa dữ liệu nhạy cảm và tuân thủ các quy tắc bảo mật của từng nền tảng. Dữ liệu chỉ được truyền trực tiếp giữa các công cụ của bạn chứ không lưu trữ trung gian ở bất kỳ bên nào khác.",
      },
      {
        question: "Chi phí vận hành hệ thống tự động hóa hàng tháng là bao nhiêu?",
        answer:
          "Chi phí này phụ thuộc vào số lượng tác vụ (tasks/operations) chạy mỗi tháng. Nhiều kịch bản có thể chạy hoàn toàn miễn phí hoặc chỉ mất khoảng $9 - $29/tháng trên Make/Zapier. Nếu chạy bằng script custom trên máy chủ riêng (VPS) thì chi phí chỉ từ $5/tháng để thuê server và không giới hạn số lượng tác vụ.",
      },
      {
        question: "Khi các API của bên thứ ba thay đổi thì luồng có bị lỗi không?",
        answer:
          "Có khả năng các API thay đổi phiên bản (deprecated) hoặc cấu trúc dữ liệu bị đổi dẫn đến lỗi. Để giải quyết, tôi luôn lập trình sẵn cơ chế 'Error Handling' — tự động phát hiện lỗi và gửi tin nhắn cảnh báo ngay lập tức vào Telegram của bạn. Tôi cũng cung cấp gói bảo trì định kỳ để cập nhật luồng kịp thời.",
      },
    ],
    ctaText: "Thiết lập hệ thống tự động hóa quy trình ngay",
  },
];
