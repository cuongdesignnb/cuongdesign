import test from "node:test";
import assert from "node:assert/strict";
import { buildProductSchema } from "../product";
import { assertSchema } from "./helpers";

test("Product schema has a valid Offer for fixed pricing", () => {
  const schema = buildProductSchema({
    slug: "source-code",
    name: "Source code",
    description: "Sản phẩm",
    images: ["/images/og-image.jpg"],
    pricingMode: "FIXED",
    price: 100000,
    currency: "VND",
    availability: "IN_STOCK",
  });
  assertSchema(schema, "Product");
  assert.equal((schema.offers as Record<string, unknown>)["@type"], "Offer");
});
