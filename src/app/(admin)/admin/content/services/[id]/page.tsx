import ServiceContentForm from "@/components/admin/content/ServiceContentForm";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const emptyService = {
  slug: "",
  title: "",
  subtitle: "",
  shortDescription: "",
  heroContent: "<p></p>",
  iconKey: "",
  colorKey: "pink",
  coverMediaId: "",
  priceText: "",
  durationText: "",
  features: [],
  process: [],
  faqs: [],
  ctaText: "",
  seoTitle: "",
  seoDescription: "",
  seoKeywords: [],
  isPublished: false,
  order: 0,
};

export default async function AdminServiceContentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  if (id === "new") return <ServiceContentForm initial={emptyService} />;

  const service = await prisma.serviceContent.findUnique({ where: { id } });
  if (!service) notFound();

  return (
    <ServiceContentForm
      initial={JSON.parse(
        JSON.stringify({
          ...service,
          subtitle: service.subtitle ?? "",
          iconKey: service.iconKey ?? "",
          colorKey: service.colorKey ?? "",
          coverMediaId: service.coverMediaId ?? "",
          priceText: service.priceText ?? "",
          durationText: service.durationText ?? "",
          ctaText: service.ctaText ?? "",
          seoTitle: service.seoTitle ?? "",
          seoDescription: service.seoDescription ?? "",
        }),
      )}
    />
  );
}
