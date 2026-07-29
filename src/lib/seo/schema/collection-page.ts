import { absoluteUrl } from "../url";
import { schemaIds } from "./ids";
import { buildItemListSchema } from "./item-list";
import { compact, plainText } from "./shared";

export function buildCollectionPageSchema(input: {
  path: string;
  name: string;
  description?: string;
  items: { name: string; url: string; description?: string; image?: string }[];
  type?: "CollectionPage" | "Blog";
}) {
  return compact({
    "@context": "https://schema.org",
    "@type": input.type || "CollectionPage",
    "@id": schemaIds.webpage(input.path),
    url: absoluteUrl(input.path),
    name: input.name,
    description: input.description ? plainText(input.description) : undefined,
    isPartOf: { "@id": schemaIds.website() },
    mainEntity: buildItemListSchema(input.items),
  });
}
