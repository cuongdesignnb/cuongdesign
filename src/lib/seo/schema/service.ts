import { absoluteUrl } from "../url";
import { schemaIds } from "./ids";
import { compact, plainText } from "./shared";

export function buildServiceSchema(input: {
  slug: string;
  name: string;
  description: string;
  image?: string | null;
  priceText?: string | null;
}) {
  const path = `/dich-vu/${input.slug}`;
  return compact({
    "@type": "Service",
    "@id": schemaIds.entity(path, "service"),
    url: absoluteUrl(path),
    name: input.name,
    description: plainText(input.description),
    image: input.image ? absoluteUrl(input.image) : undefined,
    provider: { "@id": schemaIds.business() },
    areaServed: "Việt Nam",
  });
}
