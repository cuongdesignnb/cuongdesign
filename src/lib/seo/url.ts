import { CANONICAL_SITE_HOSTNAMES, CANONICAL_SITE_URL } from "@/config/site";

function normalizePathname(pathname: string) {
  return `/${pathname}`.replace(/\/{2,}/g, "/").replace(/\/$/, "") || "/";
}

export function getSiteUrl(): string {
  return CANONICAL_SITE_URL;
}

function internalPath(pathOrUrl: string | null | undefined): string | null {
  if (!pathOrUrl?.trim()) return "/";

  try {
    const parsed = new URL(pathOrUrl.trim(), `${CANONICAL_SITE_URL}/`);
    if (!CANONICAL_SITE_HOSTNAMES.has(parsed.hostname)) return null;
    return normalizePathname(parsed.pathname);
  } catch {
    return null;
  }
}

export function normalizeCanonicalPath(pathOrUrl: string): string {
  return internalPath(pathOrUrl) || "/";
}

export function resolveCanonicalPath(
  pathOrUrl: string | null | undefined,
  fallbackPath: string,
): string {
  return internalPath(pathOrUrl) || normalizeCanonicalPath(fallbackPath);
}

export function absoluteUrl(pathOrUrl: string | null | undefined): string {
  const path = normalizeCanonicalPath(pathOrUrl || "/");
  return path === "/" ? CANONICAL_SITE_URL : `${CANONICAL_SITE_URL}${path}`;
}
