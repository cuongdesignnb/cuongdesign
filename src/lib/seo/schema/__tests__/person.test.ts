import test from "node:test";
import assert from "node:assert/strict";
import { buildPersonSchema } from "../person";
import { assertSchema } from "./helpers";

test("Person schema uses the official identity", () => {
  const schema = buildPersonSchema();
  assertSchema(schema, "Person");
  assert.equal(schema.name, "Đinh Cường");
});
