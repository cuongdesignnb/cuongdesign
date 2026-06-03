import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ProductDetailClient from "./ProductDetailClient";
import { Metadata } from "next";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
  });

  if (!product) {
    return {};
  }

  return {
    title: `${product.title} - Mua mã nguồn | Cường Design`,
    description: product.description,
    openGraph: {
      title: product.title,
      description: product.description,
      images: [{ url: product.coverImage }],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;

  // 1. Fetch product
  const product = await prisma.product.findUnique({
    where: { slug },
  });

  if (!product) {
    notFound();
  }

  // 2. Fetch approved reviews with user relation
  const reviews = await prisma.review.findMany({
    where: {
      productId: product.id,
      isApproved: true,
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          name: true,
          avatar: true,
        },
      },
    },
  });

  // 3. Check login status
  const session = await auth();
  const isLoggedIn = !!session?.user;

  // Calculate review aggregation
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews
    : 5;

  const finalPrice = product.salePrice !== null ? product.salePrice : product.price;

  // Schema.org Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.title,
    "image": product.coverImage,
    "description": product.description,
    "sku": product.id,
    "offers": {
      "@type": "Offer",
      "url": `https://cuongdesign.com/san-pham/${product.slug}`,
      "priceCurrency": "VND",
      "price": finalPrice,
      "priceValidUntil": "2030-01-01",
      "availability": product.price === 0 ? "https://schema.org/LimitedAvailability" : "https://schema.org/InStock",
      "itemCondition": "https://schema.org/NewCondition",
    },
    "aggregateRating": totalReviews > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": avgRating.toFixed(1),
      "reviewCount": totalReviews,
    } : undefined,
    "review": reviews.map((r) => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": r.user?.name || "Khách hàng",
      },
      "datePublished": r.createdAt.toISOString(),
      "reviewBody": r.comment,
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": r.rating,
        "bestRating": 5,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-[#030014] text-gray-200 flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header />

      <main className="grow py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Decorative Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none select-none z-0" />
        
        <div className="max-w-5xl mx-auto relative z-10 space-y-8 mt-8">
          {/* Breadcrumbs */}
          <Breadcrumbs
            items={[
              { label: "Sản phẩm số", href: "/#products" },
              { label: product.title },
            ]}
          />

          {/* Heading Cover Info */}
          <div className="space-y-4 text-left">
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-pink-500/10 text-pink-400 border border-pink-500/20 font-semibold uppercase">
              {product.type}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {product.title}
            </h1>
          </div>

          {/* Cover Art Banner */}
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-white/5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.coverImage}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Detailed client specs */}
          <ProductDetailClient
            product={JSON.parse(JSON.stringify(product))}
            reviews={JSON.parse(JSON.stringify(reviews))}
            isLoggedIn={isLoggedIn}
          />

        </div>
      </main>

      <Footer />
    </div>
  );
}
