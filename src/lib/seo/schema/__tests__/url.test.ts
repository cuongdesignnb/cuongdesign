import assert from "node:assert/strict";
import test from "node:test";
import { CANONICAL_SITE_URL } from "@/config/site";
import { createMetadata, createMetadataFromSeoFields } from "../../metadata";
import {
  absoluteUrl,
  getSiteUrl,
  resolveCanonicalPath,
} from "../../url";

test("canonical URL generation always uses the production non-www HTTPS origin", () => {
  assert.equal(getSiteUrl(), CANONICAL_SITE_URL);
  assert.equal(
    absoluteUrl("http://www.cuongdesign.net/bai-viet/seo?utm_source=google#top"),
    "https://cuongdesign.net/bai-viet/seo",
  );
});

test("canonical overrides keep only approved internal paths", () => {
  assert.equal(
    resolveCanonicalPath("https://www.cuongdesign.net/du-an/demo?page=2", "/du-an/fallback"),
    "/du-an/demo",
  );
  assert.equal(
    resolveCanonicalPath("https://example.com/du-an/demo", "/du-an/fallback"),
    "/du-an/fallback",
  );
});

test("canonical fallbacks preserve the current route when no override is configured", () => {
  assert.equal(resolveCanonicalPath(undefined, "/gioi-thieu"), "/gioi-thieu");
  assert.equal(resolveCanonicalPath(null, "/dich-vu"), "/dich-vu");
  assert.equal(resolveCanonicalPath("", "/du-an"), "/du-an");
  assert.equal(resolveCanonicalPath("   ", "/san-pham"), "/san-pham");
  assert.equal(resolveCanonicalPath("/", "/gioi-thieu"), "/");
  assert.equal(resolveCanonicalPath("/gioi-thieu/", "/fallback"), "/gioi-thieu");
  assert.equal(
    resolveCanonicalPath(
      "https://cuongdesign.net/gioi-thieu?utm_source=test",
      "/fallback",
    ),
    "/gioi-thieu",
  );
  assert.equal(
    resolveCanonicalPath(
      "http://www.cuongdesign.net/gioi-thieu?foo=bar",
      "/fallback",
    ),
    "/gioi-thieu",
  );
  assert.equal(
    resolveCanonicalPath("https://example.com/bad", "/gioi-thieu"),
    "/gioi-thieu",
  );
});

test("metadata canonical and Open Graph URL use the same normalized URL", () => {
  const metadata = createMetadata({
    path: "/san-pham/default",
    canonicalPath: "http://cuongdesign.net/san-pham/canonical?sort=newest",
  });

  assert.equal(metadata.alternates?.canonical, "https://cuongdesign.net/san-pham/canonical");
  assert.equal(metadata.openGraph?.url, "https://cuongdesign.net/san-pham/canonical");
});

test("metadata uses the route path when SEO fields have no canonical override", () => {
  const metadata = createMetadata({
    title: "Giới thiệu",
    path: "/gioi-thieu",
  });
  const fromSeoFields = createMetadataFromSeoFields({
    seo: { title: "Dịch vụ" },
    fallback: { title: "Dịch vụ", description: "Dịch vụ của Cường Design" },
    path: "/dich-vu",
  });

  assert.equal(metadata.alternates?.canonical, "https://cuongdesign.net/gioi-thieu");
  assert.equal(metadata.openGraph?.url, "https://cuongdesign.net/gioi-thieu");
  assert.equal(fromSeoFields.alternates?.canonical, "https://cuongdesign.net/dich-vu");
  assert.equal(fromSeoFields.openGraph?.url, "https://cuongdesign.net/dich-vu");
});
