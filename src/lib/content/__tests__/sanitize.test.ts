import assert from "node:assert/strict";
import test from "node:test";
import { sanitizeContentTree } from "../sanitize";

test("sanitizeContentTree preserves Date instances", () => {
  const publishedAt = new Date("2026-07-29T12:00:00.000Z");
  const result = sanitizeContentTree({
    publishedAt,
    content: "<p>Hello<script>alert(1)</script></p>",
  });

  assert.equal(result.publishedAt, publishedAt);
  assert.equal(result.publishedAt.toISOString(), "2026-07-29T12:00:00.000Z");
  assert.equal(result.content, "<p>Hello</p>");
});
