import test from "node:test";
import assert from "node:assert/strict";
import { buildBreadcrumbSchema } from "../breadcrumb";

test("Breadcrumb schema keeps the final URL", () => {
  const schema = buildBreadcrumbSchema([
    { name: "Trang chủ", href: "/" },
    { name: "Dự án", href: "/du-an/example" },
  ]);
  assert.equal(schema["@context"], "https://schema.org");
  assert.equal(schema.itemListElement.length, 2);
  assert.match(String(schema.itemListElement[1].item), /\/du-an\/example$/);
});
