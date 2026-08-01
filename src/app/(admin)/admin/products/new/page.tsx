import AdminProductsManager from "@/components/sections/AdminProductsManager";
import { prisma } from "@/lib/db";

export default async function NewAdminProductPage() {
  const productCount = await prisma.product.count();

  return (
    <AdminProductsManager
      initialProducts={[]}
      mediaLibrary={[]}
      editorOnly
      initialOrder={productCount}
    />
  );
}
