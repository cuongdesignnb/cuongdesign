import test from "node:test";
import assert from "node:assert/strict";
import { buildCollectionPageSchema } from "../collection-page";
import { assertSchema } from "./helpers";

test("CollectionPage schema contains ItemList", () => {
  const schema = buildCollectionPageSchema({
    path: "/bai-viet/chuyen-muc/cong-nghe",
    name: "Công nghệ",
    items: [{ name: "Example", url: "/bai-viet/thiet-ke-ui-ux" }],
  });
  assertSchema(schema, "CollectionPage");
  assert.equal(schema.url, "https://cuongdesign.net/bai-viet/chuyen-muc/cong-nghe");
  assert.equal((schema.mainEntity as Record<string, unknown>)["@type"], "ItemList");
  assert.equal(
    ((schema.mainEntity as Record<string, unknown>).itemListElement as Record<string, unknown>[])[0].url,
    "https://cuongdesign.net/bai-viet/thiet-ke-ui-ux",
  );
  assert.doesNotMatch(JSON.stringify(schema), /\/bai-viet\/cong-nghe(?:["#?]|$)/);
});
