import assert from "node:assert/strict";
import test from "node:test";
import { CANONICAL_SITE_URL } from "@/config/site";
import { createMetadata } from "../../metadata";
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

test("metadata canonical and Open Graph URL use the same normalized URL", () => {
  const metadata = createMetadata({
    path: "/san-pham/default",
    canonicalPath: "http://cuongdesign.net/san-pham/canonical?sort=newest",
  });

  assert.equal(metadata.alternates?.canonical, "https://cuongdesign.net/san-pham/canonical");
  assert.equal(metadata.openGraph?.url, "https://cuongdesign.net/san-pham/canonical");
});
