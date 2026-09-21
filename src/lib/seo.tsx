export {
  createMetadata,
  createMetadataFromSeoFields,
  createSitewideMetadata,
} from "./seo/metadata";
export * from "./seo/schema";
export * from "./seo/url";

export function serializeJsonLd(
  data: Record<string, unknown> | Record<string, unknown>[],
) {
  return JSON.stringify(data).replace(/<\/script/gi, "\\u003c/script");
}

export function JsonLd({
  data,
}: {
  data: Record<string, unknown> | Record<string, unknown>[];
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: serializeJsonLd(data),
      }}
    />
  );
}
