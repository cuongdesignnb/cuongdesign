import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import PreviewClient from "./PreviewClient";
import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";
import { ToastProvider } from "@/components/ui/Toast";

interface PreviewPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PreviewPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  // Try product first
  let item: any = await prisma.product.findUnique({
    where: { slug },
  });
  let isProject = false;

  if (!item) {
    item = await prisma.project.findUnique({
      where: { slug },
    });
    if (item) {
      isProject = true;
    }
  }

  if (!item || !item.demoUrl) return {};

  const description = isProject
    ? `Xem thử giao diện demo thực tế của dự án ${item.title} được thiết kế và lập trình bởi Cường Design.`
    : `Xem thử giao diện thực tế của sản phẩm ${item.title} trước khi mua hoặc tải về.`;

  return createMetadata({
    title: `Live Preview: ${item.title}`,
    description,
    path: `/preview/${slug}`,
    noIndex: true, // Do not index preview pages in search engines
  });
}

export default async function PreviewPage({ params }: PreviewPageProps) {
  const { slug } = await params;
  
  // Try product first
  let item: any = await prisma.product.findUnique({
    where: { slug },
  });
  let isProject = false;

  if (!item) {
    item = await prisma.project.findUnique({
      where: { slug },
    });
    if (item) {
      isProject = true;
    }
  }

  if (!item || !item.demoUrl) {
    notFound();
  }

  return (
    <ToastProvider>
      <PreviewClient item={JSON.parse(JSON.stringify(item))} isProject={isProject} />
    </ToastProvider>
  );
}
