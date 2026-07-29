import assert from "node:assert/strict";

export function assertSchema(schema: Record<string, unknown>, expectedType: string) {
  assert.equal(schema["@type"], expectedType);
  assert.ok(schema["@id"]);
  assert.doesNotMatch(JSON.stringify(schema), /undefined|https?:\/\/[^"]+https?:\/\//);
}
