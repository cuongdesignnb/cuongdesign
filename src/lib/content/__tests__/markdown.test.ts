import assert from "node:assert/strict";
import test from "node:test";
import { markdownToHtml } from "../markdown";

test("formats AI Markdown as escaped rich HTML", () => {
  const html = markdownToHtml(
    "## Tư vấn nhanh\n\n**Điểm chính**\n\n- Thiết kế rõ ràng\n- [Liên hệ](/lien-he)",
  );

  assert.match(html, /<h2>Tư vấn nhanh<\/h2>/);
  assert.match(html, /<strong>Điểm chính<\/strong>/);
  assert.match(html, /<ul><li>Thiết kế rõ ràng<\/li><li><a href="\/lien-he"/);
});

test("does not allow raw HTML or unsafe Markdown links", () => {
  const html = markdownToHtml("<script>alert(1)</script> [x](javascript:alert(1))");

  assert.match(html, /&lt;script&gt;/);
  assert.doesNotMatch(html, /href="javascript:/);
});
