import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Code2,
  Cpu,
  Globe,
  Layout,
  ShoppingBag,
  Target,
  Zap,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Button from "@/components/ui/Button";
import GlassCard from "@/components/ui/GlassCard";
import GradientText from "@/components/ui/GradientText";
import { buildCollectionPageSchema, createMetadataFromSeoFields, JsonLd } from "@/lib/seo";
import { getPublishedContent } from "@/lib/content/get-content";
import { getPublishedServices } from "@/lib/content/get-service-content";

const icons = { Layout, Globe, Target, ShoppingBag, BarChart3, Zap, Cpu, Code2 };

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPublishedContent("services");
  return createMetadataFromSeoFields({
    seo: content.metadata,
    fallback: {
      title: content.metadata.title,
      description: content.metadata.description,
    },
    path: "/dich-vu",
  });
}

export default async function ServicesPage() {
  const [content, services] = await Promise.all([
    getPublishedContent("services"),
    getPublishedServices(),
  ]);

  const servicesSchema = buildCollectionPageSchema({
    path: "/dich-vu",
    name: content.hero.title,
    description: content.hero.intro,
    items: services.map((service) => ({
      name: service.title,
      description: service.shortDescription,
      image: service.coverMedia?.url,
      url: `/dich-vu/${service.slug}`,
    })),
  });

  return (
    <div className="min-h-screen bg-[#030014] text-gray-200 flex flex-col">
      <JsonLd data={servicesSchema} />
      <Header />
      <main className="grow pt-28 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none select-none z-0" />
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 space-y-10">
          <Breadcrumbs items={[{ label: content.hero.breadcrumb, href: "/dich-vu" }]} />
          <div className="text-left space-y-4 max-w-3xl">
            <span className="text-[10px] text-pink-500 font-mono font-bold tracking-widest uppercase block">{content.hero.badge}</span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-none">
              <GradientText>{content.hero.title}</GradientText>
            </h1>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed">{content.hero.intro}</p>
          </div>

          <div className="grid grid-cols-1 gap-10">
            {services.map((service) => {
              const Icon = icons[service.iconKey as keyof typeof icons] || Code2;
              return (
                <GlassCard key={service.id} className="p-8 md:p-10 border-white/5 bg-[#0a0822]/60 hover:border-pink-500/25 transition-all duration-300 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-pink-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
                    <div className="lg:col-span-7 space-y-4 text-left">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 shrink-0 shadow-inner"><Icon className="w-6 h-6" /></div>
                        <div>
                          <h2 className="text-xl md:text-2xl font-bold text-white leading-tight">{service.title}</h2>
                          {service.subtitle && <span className="text-[10px] text-gray-500 font-mono tracking-wider block uppercase mt-0.5">{service.subtitle}</span>}
                        </div>
                      </div>
                      <p className="text-gray-400 text-sm md:text-base leading-relaxed pt-2">{service.shortDescription}</p>
                      <div className="pt-4 space-y-2.5">
                        <h3 className="text-xs font-extrabold text-white tracking-widest uppercase text-gray-400 mb-3">{content.labels.features}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {service.features.slice(0, 6).map((feature) => (
                            <div key={feature.title} className="flex items-start gap-2.5 text-xs text-gray-300"><CheckCircle2 className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" /><span>{feature.title}</span></div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-5 bg-[#07051a]/60 border border-white/5 p-6 rounded-xl flex flex-col justify-between space-y-6 text-left">
                      <div className="space-y-4">
                        <div className="flex justify-between items-baseline"><span className="text-xs text-gray-500 font-mono uppercase">{content.labels.price}:</span><span className="text-lg font-bold text-pink-400">{service.priceText || "Liên hệ"}</span></div>
                        <div className="flex justify-between items-baseline border-t border-white/5 pt-3"><span className="text-xs text-gray-500 font-mono uppercase">{content.labels.duration}:</span><span className="text-xs font-semibold text-white">{service.durationText || "Theo phạm vi"}</span></div>
                      </div>
                      <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row gap-3">
                        <Link href={`/dich-vu/${service.slug}`} className="flex-1"><Button variant="outline" className="w-full text-white font-semibold">{content.labels.detail}</Button></Link>
                        <Link href="/lien-he" className="flex-1"><Button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold flex items-center justify-center gap-2"><span>{content.labels.quote}</span><ArrowRight className="w-4 h-4" /></Button></Link>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>

          <GlassCard className="p-8 border-white/5 bg-[#0a0822]/60 text-center space-y-6 max-w-3xl mx-auto rounded-2xl border border-pink-500/10">
            <h2 className="text-xl md:text-2xl font-bold text-white">{content.cta.title}</h2>
            <div className="text-gray-400 text-sm max-w-lg mx-auto" dangerouslySetInnerHTML={{ __html: content.cta.content }} />
            <Link href={content.cta.url}><Button className="bg-pink-600 hover:bg-pink-500 px-8 font-bold">{content.cta.label}</Button></Link>
          </GlassCard>
        </div>
      </main>
      <Footer />
    </div>
  );
}
