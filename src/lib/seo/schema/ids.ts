import { absoluteUrl, getSiteUrl, normalizeCanonicalPath } from "../url";

export const schemaIds = {
  website: () => `${getSiteUrl()}/#website`,
  person: () => `${getSiteUrl()}/#person`,
  business: () => `${getSiteUrl()}/#business`,
  webpage: (path: string) => `${absoluteUrl(normalizeCanonicalPath(path))}/#webpage`,
  entity: (path: string, fragment: string) =>
    `${absoluteUrl(normalizeCanonicalPath(path))}/#${fragment.replace(/^#/, "")}`,
};
