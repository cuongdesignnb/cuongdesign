import assert from "node:assert/strict";
import test from "node:test";
import { faviconStorageKey } from "../favicon";

test("uses only same-origin uploaded files for the configured favicon", () => {
  assert.equal(
    faviconStorageKey("/uploads/ai-generated/2026-08/brand-icon.webp"),
    "ai-generated/2026-08/brand-icon.webp",
  );
  assert.equal(
    faviconStorageKey("https://cuongdesign.net/uploads/brand-icon.ico"),
    "brand-icon.ico",
  );
  assert.equal(faviconStorageKey("https://example.com/favicon.ico"), null);
  assert.equal(faviconStorageKey("/images/logo.png"), null);
});
