export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  company?: string;
  quoteVi: string;
  quoteEn: string;
  rating: number;
  avatar: string;
}

export const testimonials: TestimonialItem[] = [
  {
    id: "t1",
    name: "Nguyễn Văn A",
    role: "CEO",
    company: "TechNova",
    quoteVi: "Cường làm việc rất chuyên nghiệp, hiểu ý tưởng nhanh và triển khai chính xác. Kết quả vượt kỳ vọng!",
    quoteEn: "Cuong works very professionally, understands concepts quickly, and executes flawlessly. Outstanding delivery!",
    rating: 5,
    avatar: "/images/avatar/client1.jpg",
  },
  {
    id: "t2",
    name: "Trần Thị B",
    role: "Founder",
    company: "Minh Store",
    quoteVi: "Website đẹp, tốc độ nhanh, chuẩn SEO và dễ quản lý. Rất hài lòng với dịch vụ hỗ trợ sau bàn giao.",
    quoteEn: "Stunning website design, ultra-fast loading, SEO friendly, and easy admin panel. Very happy with post-launch support.",
    rating: 5,
    avatar: "/images/avatar/client2.jpg",
  },
  {
    id: "t3",
    name: "Lê Văn C",
    role: "Developer",
    quoteVi: "Source code sạch sẽ, viết rất chuẩn mực, dễ tùy biến và mở rộng. Sẽ tiếp tục mua thêm các sản phẩm khác.",
    quoteEn: "Clean code structure, modular design, easy to customize. Highly recommended templates for other developers.",
    rating: 5,
    avatar: "/images/avatar/client3.jpg",
  },
  {
    id: "t4",
    name: "Phạm Thị D",
    role: "Marketing Manager",
    quoteVi: "Landing page do Cường thiết kế giúp tăng tỷ lệ chuyển đổi rõ rệt. Tối ưu di động tốt, load siêu tốc.",
    quoteEn: "The landing page designed by Cuong significantly boosted our conversions. Excellent responsive layout and speed.",
    rating: 5,
    avatar: "/images/avatar/client4.jpg",
  },
];
