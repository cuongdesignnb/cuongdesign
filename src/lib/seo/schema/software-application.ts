import { absoluteUrl } from "../url";
import { schemaIds } from "./ids";
import { compact, plainText } from "./shared";

export function buildSoftwareApplicationSchema(input: {
  path: string;
  name: string;
  description: string;
  image?: string | null;
  softwareCategory?: string | null;
  operatingSystem?: string | null;
  version?: string | null;
}) {
  return compact({
    "@type": "SoftwareApplication",
    "@id": schemaIds.entity(input.path, "software"),
    url: absoluteUrl(input.path),
    name: input.name,
    description: plainText(input.description),
    image: input.image ? absoluteUrl(input.image) : undefined,
    applicationCategory: input.softwareCategory,
    operatingSystem: input.operatingSystem,
    softwareVersion: input.version,
    author: { "@id": schemaIds.person() },
  });
}
