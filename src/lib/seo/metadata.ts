import type { Metadata } from "next";
import type { SeoValue } from "@/components/admin/content/SeoFields";
import { siteConfig } from "@/data/site";
import { absoluteUrl, getSiteUrl, normalizeCanonicalPath } from "./url";

export interface SeoImage {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
}

export interface CreateMetadataOptions {
  title?: string;
  titleAbsolute?: string;
  description?: string;
  keywords?: string[];
  path?: string;
  canonicalPath?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImages?: SeoImage[];
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImages?: string[];
  robotsIndex?: boolean;
  robotsFollow?: boolean;
  noIndex?: boolean;
  type?: "website" | "article" | "profile";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  openGraph?: {
    type?: "website" | "article" | "profile";
    images?: SeoImage[];
    publishedTime?: string;
    modifiedTime?: string;
    authors?: string[];
  };
  robots?: { index?: boolean; follow?: boolean };
}

export function createMetadata(options: CreateMetadataOptions = {}): Metadata {
  const legacyOg = options.openGraph || {};
  const path = normalizeCanonicalPath(options.canonicalPath || options.path || "/");
  const canonical = absoluteUrl(path);
  const description = options.description || siteConfig.description;
  const title = options.titleAbsolute || options.title || siteConfig.title;
  const index = options.noIndex ? false : options.robotsIndex ?? options.robots?.index ?? true;
  const follow = options.noIndex ? false : options.robotsFollow ?? options.robots?.follow ?? true;
  const images = (options.ogImages || legacyOg.images || [
    {
      url: siteConfig.ogImage,
      width: siteConfig.defaultOG.width,
      height: siteConfig.defaultOG.height,
      alt: siteConfig.defaultOG.alt,
    },
  ]).map((image) => ({ ...image, url: absoluteUrl(image.url) }));
  const type = options.type || legacyOg.type || "website";
  const publishedTime = options.publishedTime || legacyOg.publishedTime;
  const modifiedTime = options.modifiedTime || legacyOg.modifiedTime;
  const authors = options.authors || legacyOg.authors;

  return {
    metadataBase: new URL(getSiteUrl()),
    title: options.titleAbsolute ? { absolute: options.titleAbsolute } : options.title || siteConfig.title,
    description,
    keywords: [...new Set([...siteConfig.keywords, ...(options.keywords || [])])],
    authors: [{ name: "Đinh Cường", url: absoluteUrl("/gioi-thieu") }],
    creator: "Đinh Cường",
    publisher: "Cường Design",
    alternates: { canonical },
    openGraph: {
      title: options.ogTitle || title,
      description: options.ogDescription || description,
      url: canonical,
      siteName: "Cường Design",
      locale: siteConfig.locale,
      type,
      images,
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(authors && { authors }),
    },
    twitter: {
      card: "summary_large_image",
      title: options.twitterTitle || options.ogTitle || title,
      description: options.twitterDescription || options.ogDescription || description,
      images: options.twitterImages || images.map((image) => image.url),
    },
    robots: {
      index,
      follow,
      googleBot: {
        index,
        follow,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

interface MetadataFromSeoFieldsOptions {
  seo?: SeoValue | null;
  fallback: {
    title: string;
    description: string;
    keywords?: string[];
    image?: string;
  };
  path: string;
  type?: "website" | "article" | "profile";
  publishedTime?: string;
  modifiedTime?: string;
}

export function createMetadataFromSeoFields({
  seo,
  fallback,
  path,
  type,
  publishedTime,
  modifiedTime,
}: MetadataFromSeoFieldsOptions): Metadata {
  const keywords = Array.isArray(seo?.keywords)
    ? seo.keywords
    : String(seo?.keywords || "").split(",").map((item) => item.trim()).filter(Boolean);
  const image = seo?.ogImage || seo?.ogMedia || fallback.image;

  return createMetadata({
    title: seo?.title || fallback.title,
    description: seo?.description || fallback.description,
    keywords: keywords.length ? keywords : fallback.keywords,
    path,
    canonicalPath: seo?.canonicalPath || seo?.canonical,
    ogTitle: seo?.ogTitle,
    ogDescription: seo?.ogDescription,
    ogImages: image ? [{ url: image, alt: seo?.ogTitle || fallback.title }] : undefined,
    robotsIndex: seo?.robotsIndex,
    robotsFollow: seo?.robotsFollow,
    type,
    publishedTime,
    modifiedTime,
  });
}
