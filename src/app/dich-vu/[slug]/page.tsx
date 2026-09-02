import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  MessageCircle,
  Sparkles,
  Zap,
} from "lucide-react";
import { getPublishedService } from "@/lib/content/get-service-content";
import { getPublishedContent } from "@/lib/content/get-content";
import {
  buildBreadcrumbSchema,
  buildServiceSchema,
  buildWebPageSchema,
  createMetadataFromSeoFields,
  JsonLd,
  resolveCanonicalPath,
} from "@/lib/seo";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { resolveSeoRedirect } from "@/lib/seo/resolve-redirect";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await getPublishedService(slug);
  if (!service) return { robots: { index: false, follow: false } };
  return createMetadataFromSeoFields({
    seo: {
      title: service.seoTitle || undefined,
      description: service.seoDescription || undefined,
      keywords: service.seoKeywords,
      canonicalPath: service.canonicalPath || undefined,
      ogTitle: service.ogTitle || undefined,
      ogDescription: service.ogDescription || undefined,
      ogImage: service.ogImage || undefined,
      robotsIndex: service.robotsIndex,
      robotsFollow: service.robotsFollow,
    },
    fallback: {
      title: service.title,
      description: service.shortDescription,
      image: service.coverMedia?.url,
    },
    path: `/dich-vu/${slug}`,
    publishedTime: service.publishedAt
      ? new Date(service.publishedAt).toISOString()
      : undefined,
    modifiedTime: service.updatedAt
      ? new Date(service.updatedAt).toISOString()
      : undefined,
  });
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const [service, global] = await Promise.all([
    getPublishedService(slug),
    getPublishedContent("global"),
  ]);
  if (!service) {
    await resolveSeoRedirect(`/dich-vu/${slug}`);
    notFound();
  }

  const canonicalPath = resolveCanonicalPath(
    service.canonicalPath,
    `/dich-vu/${service.slug}`,
  );

  const serviceSchema = {
    "@context": "https://schema.org",
    "@graph": [
      buildWebPageSchema({
        path: canonicalPath,
        name: service.title,
        description: service.shortDescription,
      }),
      buildServiceSchema({
        slug: service.slug,
        path: canonicalPath,
        name: service.title,
        description: service.seoDescription || service.shortDescription,
        image: service.coverMedia?.url,
        priceText: service.priceText,
      }),
      buildBreadcrumbSchema([
        { name: "Trang chủ", href: "/" },
        { name: "Dịch vụ", href: "/dich-vu" },
        { name: service.title, href: canonicalPath },
      ]),
      ...(service.faqs.length
        ? [{
            "@type": "FAQPage",
            mainEntity: service.faqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer.replace(/<[^>]+>/g, "") },
            })),
          }]
        : []),
    ],
  };

  return (
    <div className="min-h-screen bg-[#030014] text-gray-200 flex flex-col">
      <JsonLd data={serviceSchema} />
      <Header />
      <main className="flex-1 bg-[#030014] relative overflow-hidden">
        <section className="pt-32 pb-16 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-950/20 via-transparent to-transparent" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <Breadcrumbs items={[{ label: "Dịch vụ", href: "/dich-vu" }, { label: service.title, href: `/dich-vu/${slug}` }]} />
            <div className="mt-8 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5" /><span>Dịch vụ chuyên nghiệp</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">{service.title}</h1>
              <div className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-3xl" dangerouslySetInnerHTML={{ __html: service.heroContent }} />
              <div className="flex flex-wrap gap-4 pt-2">
                <Link href="/lien-he"><Button variant="primary" className="gap-2"><MessageCircle className="w-4 h-4" />Liên hệ báo giá</Button></Link>
                <Link href="/du-an"><Button variant="outline" className="gap-2">Xem dự án mẫu<ArrowRight className="w-4 h-4" /></Button></Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12"><h2 className="text-2xl sm:text-3xl font-bold text-white">Tính năng & Ưu điểm nổi bật</h2><p className="text-gray-400 mt-3 max-w-2xl mx-auto">Những gì bạn nhận được khi sử dụng dịch vụ này</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {service.features.map((feature) => (
                <GlassCard key={feature.title} className="p-6 border-white/5 bg-[#0d0b21]/45 hover:border-pink-500/25 transition-colors duration-300 group">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-600/20 flex items-center justify-center mb-4"><CheckCircle2 className="w-5 h-5 text-pink-400" /></div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-[#030014]/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12"><h2 className="text-2xl sm:text-3xl font-bold text-white">Quy trình thực hiện</h2><p className="text-gray-400 mt-3">Từng bước rõ ràng, minh bạch từ đầu đến cuối</p></div>
            <div className="space-y-4">
              {service.process.map((step) => (
                <div key={step.step} className="flex gap-5 p-5 rounded-xl border border-white/5 bg-[#0d0b21]/45">
                  <div className="w-10 h-10 shrink-0 rounded-full bg-pink-500/10 text-pink-400 flex items-center justify-center font-bold text-sm">{step.step}</div>
                  <div><h3 className="text-white font-semibold">{step.title}</h3><p className="text-gray-400 text-sm leading-relaxed mt-1">{step.description}</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {service.faqs.length > 0 && (
          <section className="py-20">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-10"><h2 className="text-2xl sm:text-3xl font-bold text-white">Câu hỏi thường gặp</h2></div>
              <div className="space-y-3">
                {service.faqs.map((faq) => (
                  <details key={faq.question} className="group border border-white/5 rounded-xl overflow-hidden bg-[#0d0b21]/45">
                    <summary className="flex items-center justify-between cursor-pointer p-5 text-white font-medium text-sm sm:text-base hover:bg-white/5 transition-colors list-none"><span className="pr-4">{faq.question}</span><ChevronDown className="w-5 h-5 text-gray-400 shrink-0 group-open:rotate-180 transition-transform duration-200" /></summary>
                    <div className="px-5 pb-5 text-gray-400 text-sm leading-relaxed border-t border-white/5 pt-4" dangerouslySetInnerHTML={{ __html: faq.answer }} />
                  </details>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="py-20 bg-[#030014]/50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="glass-card border border-white/10 rounded-2xl p-10 bg-gradient-to-br from-purple-950/30 to-pink-950/20 relative overflow-hidden">
              <div className="relative z-10 space-y-6">
                <Zap className="w-12 h-12 text-pink-500 mx-auto" />
                <h2 className="text-2xl sm:text-3xl font-bold text-white">{service.ctaText}</h2>
                <p className="text-gray-400 max-w-md mx-auto">Liên hệ ngay để nhận tư vấn miễn phí và báo giá chi tiết cho dự án của bạn.</p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href="/lien-he"><Button variant="primary" className="gap-2"><MessageCircle className="w-4 h-4" />Liên hệ ngay</Button></Link>
                  <a href={global.contact.zalo} target="_blank" rel="noreferrer"><Button variant="outline" className="gap-2">Chat Zalo<ArrowRight className="w-4 h-4" /></Button></a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
