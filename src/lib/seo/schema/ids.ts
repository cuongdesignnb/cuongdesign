import { absoluteUrl, getSiteUrl, normalizeCanonicalPath } from "../url";

function entityId(path: string, fragment: string) {
  const url = absoluteUrl(normalizeCanonicalPath(path));
  const rootSlash = url === getSiteUrl() ? "/" : "";
  return `${url}${rootSlash}#${fragment.replace(/^#/, "")}`;
}

export const schemaIds = {
  website: () => `${getSiteUrl()}/#website`,
  person: () => `${getSiteUrl()}/#person`,
  business: () => `${getSiteUrl()}/#business`,
  webpage: (path: string) => entityId(path, "webpage"),
  entity: (path: string, fragment: string) => entityId(path, fragment),
};
