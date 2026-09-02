import assert from "node:assert/strict";
import test from "node:test";
import {
  dedupeSitemapEntries,
  getDocumentCanonicalPath,
  isSitemapIndexable,
  sitemapImages,
  sitemapUrl,
} from "../../sitemap";

test("sitemap URLs use the canonical HTTPS non-www origin", () => {
  assert.equal(
    sitemapUrl("http://www.cuongdesign.net/bai-viet/bai-viet-a?utm_source=test", "/fallback"),
    "https://cuongdesign.net/bai-viet/bai-viet-a",
  );
  assert.equal(
    sitemapUrl("https://example.com/not-allowed", "/gioi-thieu"),
    "https://cuongdesign.net/gioi-thieu",
  );
});

test("sitemap excludes non-indexable publication states", () => {
  assert.equal(isSitemapIndexable({ status: "PUBLISHED", robotsIndex: true }), true);
  assert.equal(isSitemapIndexable({ status: "DRAFT", robotsIndex: true }), false);
  assert.equal(isSitemapIndexable({ isPublished: false, robotsIndex: true }), false);
  assert.equal(isSitemapIndexable({ isPublished: true, robotsIndex: false }), false);
});

test("sitemap normalizes canonical overrides and removes duplicate URLs", () => {
  const entries = dedupeSitemapEntries([
    { url: sitemapUrl("/gioi-thieu/", "/fallback") },
    { url: sitemapUrl("https://www.cuongdesign.net/gioi-thieu?source=menu", "/fallback") },
    { url: sitemapUrl(undefined, "/dich-vu") },
  ]);

  assert.deepEqual(entries.map((entry) => entry.url), [
    "https://cuongdesign.net/gioi-thieu",
    "https://cuongdesign.net/dich-vu",
  ]);
});

test("sitemap honors static Content Hub canonical overrides", () => {
  assert.equal(
    sitemapUrl(
      getDocumentCanonicalPath({
        metadata: { canonical: "https://www.cuongdesign.net/gioi-thieu/" },
      }),
      "/gioi-thieu",
    ),
    "https://cuongdesign.net/gioi-thieu",
  );
});

test("image sitemap entries only retain local canonical media URLs", () => {
  assert.deepEqual(
    sitemapImages(
      "/uploads/cover.webp?cache=1",
      "https://www.cuongdesign.net/uploads/second.webp",
      "https://example.com/external.webp",
    ),
    [
      "https://cuongdesign.net/uploads/cover.webp",
      "https://cuongdesign.net/uploads/second.webp",
    ],
  );
});
