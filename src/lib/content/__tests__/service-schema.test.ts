import assert from "node:assert/strict";
import test from "node:test";
import { serviceContentSchema } from "@/content/schemas";

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
