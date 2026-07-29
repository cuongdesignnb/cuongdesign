import type { GlobalContent } from "@/content/defaults/global";
import { schemaIds } from "./ids";
import { compact, publicIdentity } from "./shared";

export function buildPersonSchema(global?: GlobalContent) {
  const identity = publicIdentity(global);
  return compact({
    "@type": "Person",
    "@id": schemaIds.person(),
    name: identity.personName,
    alternateName: identity.alternateName,
    url: identity.siteUrl,
    image: identity.image,
    jobTitle: identity.jobTitle,
    sameAs: identity.sameAs,
    email: identity.email,
    telephone: identity.phone,
    address: {
      "@type": "PostalAddress",
      addressLocality: identity.address,
      addressCountry: "VN",
    },
  });
}
