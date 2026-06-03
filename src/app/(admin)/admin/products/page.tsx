import { prisma } from "@/lib/db";
import AdminProductsManager from "@/components/sections/AdminProductsManager";

export default async function AdminProductsPage() {
  // Query all products from PostgreSQL DB
  const productsList = await prisma.product.findMany({
    orderBy: { order: "asc" },
  });

  // Query media list to use as selection options
  const mediaLibrary = await prisma.media.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <AdminProductsManager
      initialProducts={productsList}
      mediaLibrary={mediaLibrary}
    />
  );
}
