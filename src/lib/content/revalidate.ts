import { revalidatePath, revalidateTag } from "next/cache";
import { contentRegistry, type ContentKey } from "@/content/registry";

const globalRoutes = [
  "/",
  "/gioi-thieu",
  "/dich-vu",
  "/quy-trinh",
  "/ky-nang",
  "/du-an",
  "/san-pham",
  "/bai-viet",
  "/danh-gia",
  "/lien-he",
];

export function revalidateContentKey(key: ContentKey) {
  revalidateTag(`content:${key}`, "max");
  const route = contentRegistry[key].route;
  if (route) revalidatePath(route);

  if (key === "global" || key === "footer" || key === "system-copy") {
    globalRoutes.forEach((path) => revalidatePath(path));
  }
}

export function revalidateServices(slug?: string) {
  revalidateTag("service-content", "max");
  revalidatePath("/");
  revalidatePath("/dich-vu");
  if (slug) revalidatePath(`/dich-vu/${slug}`);
  revalidatePath("/sitemap.xml");
}
