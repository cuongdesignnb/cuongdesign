import test from "node:test";
import assert from "node:assert/strict";
import { buildBreadcrumbSchema } from "../breadcrumb";

test("Breadcrumb schema keeps the final URL", () => {
  const schema = buildBreadcrumbSchema([
    { name: "Trang chủ", href: "/" },
    { name: "Chuyên mục", href: "/bai-viet/chuyen-muc/cong-nghe" },
    { name: "Bài viết", href: "https://www.cuongdesign.net/bai-viet/thiet-ke-ui-ux?ref=menu" },
  ]);
  assert.equal(schema["@context"], "https://schema.org");
  assert.equal(schema.itemListElement.length, 3);
  assert.equal(schema.itemListElement[0].position, 1);
  assert.equal(schema.itemListElement[1].position, 2);
  assert.equal(schema.itemListElement[2].position, 3);
  assert.equal(schema.itemListElement[1].item, "https://cuongdesign.net/bai-viet/chuyen-muc/cong-nghe");
  assert.equal(schema.itemListElement[2].item, "https://cuongdesign.net/bai-viet/thiet-ke-ui-ux");
});
