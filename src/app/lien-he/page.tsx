import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ContactPageClient from "@/components/sections/ContactPageClient";
import { faqs } from "@/data/faqs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Liên hệ & Câu hỏi thường gặp | Cường Design",
  description: "Liên hệ trực tiếp với Cường Design để thảo luận về ý tưởng dự án thiết kế UI/UX Figma hoặc lập trình website Next.js. Xem giải đáp chi tiết tại mục FAQ.",
  keywords: ["Liên hệ Cường Design", "Thông tin liên lạc", "Zalo Cường Design", "FAQ thiết kế website"],
};

export default function ContactListPage() {
  // Schema.org FAQPage metadata
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <div className="min-h-screen bg-[#030014] text-gray-200 flex flex-col">
      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Header />

      <main className="grow pt-28 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Ambient Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none select-none z-0" />
        
        {/* Glow decorations */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 space-y-10">
          <Breadcrumbs items={[{ label: "Liên hệ & FAQ", href: "/lien-he" }]} />

          {/* Heading */}
          <div className="text-left space-y-4 max-w-3xl">
            <span className="text-[10px] text-pink-500 font-mono font-bold tracking-widest uppercase block">Get In Touch</span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-none">
              Liên hệ hợp tác & <br className="hidden md:inline" />
              Tư vấn dịch vụ
            </h1>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed">
              Bạn có câu hỏi, ý kiến đóng góp hoặc dự án cần thiết kế, lập trình? Đừng ngần ngại gửi tin nhắn cho tôi hoặc liên lạc trực tiếp qua các cổng thông tin Zalo/Email.
            </p>
          </div>

          <ContactPageClient />
        </div>
      </main>

      <Footer />
    </div>
  );
}
