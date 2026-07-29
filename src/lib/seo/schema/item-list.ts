import { absoluteUrl } from "../url";

export function buildItemListSchema(
  items: { name: string; url: string; description?: string; image?: string }[],
) {
  return {
    "@type": "ItemList",
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(item.url),
      name: item.name,
    })),
  };
}
