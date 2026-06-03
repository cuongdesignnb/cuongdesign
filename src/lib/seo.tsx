import type { Metadata } from "next";
import { siteConfig } from "@/data/site";

// ─── Types ──────────────────────────────────────────────
interface CreateMetadataOptions {
  title?: string;
  titleAbsolute?: string; // bypasses template
  description?: string;
  path?: string; // e.g. "/dich-vu" → canonical = baseUrl + path
  keywords?: string[];
  openGraph?: {
    type?: "website" | "article" | "profile";
    images?: { url: string; width?: number; height?: number; alt?: string }[];
    publishedTime?: string;
    modifiedTime?: string;
    authors?: string[];
  };
  robots?: {
    index?: boolean;
    follow?: boolean;
  };
  noIndex?: boolean; // shorthand for robots noindex nofollow
}

// ─── createMetadata Helper ──────────────────────────────
/**
 * Creates a Next.js Metadata object with sensible defaults
 * pulled from siteConfig. Use this on every page to ensure
 * consistent SEO output.
 */
export function createMetadata(options: CreateMetadataOptions = {}): Metadata {
  const {
    title,
    titleAbsolute,
    description = siteConfig.description,
    path = "/",
    keywords = [],
    openGraph = {},
    robots,
    noIndex = false,
  } = options;

  const canonical = `${siteConfig.url}${path}`;
  const mergedKeywords = [...new Set([...siteConfig.keywords, ...keywords])];

  const ogImages = openGraph.images || [
    {
      url: siteConfig.ogImage,
      width: siteConfig.defaultOG.width,
      height: siteConfig.defaultOG.height,
      alt: siteConfig.defaultOG.alt,
    },
  ];

  const titleValue = titleAbsolute
    ? { absolute: titleAbsolute }
    : title || siteConfig.title;

  const robotsConfig = noIndex
    ? { index: false, follow: false }
    : robots || {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1 as const,
          "max-image-preview": "large" as const,
          "max-snippet": -1 as const,
        },
      };

  return {
    title: titleValue,
    description,
    keywords: mergedKeywords,
    authors: [{ name: siteConfig.author.name, url: siteConfig.author.url }],
    creator: siteConfig.legalName,
    publisher: siteConfig.legalName,
    alternates: {
      canonical,
    },
    openGraph: {
      title: titleAbsolute || title || siteConfig.title,
      description,
      url: canonical,
      siteName: siteConfig.legalName,
      locale: siteConfig.locale,
      type: openGraph.type || "website",
      images: ogImages,
      ...(openGraph.publishedTime && {
        publishedTime: openGraph.publishedTime,
      }),
      ...(openGraph.modifiedTime && { modifiedTime: openGraph.modifiedTime }),
      ...(openGraph.authors && { authors: openGraph.authors }),
    },
    twitter: {
      card: "summary_large_image",
      title: titleAbsolute || title || siteConfig.title,
      description,
      images: ogImages.map((img) =>
        typeof img === "string" ? img : img.url
      ),
    },
    robots: robotsConfig,
  };
}

// ─── JSON-LD Component ──────────────────────────────────
/**
 * Renders a <script type="application/ld+json"> tag with
 * proper sanitization to prevent XSS via injected </script> tags.
 *
 * Usage in Server Components:
 *   <JsonLd data={mySchemaObject} />
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/<\/script/gi, "\\u003c/script"),
      }}
    />
  );
}

// ─── Schema Builders ────────────────────────────────────

/** WebSite schema with SearchAction */
export function buildWebSiteSchema() {
  return {
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    url: siteConfig.url,
    name: siteConfig.legalName,
    description: siteConfig.description,
    inLanguage: siteConfig.language,
    publisher: { "@id": `${siteConfig.url}/#person` },
  };
}

/** Person schema for the author */
export function buildPersonSchema() {
  return {
    "@type": "Person",
    "@id": `${siteConfig.url}/#person`,
    name: siteConfig.author.name,
    alternateName: siteConfig.author.alternateName,
    url: siteConfig.author.url,
    image: siteConfig.author.image,
    jobTitle: siteConfig.author.jobTitle,
    sameAs: siteConfig.sameAs,
    email: siteConfig.contact.email,
    telephone: siteConfig.contact.phone,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Hồ Chí Minh",
      addressCountry: "VN",
    },
  };
}

/** ProfessionalService schema */
export function buildProfessionalServiceSchema(extra?: {
  aggregateRating?: Record<string, unknown>;
  review?: Record<string, unknown>[];
}) {
  return {
    "@type": "ProfessionalService",
    "@id": `${siteConfig.url}/#business`,
    name: siteConfig.legalName,
    url: siteConfig.url,
    image: siteConfig.author.image,
    description: siteConfig.description,
    founder: { "@id": `${siteConfig.url}/#person` },
    foundingDate: siteConfig.foundingDate,
    areaServed: siteConfig.areaServed.map((area) => ({
      "@type": "City",
      name: area,
    })),
    serviceType: [
      "Thiết kế UI/UX Website",
      "Lập trình Website",
      "Landing Page",
      "SEO & Tối ưu tốc độ",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: siteConfig.contact.phone,
      email: siteConfig.contact.email,
      contactType: "customer service",
      availableLanguage: ["Vietnamese", "English"],
    },
    sameAs: siteConfig.sameAs,
    ...(extra?.aggregateRating && {
      aggregateRating: extra.aggregateRating,
    }),
    ...(extra?.review && { review: extra.review }),
  };
}

/** Build the sitewide @graph array for root layout */
export function buildSitewideGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      buildWebSiteSchema(),
      buildPersonSchema(),
      buildProfessionalServiceSchema(),
    ],
  };
}

/** BreadcrumbList schema from path items */
export function buildBreadcrumbSchema(
  items: { name: string; href: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteConfig.url}${item.href}`,
    })),
  };
}
