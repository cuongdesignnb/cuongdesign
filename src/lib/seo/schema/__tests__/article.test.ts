import test from "node:test";
import assert from "node:assert/strict";
import { buildArticleSchema } from "../article";
import { assertSchema } from "./helpers";

test("BlogPosting schema has author and dates", () => {
  const schema = buildArticleSchema({
    slug: "nextjs-seo",
    headline: "Next.js SEO",
    description: "Hướng dẫn",
    image: "/images/og-image.jpg",
    publishedAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-02"),
    keywords: ["Next.js"],
    content: "Nội dung bài viết",
  });
  assertSchema(schema, "BlogPosting");
  assert.ok(schema.author);
  assert.ok(schema.datePublished);
});
