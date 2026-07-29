import test from "node:test";
import assert from "node:assert/strict";
import { buildCollectionPageSchema } from "../collection-page";
import { assertSchema } from "./helpers";

test("CollectionPage schema contains ItemList", () => {
  const schema = buildCollectionPageSchema({
    path: "/du-an",
    name: "Dự án",
    items: [{ name: "Example", url: "/du-an/example" }],
  });
  assertSchema(schema, "CollectionPage");
  assert.equal((schema.mainEntity as Record<string, unknown>)["@type"], "ItemList");
});
