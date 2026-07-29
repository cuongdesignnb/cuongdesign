import { getPublishedContent } from "@/lib/content/get-content";
import HeaderClient from "./HeaderClient";

export default async function Header() {
  const global = await getPublishedContent("global");
  return <HeaderClient brandName={global.brand.name} />;
}
