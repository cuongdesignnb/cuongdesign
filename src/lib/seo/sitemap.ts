import { absoluteUrl, getSiteUrl, resolveCanonicalPath } from "./url";

type SitemapRecord = {
  robotsIndex?: boolean;
  isPublished?: boolean;
  status?: string;
};

export function isSitemapIndexable(record: SitemapRecord): boolean {
  return (
    record.robotsIndex !== false &&
    record.isPublished !== false &&
    (record.status === undefined || record.status === "PUBLISHED")
  );
}

export function sitemapUrl(canonicalPath: string | null | undefined, fallbackPath: string): string {
  return absoluteUrl(resolveCanonicalPath(canonicalPath, fallbackPath));
}

export function sitemapImages(...values: Array<string | string[] | null | undefined>): string[] {
  return [...new Set(values.flatMap((value) => (Array.isArray(value) ? value : [value])))]
    .filter((value): value is string => Boolean(value?.trim()))
    .map((value) => sitemapUrl(value, ""))
    .filter((value) => value !== getSiteUrl());
}

export type DocumentSeoState = {
  canonicalPath: string | null;
  robotsIndex: boolean;
};

export function getDocumentSeoState(data: unknown): DocumentSeoState {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return { canonicalPath: null, robotsIndex: true };
  }

  const metadata = (data as Record<string, unknown>).metadata;
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return { canonicalPath: null, robotsIndex: true };
  }

  const values = metadata as Record<string, unknown>;
  return {
    canonicalPath: typeof values.canonical === "string" ? values.canonical : null,
    robotsIndex: values.robotsIndex !== false,
  };
}

export function dedupeSitemapEntries<T extends { url: string }>(entries: T[]): T[] {
  const seenUrls = new Set<string>();

  return entries.filter((entry) => {
    if (seenUrls.has(entry.url)) return false;
    seenUrls.add(entry.url);
    return true;
  });
}
