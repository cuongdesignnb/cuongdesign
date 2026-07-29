export function mergeContentDefaults<T>(defaults: T, candidate: unknown): T {
  if (Array.isArray(defaults)) {
    return (Array.isArray(candidate) ? candidate : defaults) as T;
  }

  if (defaults && typeof defaults === "object") {
    const source =
      candidate && typeof candidate === "object" && !Array.isArray(candidate)
        ? (candidate as Record<string, unknown>)
        : {};

    return Object.fromEntries(
      Object.entries(defaults as Record<string, unknown>).map(([key, value]) => [
        key,
        mergeContentDefaults(value, source[key]),
      ]),
    ) as T;
  }

  return (candidate === undefined || candidate === null ? defaults : candidate) as T;
}
