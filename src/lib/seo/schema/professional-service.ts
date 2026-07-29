import type { GlobalContent } from "@/content/defaults/global";
import { schemaIds } from "./ids";
import { compact, publicIdentity } from "./shared";

export function buildProfessionalServiceSchema(
  _legacyExtra?: {
    aggregateRating?: Record<string, unknown>;
    review?: Record<string, unknown>[];
  },
  global?: GlobalContent,
) {
  const identity = publicIdentity(global);
  return compact({
    "@type": "ProfessionalService",
    "@id": schemaIds.business(),
    name: identity.brandName,
    url: identity.siteUrl,
    image: identity.image,
    description: identity.description,
    founder: { "@id": schemaIds.person() },
    foundingDate: identity.foundingDate,
    areaServed: identity.areas.map((name) => ({ "@type": "Place", name })),
    serviceType: [
      "Thiết kế UI/UX Website",
      "Lập trình Website",
      "Landing Page",
      "SEO và tối ưu tốc độ",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: identity.phone,
      email: identity.email,
      contactType: "customer service",
      availableLanguage: ["Vietnamese", "English"],
    },
    sameAs: identity.sameAs,
  });
}
