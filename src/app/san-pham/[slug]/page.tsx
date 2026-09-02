import React from "react";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ProductDetailClient from "./ProductDetailClient";
import { Metadata } from "next";
import {
  buildProductSchema,
  createMetadataFromSeoFields,
  JsonLd,
  resolveCanonicalPath,
} from "@/lib/seo";
import { getProductBySlug } from "@/lib/seo/queries";
import { resolveSeoRedirect } from "@/lib/seo/resolve-redirect";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { robots: { index: false, follow: false } };
  }

  return createMetadataFromSeoFields({
    seo: {
      title: product.seoTitle || undefined,
      description: product.seoDescription || undefined,
      keywords: product.seoKeywords,
      canonicalPath: product.canonicalPath || undefined,
      ogTitle: product.ogTitle || undefined,
      ogDescription: product.ogDescription || undefined,
      ogImage: product.ogImage || undefined,
      robotsIndex: product.robotsIndex,
      robotsFollow: product.robotsFollow,
    },
    fallback: {
      title: `${product.title} - Sản phẩm số`,
      description: product.description,
      keywords: product.techStack,
      image: product.coverImage,
    },
    path: `/san-pham/${slug}`,
    modifiedTime: product.updatedAt.toISOString(),
    publishedTime: product.publishedAt?.toISOString(),
  });
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;

  // 1. Fetch product
  const product = await getProductBySlug(slug);

  if (!product) {
    await resolveSeoRedirect(`/san-pham/${slug}`);
    notFound();
  }

  const canonicalPath = resolveCanonicalPath(
    product.canonicalPath,
    `/san-pham/${product.slug}`,
  );

  const reviews = product.reviews;

  // 3. Check login status
  const session = await auth();
  const isLoggedIn = !!session?.user;

  const jsonLd = buildProductSchema({
    slug: product.slug,
    path: canonicalPath,
    name: product.title,
    description: product.description,
    images: [product.coverImage, ...product.images],
    sku: product.sku,
    brandName: product.brandName,
    pricingMode: product.pricingMode,
    price: product.price,
    salePrice: product.salePrice,
    currency: product.currency,
    availability: product.availability,
    priceValidUntil: product.priceValidUntil,
    reviews,
  });

  return (
    <div className="min-h-screen bg-[#030014] text-gray-200 flex flex-col">
      <JsonLd data={jsonLd} />

      <Header />

      <main className="grow py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Decorative Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none select-none z-0" />
        
        <div className="max-w-5xl mx-auto relative z-10 space-y-8 mt-8">
          {/* Breadcrumbs */}
          <Breadcrumbs
            items={[
              { label: "Sản phẩm số", href: "/san-pham" },
              { label: product.title, href: canonicalPath },
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
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-white/5 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.coverImage}
              alt={product.title}
              className="w-full h-full object-cover object-top transition-all duration-[3s] ease-in-out group-hover:duration-[8s] group-hover:object-bottom"
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
