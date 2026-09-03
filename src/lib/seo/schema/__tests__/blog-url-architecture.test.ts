import assert from "node:assert/strict";
import test from "node:test";
import nextConfig from "../../../../../next.config";
import { blogCategoryPath, blogPostPath } from "../../blog-routes";

test("does not configure a wildcard redirect that can match current category URLs", () => {
  assert.equal(nextConfig.redirects, undefined);
});

test("keeps the confirmed bare category alias destination on the current category route", () => {
  assert.equal(blogCategoryPath("cong-nghe"), "/bai-viet/chuyen-muc/cong-nghe");
});

test("builds menu suggestions with the current post and category URL architecture", () => {
  assert.equal(blogPostPath("thiet-ke-ui-ux"), "/bai-viet/thiet-ke-ui-ux");
  assert.equal(blogCategoryPath("cong-nghe"), "/bai-viet/chuyen-muc/cong-nghe");
});
