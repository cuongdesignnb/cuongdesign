import assert from "node:assert/strict";
import test from "node:test";
import { serializeJsonLd } from "../../../seo";

test("JSON-LD serialization escapes closing script tags without changing JSON data", () => {
  const value = {
    "@context": "https://schema.org",
    description: "</script><script>alert('unsafe')</script>",
  };
  const serialized = serializeJsonLd(value);

  assert.doesNotMatch(serialized, /<\/script/i);
  assert.match(serialized, /\\u003c\/script/);
  assert.deepEqual(JSON.parse(serialized), value);
});
