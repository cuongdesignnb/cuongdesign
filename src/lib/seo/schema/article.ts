import { absoluteUrl } from "../url";
import { schemaIds } from "./ids";
import { compact, plainText } from "./shared";

export function buildArticleSchema(input: {
  slug: string;
  path?: string;
  headline: string;
  description: string;
  image: string;
  publishedAt: Date;
  updatedAt: Date;
  section?: string | null;
  keywords: string[];
  content: string;
}) {
  const path = input.path || `/bai-viet/${input.slug}`;
  const wordCount = plainText(input.content).split(/\s+/).filter(Boolean).length;
  return compact({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": schemaIds.entity(path, "article"),
    mainEntityOfPage: { "@id": schemaIds.webpage(path) },
    isPartOf: { "@id": schemaIds.website() },
    url: absoluteUrl(path),
    headline: input.headline,
    description: plainText(input.description),
    image: absoluteUrl(input.image),
    author: { "@id": schemaIds.person() },
    publisher: { "@id": schemaIds.business() },
    datePublished: input.publishedAt.toISOString(),
    dateModified: input.updatedAt.toISOString(),
    articleSection: input.section,
    keywords: input.keywords,
    wordCount,
    timeRequired: `PT${Math.max(1, Math.ceil(wordCount / 220))}M`,
  });
}
