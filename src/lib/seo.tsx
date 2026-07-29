export { createMetadata, createMetadataFromSeoFields } from "./seo/metadata";
export * from "./seo/schema";
export * from "./seo/url";

export function JsonLd({
  data,
}: {
  data: Record<string, unknown> | Record<string, unknown>[];
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/<\/script/gi, "\\u003c/script"),
      }}
    />
  );
}
