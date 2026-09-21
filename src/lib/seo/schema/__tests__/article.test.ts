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
  assert.equal(schema.url, "https://cuongdesign.net/bai-viet/nextjs-seo");
  assert.ok(schema.author);
  assert.ok(schema.datePublished);
});

test("BlogPosting schema normalizes the current canonical post URL", () => {
  const schema = buildArticleSchema({
    slug: "legacy-fallback",
    path: "https://www.cuongdesign.net/bai-viet/current-post?utm_source=test",
    headline: "Current post",
    description: "Mô tả",
    image: "/uploads/current-post.webp",
    publishedAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-02T00:00:00.000Z"),
    keywords: [],
    content: "Nội dung",
  });

  assert.equal(schema.url, "https://cuongdesign.net/bai-viet/current-post");
  assert.equal(schema.mainEntityOfPage && (schema.mainEntityOfPage as Record<string, unknown>)["@id"], "https://cuongdesign.net/bai-viet/current-post#webpage");
  assert.doesNotMatch(JSON.stringify(schema), /https?:\/\/www\.|http:\/\/|\/bai-viet\/cong-nghe/);
});
