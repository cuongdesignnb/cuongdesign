import { siteConfig } from "@/data/site";

function cleanSiteUrl(value: string) {
  const url = new URL(value);
  url.protocol = "https:";
  url.pathname = "";
  url.search = "";
  url.hash = "";
  return url.toString().replace(/\/$/, "");
}

export function getSiteUrl(): string {
  return cleanSiteUrl(
    process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.SITE_URL ||
      siteConfig.url ||
      "https://cuongdesign.net",
  );
}

export function normalizeCanonicalPath(pathOrUrl: string): string {
  const siteUrl = getSiteUrl();
  const input = pathOrUrl.trim() || "/";
  const parsed = new URL(input, `${siteUrl}/`);

  if (parsed.origin !== new URL(siteUrl).origin) {
    return "/";
  }

  const pathname = `/${parsed.pathname}`
    .replace(/\/{2,}/g, "/")
    .replace(/\/$/, "") || "/";

  return pathname;
}

export function absoluteUrl(pathOrUrl: string): string {
  const siteUrl = getSiteUrl();
  if (!pathOrUrl) return siteUrl;

  try {
    const parsed = new URL(pathOrUrl);
    if (parsed.origin !== new URL(siteUrl).origin) return siteUrl;
    return `${siteUrl}${normalizeCanonicalPath(parsed.pathname)}`;
  } catch {
    const path = normalizeCanonicalPath(pathOrUrl);
    return path === "/" ? siteUrl : `${siteUrl}${path}`;
  }
}
