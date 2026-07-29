import type { GlobalContent } from "@/content/defaults/global";
import { schemaIds } from "./ids";
import { compact, publicIdentity } from "./shared";

export function buildWebSiteSchema(global?: GlobalContent) {
  const identity = publicIdentity(global);
  return compact({
    "@type": "WebSite",
    "@id": schemaIds.website(),
    url: identity.siteUrl,
    name: identity.brandName,
    description: identity.description,
    inLanguage: identity.language,
    publisher: { "@id": schemaIds.business() },
  });
}
