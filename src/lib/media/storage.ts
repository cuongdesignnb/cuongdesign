import path from "node:path";

const STORAGE_KEY_SEGMENT = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,199}$/;
const MAX_STORAGE_SEGMENTS = 8;

export function resolveMediaStoragePath(storageKey: string | string[]) {
  const segments = Array.isArray(storageKey)
    ? storageKey
    : storageKey.split("/");

  if (
    segments.length === 0 ||
    segments.length > MAX_STORAGE_SEGMENTS ||
    segments.some((segment) => !STORAGE_KEY_SEGMENT.test(segment))
  ) {
    throw new Error("INVALID_MEDIA_STORAGE_PATH");
  }

  const normalizedStorageKey = segments.join("/");
  const uploadDirectory = path.resolve(process.cwd(), "public", "uploads");
  const filePath = path.resolve(uploadDirectory, ...segments);
  if (!filePath.startsWith(`${uploadDirectory}${path.sep}`)) {
    throw new Error("INVALID_MEDIA_STORAGE_PATH");
  }

  return {
    storageKey: normalizedStorageKey,
    uploadDirectory,
    filePath,
  };
}
