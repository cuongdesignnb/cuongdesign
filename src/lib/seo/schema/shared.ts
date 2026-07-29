import type { GlobalContent } from "@/content/defaults/global";
import { siteConfig } from "@/data/site";
import { absoluteUrl, getSiteUrl } from "../url";

export type SchemaNode = Record<string, unknown>;

export function compact<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(compact).filter((item) => item !== undefined) as T;
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, item]) => item !== undefined && item !== null && item !== "")
        .map(([key, item]) => [key, compact(item)]),
    ) as T;
  }
  return value;
}

export function plainText(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function publicIdentity(global?: GlobalContent) {
  const siteUrl = getSiteUrl();
  return {
    siteUrl,
    brandName: global?.brand.legalName || "Cường Design",
    logoName: global?.brand.name || "CUONG DESIGN",
    description: global?.seo.description || siteConfig.description,
    language: global?.structuredData.language || "vi",
    personName: global?.author.name || "Đinh Cường",
    alternateName: global?.author.alternateName || "Cường Design",
    image: absoluteUrl(global?.author.avatarMedia || siteConfig.author.image),
    jobTitle: global?.author.jobTitle || "Freelancer Developer & UI/UX Designer",
    email: global?.contact.email || siteConfig.contact.email,
    phone: global?.contact.phone || siteConfig.contact.phone,
    address: global?.contact.address || siteConfig.contact.location,
    foundingDate: global?.structuredData.foundingDate || siteConfig.foundingDate,
    areas: global
      ? global.contact.serviceArea.split(",").map((area) => area.trim()).filter(Boolean)
      : siteConfig.areaServed,
    sameAs: global
      ? [global.social.facebook, global.social.github, global.social.linkedin].filter(Boolean)
      : siteConfig.sameAs,
  };
}
