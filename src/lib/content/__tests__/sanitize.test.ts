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

test("sanitizeContentTree strips H1 while retaining service body markup", () => {
  const result = sanitizeContentTree({ bodyContent: "<h1>Not a second H1</h1><h2>Section</h2>" });

  assert.doesNotMatch(result.bodyContent, /<h1\b/i);
  assert.match(result.bodyContent, /<h2>Section<\/h2>/);
});

test("service body keeps local media dimensions and lazy loading while removing unsafe HTML", () => {
  const result = sanitizeContentTree({
    bodyContent: '<script>alert("x")</script><h1>Extra title</h1><h2>Section</h2><h3>Details</h3><p><a href="javascript:alert(1)" onclick="alert(1)">Unsafe link</a></p><img src="/uploads/p01/example.webp" alt="Minh họa website doanh nghiệp" width="1200" height="800" loading="lazy" onerror="alert(1)" />',
  });
  const html = result.bodyContent;

  assert.doesNotMatch(html, /<script\b|alert\("x"\)|onerror\s*=|onclick\s*=|javascript:/i);
  assert.doesNotMatch(html, /<h1\b/i);
  assert.match(html, /<h2>Section<\/h2>/);
  assert.match(html, /<h3>Details<\/h3>/);
  assert.match(html, /src="\/uploads\/p01\/example\.webp"/);
  assert.match(html, /alt="Minh họa website doanh nghiệp"/);
  assert.match(html, /width="1200"/);
  assert.match(html, /height="800"/);
  assert.match(html, /loading="lazy"/);
});
