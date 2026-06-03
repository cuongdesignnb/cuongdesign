export interface FaqItem {
  question: string;
  answer: string;
}

export const faqs: FaqItem[] = [
  {
    question: "Cường Design có nhận thiết kế & lập trình trọn gói hay không?",
    answer: "Có, tôi cung cấp giải pháp trọn gói từ tư vấn chiến lược, vẽ wireframe, thiết kế giao diện chuyên sâu trên Figma đến trực tiếp lập trình Front-end (Next.js/React), phát triển hệ thống Back-end/Database và đưa website chạy thực tế trên Cloud."
  },
  {
    question: "Sau khi mua mã nguồn/source code tại cửa hàng, tôi có được hỗ trợ cài đặt không?",
    answer: "Tất cả sản phẩm số và source code mua trên website của tôi đều đi kèm tài liệu/video hướng dẫn cài đặt chi tiết. Bên cạnh đó, tôi hỗ trợ kỹ thuật trực tiếp hoàn toàn miễn phí qua Zalo/Email nếu bạn gặp bất kỳ trở ngại nào trong quá trình cấu hình ban đầu."
  },
  {
    question: "Quy trình thanh toán đối với dự án thiết kế & lập trình freelance như thế nào?",
    answer: "Thông thường, dự án sẽ được chia làm 3 đợt thanh toán rõ ràng: Đợt 1 (30% chi phí) sau khi ký hợp đồng và thống nhất yêu cầu; Đợt 2 (40% chi phí) sau khi bạn duyệt thiết kế UI/UX trên Figma; Đợt 3 (30% chi phí) sau khi hoàn tất kiểm thử và bàn giao sản phẩm chạy thực tế trên server."
  },
  {
    question: "Website lập trình bằng Next.js có thực sự tốt cho SEO hơn các nền tảng khác?",
    answer: "Rất tốt. Next.js hỗ trợ cơ chế render phía máy chủ (SSR) và sinh trang tĩnh (SSG), giúp Google Bot có thể cào nội dung HTML đầy đủ ngay lập tức. Kết hợp với tối ưu hóa ảnh tự động, CSS Tailwind v4 siêu nhẹ và bộ schema markup do tôi chèn, website của bạn sẽ có điểm Core Web Vitals tối đa, tăng khả năng cạnh tranh top từ khóa."
  }
];
