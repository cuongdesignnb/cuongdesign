import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  Zap,
  MessageCircle,
} from "lucide-react";
import { servicesDetail } from "@/data/services-detail";
import { createMetadata, JsonLd, buildProfessionalServiceSchema } from "@/lib/seo";
import { siteConfig } from "@/data/site";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";

import { prisma } from "@/lib/db";

// ─── Static Params ──────────────────────────────────────
export function generateStaticParams() {
  return servicesDetail.map((s) => ({ slug: s.slug }));
}

// ─── Metadata ───────────────────────────────────────────
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = servicesDetail.find((s) => s.slug === slug);
  if (!service) return {};

  return createMetadata({
    title: service.metaTitle,
    description: service.description,
    path: `/dich-vu/${slug}`,
    keywords: service.keywords,
  });
}

// ─── Page ───────────────────────────────────────────────
export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = servicesDetail.find((s) => s.slug === slug);
  if (!service) notFound();

  // Query database settings for contact info
  let zaloSetting = null;
  try {
    zaloSetting = await prisma.setting.findUnique({
      where: { key: "contact_zalo" },
    });
  } catch (error) {
    console.warn("Database connection failed during build for service details page.");
  }
  const zaloUrl = zaloSetting?.value || siteConfig.contact.zalo;

  // JSON-LD: Service + FAQPage
  const serviceSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: service.title,
        description: service.description,
        url: `${siteConfig.url}/dich-vu/${slug}`,
        provider: buildProfessionalServiceSchema(),
        areaServed: siteConfig.areaServed.map((a) => ({
          "@type": "City",
          name: a,
        })),
      },
      ...(service.faqs.length > 0
        ? [
            {
              "@type": "FAQPage",
              mainEntity: service.faqs.map((faq) => ({
                "@type": "Question",
                name: faq.question,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: faq.answer,
                },
              })),
            },
          ]
        : []),
    ],
  };

  return (
    <>
      <JsonLd data={serviceSchema} />

      <main className="flex-1 bg-[#030014] relative overflow-hidden">
        {/* Hero Section */}
        <section className="pt-32 pb-16 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-950/20 via-transparent to-transparent" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <Breadcrumbs
              items={[
                { label: "Dịch vụ", href: "/dich-vu" },
                { label: service.title, href: `/dich-vu/${slug}` },
              ]}
            />

            <div className="mt-8 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Dịch vụ chuyên nghiệp</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                {service.title}
              </h1>

              <p className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-3xl">
                {service.heroDescription}
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link href="/lien-he">
                  <Button variant="primary" className="gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Liên hệ báo giá
                  </Button>
                </Link>
                <Link href="/du-an">
                  <Button variant="outline" className="gap-2">
                    Xem dự án mẫu
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Tính năng & Ưu điểm nổi bật
              </h2>
              <p className="text-gray-400 mt-3 max-w-2xl mx-auto">
                Những gì bạn nhận được khi sử dụng dịch vụ này
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {service.features.map((feature, idx) => (
                <GlassCard
                  key={idx}
                  className="p-6 border-white/5 bg-[#0d0b21]/45 hover:border-pink-500/25 transition-colors duration-300 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-600/20 flex items-center justify-center mb-4 group-hover:from-pink-500/30 group-hover:to-purple-600/30 transition-colors">
                    <CheckCircle2 className="w-5 h-5 text-pink-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        {/* Process Timeline */}
        <section className="py-20 bg-[#030014]/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Quy trình thực hiện
              </h2>
              <p className="text-gray-400 mt-3">
                Từng bước rõ ràng, minh bạch từ đầu đến cuối
              </p>
            </div>

            <div className="space-y-0">
              {service.process.map((step, idx) => (
                <div key={idx} className="flex gap-6 group">
                  {/* Timeline line + dot */}
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-[0_0_15px_rgba(236,72,153,0.3)]">
                      {step.step}
                    </div>
                    {idx < service.process.length - 1 && (
                      <div className="w-px h-full bg-gradient-to-b from-pink-500/30 to-purple-600/10 min-h-[60px]" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="pb-10">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {step.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        {service.faqs.length > 0 && (
          <section className="py-20">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                  Câu hỏi thường gặp
                </h2>
                <p className="text-gray-400 mt-3">
                  Giải đáp những thắc mắc phổ biến nhất
                </p>
              </div>

              <div className="space-y-4">
                {service.faqs.map((faq, idx) => (
                  <details
                    key={idx}
                    className="group glass-card border border-white/5 rounded-xl overflow-hidden bg-[#0d0b21]/45"
                  >
                    <summary className="flex items-center justify-between cursor-pointer p-5 text-white font-medium text-sm sm:text-base hover:bg-white/5 transition-colors list-none">
                      <span className="pr-4">{faq.question}</span>
                      <ChevronDown className="w-5 h-5 text-gray-400 shrink-0 group-open:rotate-180 transition-transform duration-200" />
                    </summary>
                    <div className="px-5 pb-5 text-gray-400 text-sm leading-relaxed border-t border-white/5 pt-4">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-20 bg-[#030014]/50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="glass-card border border-white/10 rounded-2xl p-10 bg-gradient-to-br from-purple-950/30 to-pink-950/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(236,72,153,0.08),transparent_70%)]" />
              <div className="relative z-10 space-y-6">
                <Zap className="w-12 h-12 text-pink-500 mx-auto" />
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                  {service.ctaText}
                </h2>
                <p className="text-gray-400 max-w-md mx-auto">
                  Liên hệ ngay để nhận tư vấn miễn phí và báo giá chi tiết cho
                  dự án của bạn.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href="/lien-he">
                    <Button variant="primary" className="gap-2">
                      <MessageCircle className="w-4 h-4" />
                      Liên hệ ngay
                    </Button>
                  </Link>
                  <a
                    href={zaloUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button variant="outline" className="gap-2">
                      Chat Zalo
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
