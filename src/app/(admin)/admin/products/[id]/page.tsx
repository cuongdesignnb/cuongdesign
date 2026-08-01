import AdminProductsManager from "@/components/sections/AdminProductsManager";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function EditAdminProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();

  return <AdminProductsManager initialProducts={[]} mediaLibrary={[]} editorOnly editProduct={product} />;
}
