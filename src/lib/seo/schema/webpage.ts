import { absoluteUrl } from "../url";
import { schemaIds } from "./ids";
import { compact, plainText } from "./shared";

export function buildWebPageSchema(input: {
  path: string;
  name: string;
  description?: string;
  type?: string;
  mainEntity?: Record<string, unknown>;
}) {
  return compact({
    "@context": "https://schema.org",
    "@type": input.type || "WebPage",
    "@id": schemaIds.webpage(input.path),
    url: absoluteUrl(input.path),
    name: input.name,
    description: input.description ? plainText(input.description) : undefined,
    isPartOf: { "@id": schemaIds.website() },
    about: { "@id": schemaIds.person() },
    publisher: { "@id": schemaIds.business() },
    mainEntity: input.mainEntity,
  });
}
