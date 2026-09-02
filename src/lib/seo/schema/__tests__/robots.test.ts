import assert from "node:assert/strict";
import test from "node:test";
import robots from "../../../../app/robots";
import { metadata as loginMetadata } from "../../../../app/login/page";
import { CANONICAL_SITE_URL } from "@/config/site";

test("robots permits crawlers to read noindex login and preview pages", () => {
  const policy = robots();
  const rules = policy.rules as { allow?: string; disallow?: string[] };

  assert.equal(rules.allow, "/");
  assert.equal(rules.disallow?.includes("/login"), false);
  assert.equal(rules.disallow?.includes("/preview/"), false);
  assert.deepEqual(rules.disallow, [
    "/admin/",
    "/api/",
    "/draft/",
    "/thanh-toan/",
    "/download/",
  ]);
  assert.equal(policy.sitemap, `${CANONICAL_SITE_URL}/sitemap.xml`);
});

test("login remains crawlable for its noindex, nofollow metadata", () => {
  assert.deepEqual(loginMetadata.robots, { index: false, follow: false });
});
