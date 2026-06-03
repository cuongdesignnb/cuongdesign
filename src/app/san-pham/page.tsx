import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import DigitalProductsSection from "@/components/sections/DigitalProductsSection";
import { prisma } from "@/lib/db";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cửa hàng Sản phẩm số & Source Code | Cường Design",
  description: "Khám phá cửa hàng sản phẩm số của Cường Design. Mua mã nguồn website Next.js, React chất lượng cao, UI kit và template chuyên nghiệp tối ưu SEO.",
  keywords: ["Mua source code Next.js", "Mã nguồn React", "Landing page mẫu", "UI Kit website", "Cửa hàng Cường Design"],
};

export default async function ProductsListPage() {
  // Fetch active products from database
  const dbProducts = await prisma.product.findMany({
    orderBy: { order: "asc" }
  });

  return (
    <div className="min-h-screen bg-[#030014] text-gray-200 flex flex-col">
      <Header />

      <main className="grow pt-28 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Grid backgrounds */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none select-none z-0" />
        
        {/* Glow decorations */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 space-y-6">
          <div className="px-4 sm:px-6 lg:px-8">
            <Breadcrumbs items={[{ label: "Sản phẩm", href: "/san-pham" }]} />
          </div>
          
          {/* Reuse the digital products interactive component */}
          <div className="-mt-12">
            <DigitalProductsSection initialProducts={dbProducts} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
