import { siteConfig } from "@/data/site";

export const globalContentDefaults = {
  brand: {
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    logoLightMedia: "",
    logoDarkMedia: "",
    faviconMedia: "",
    defaultOgMedia: siteConfig.ogImage,
    websiteUrl: siteConfig.url,
  },
  author: {
    name: siteConfig.author.name,
    alternateName: siteConfig.author.alternateName,
    jobTitle: siteConfig.author.jobTitle,
    avatarMedia: siteConfig.author.image,
  },
  contact: {
    email: siteConfig.contact.email,
    phone: siteConfig.contact.phone,
    zalo: siteConfig.contact.zalo,
    address: siteConfig.contact.location,
    serviceArea: siteConfig.areaServed.join(", "),
  },
  social: {
    facebook: siteConfig.contact.facebook,
    github: siteConfig.contact.github,
    linkedin: "",
  },
  seo: {
    title: siteConfig.title,
    description: siteConfig.description,
    keywords: siteConfig.keywords.join(", "),
    ogTitle: siteConfig.title,
    ogDescription: siteConfig.description,
    ogAlt: siteConfig.defaultOG.alt,
  },
  structuredData: {
    foundingDate: siteConfig.foundingDate,
    locale: siteConfig.locale,
    language: siteConfig.language,
  },
};

export type GlobalContent = typeof globalContentDefaults;
