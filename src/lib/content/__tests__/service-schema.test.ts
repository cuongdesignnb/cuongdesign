import assert from "node:assert/strict";
import test from "node:test";
import { serviceContentSchema } from "@/content/schemas";
import { sanitizeContentTree } from "@/lib/content/sanitize";

const validService = {
  slug: "website-doanh-nghiep",
  title: "Website doanh nghiệp",
  shortDescription: "Mô tả dịch vụ",
  heroContent: "<p>Nội dung giới thiệu</p>",
  features: [],
  process: [],
  faqs: [],
};

test("serviceContentSchema normalizes an empty cover media id to null", () => {
  const result = serviceContentSchema.parse({ ...validService, coverMediaId: "" });

  assert.equal(result.coverMediaId, null);
});

test("serviceContentSchema preserves a selected cover media id", () => {
  const result = serviceContentSchema.parse({ ...validService, coverMediaId: "media-123" });

  assert.equal(result.coverMediaId, "media-123");
});

test("serviceContentSchema defaults body content for existing service records", () => {
  const result = serviceContentSchema.parse(validService);

  assert.equal(result.bodyContent, "");
});

test("serviceContentSchema normalizes a null body to empty content", () => {
  const result = serviceContentSchema.parse({ ...validService, bodyContent: null });

  assert.equal(result.bodyContent, "");
});

test("service body content keeps sanitized headings, links, and images", () => {
  const result = serviceContentSchema.parse(sanitizeContentTree({
    ...validService,
    bodyContent: '<h2>Quy trình</h2><h3>Thiết kế</h3><p><a href="/quy-trinh">Xem quy trình</a></p><img src="https://cuongdesign.net/example.webp" alt="Minh họa website" />',
  }));

  assert.match(result.bodyContent, /<h2>Quy trình<\/h2>/);
  assert.match(result.bodyContent, /<h3>Thiết kế<\/h3>/);
  assert.match(result.bodyContent, /href="\/quy-trinh"/);
  assert.match(result.bodyContent, /alt="Minh họa website"/);
  assert.doesNotMatch(result.bodyContent, /<h1\b/i);
});
