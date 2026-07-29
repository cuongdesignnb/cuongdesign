import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo/url";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/api/",
        "/login",
        "/preview/",
        "/draft/",
        "/thanh-toan/",
        "/download/",
      ],
    },
    host: siteUrl,
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
