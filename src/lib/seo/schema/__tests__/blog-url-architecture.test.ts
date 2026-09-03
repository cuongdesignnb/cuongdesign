import assert from "node:assert/strict";
import test from "node:test";
import nextConfig from "../../../../../next.config";
import { blogCategoryPath, blogPostPath } from "../../blog-routes";

const exactLegacyRedirects = [
  { source: "/index.html", destination: "/", permanent: true },
  { source: "/contact", destination: "/lien-he", permanent: true },
  { source: "/contact.html", destination: "/lien-he", permanent: true },
  { source: "/dich-vu.html", destination: "/dich-vu", permanent: true },
  { source: "/posts", destination: "/bai-viet", permanent: true },
  { source: "/products", destination: "/san-pham", permanent: true },
];

async function redirects() {
  assert.ok(nextConfig.redirects);
  return nextConfig.redirects();
}

test("configures only the approved exact legacy redirects", async () => {
  assert.deepEqual(await redirects(), exactLegacyRedirects);
});

test("does not configure wildcard redirects that can match current or unknown routes", async () => {
  const rules = await redirects();
  const protectedRoutes = [
    "/bai-viet/chuyen-muc/cong-nghe",
    "/dich-vu/thiet-ke-ui-ux",
    "/du-an/example-slug",
    "/san-pham/example-slug",
    "/careers",
    "/partners",
    "/help",
    "/support",
    "/copyright-policy",
    "/du-an/eduhub-platform",
    "/san-pham/landing-page-template",
  ];

  assert.ok(rules.every((rule) => !rule.source.includes(":") && !rule.source.includes("*")));
  assert.ok(protectedRoutes.every((path) => !rules.some((rule) => rule.source === path)));
});

test("keeps the confirmed bare category alias destination on the current category route", () => {
  assert.equal(blogCategoryPath("cong-nghe"), "/bai-viet/chuyen-muc/cong-nghe");
});

test("builds menu suggestions with the current post and category URL architecture", () => {
  assert.equal(blogPostPath("thiet-ke-ui-ux"), "/bai-viet/thiet-ke-ui-ux");
  assert.equal(blogCategoryPath("cong-nghe"), "/bai-viet/chuyen-muc/cong-nghe");
});
