import assert from "node:assert/strict";
import test from "node:test";
import {
  dedupeSitemapEntries,
  getDocumentSeoState,
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

test("static Content Hub SEO state defaults to indexable and normalizes canonicals", () => {
  assert.deepEqual(getDocumentSeoState(null), { canonicalPath: null, robotsIndex: true });
  assert.deepEqual(getDocumentSeoState("malformed"), { canonicalPath: null, robotsIndex: true });
  assert.deepEqual(getDocumentSeoState({ metadata: {} }), { canonicalPath: null, robotsIndex: true });
  assert.deepEqual(getDocumentSeoState({ metadata: { canonical: "/gioi-thieu" } }), {
    canonicalPath: "/gioi-thieu",
    robotsIndex: true,
  });
  assert.deepEqual(getDocumentSeoState({ metadata: { robotsIndex: false } }), {
    canonicalPath: null,
    robotsIndex: false,
  });

  const seo = getDocumentSeoState({
    metadata: {
      canonical: "https://www.cuongdesign.net/gioi-thieu/?x=1",
      robotsIndex: true,
    },
  });
  assert.equal(
    sitemapUrl(
      seo.canonicalPath,
      "/gioi-thieu",
    ),
    "https://cuongdesign.net/gioi-thieu",
  );
  assert.equal(seo.robotsIndex, true);
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
